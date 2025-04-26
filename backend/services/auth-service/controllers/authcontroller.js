const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const OpenIDConnectStrategy = require("passport-openidconnect").Strategy;
const OktaJwtVerifier = require("@okta/jwt-verifier");
const { Users, Roles, UserRoles, UserLocationAccess } = require("../../../common/db/models");
const logger = require('../../../common/utils/logger');
const { LocationMaster, AddressTable } = require("../../../common/db/models");
require("dotenv").config();

// Initialize Okta JWT Verifier
const oktaJwtVerifier = new OktaJwtVerifier({
  issuer: "https://dev-69702302.okta.com/oauth2/default",
  clientId: process.env.OKTA_CLIENT_ID,
  assertClaims: { aud: "api://default" },
});


// ** Fetch all users with their assigned roles **
exports.getAllUsers = async (req, res) => {
  try {
    const requesterRole = req.user.roles[0]; 
    const requesterId = req.user.userId;

    let userWhereClause = { isDeleted: false };

    let allowedUserIds = [];

    if (requesterRole === "Warehouse Manager") {
      const managerLocations = await UserLocationAccess.findAll({
        where: { userId: requesterId },
      });
      const allowedLocationIds = managerLocations.map((loc) => loc.locationId);

      if (allowedLocationIds.length > 0) {
        const userLocationAccesses = await UserLocationAccess.findAll({
          where: { locationId: allowedLocationIds },
          attributes: ['userId'],
          group: ['userId'],
        });
        allowedUserIds = userLocationAccesses.map(u => u.userId);

        userWhereClause.id = allowedUserIds.length > 0 ? allowedUserIds : [-1];
      } else {
        userWhereClause.id = [-1];
      }
    }

    const users = await Users.findAll({
      where: userWhereClause,
      attributes: ["id", "username", "email", "firstName", "lastName", "isActive", "createdAt"],
      include: [
        {
          model: Roles,
          as: "Roles",
          through: { model: UserRoles, attributes: [] },
          attributes: ["roleName"],
        },
        {
          model: UserLocationAccess,
          as: "UserLocationAccesses",
          include: [
            {
              model: LocationMaster,
              as: "Location",
              attributes: ["LocationID", "LocationName"],
              include: [{ model: AddressTable, as: "AddressTable", attributes: ["City"] }]
            }
          ]
        }
      ],
    });

    // Additional filter after fetching:
    const formattedUsers = users
      .filter(user => {
        if (requesterRole === "Warehouse Manager") {
          // Manager should not see Admins or Auditors
          return !["Super Admin", "Auditor/Compliance Officer"].includes(user.Roles[0]?.roleName);
        }
        return true; // Super Admin sees all
      })
      .map(user => ({
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isActive: user.isActive,
        createdAt: user.createdAt,
        role: user.Roles.length > 0 ? user.Roles[0].roleName : "No Role Assigned",
        locations: user.UserLocationAccesses?.map(access => {
          const loc = access.Location;
          const city = loc?.AddressTable?.City || "N/A";
          return `${loc?.LocationName} (${city})`;
        }) || []
      }));

    logger.info('Fetched users successfully', { count: formattedUsers.length });
    res.status(200).json(formattedUsers);
  } catch (error) {
    console.error("Error fetching users:", error);
    logger.error("Error fetching users", { error: error.message });
    res.status(500).json({ message: "Internal Server Error" });
  }
};




// **Register a New User**
exports.register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // Check if user already exists
    let existingUser = await Users.findOne({ where: { email } });

    if (existingUser) {
      if (existingUser.isDeleted) {
        // Prompt to restore user instead of creating a new one
        return res.status(400).json({
          message: "User was previously deleted. Would you like to restore them?",
          userId: existingUser.id
        });
      }
      logger.warn("Attempt to register existing active user", { email });
      return res.status(400).json({ message: "User already exists." });
    }

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = await Users.create({
      username,
      email,
      password: hashedPassword,
      isDeleted: false, // Ensure they are active
    });

    // Assign Role
    const roleRecord = await Roles.findOne({ where: { roleName: role } });
    if (!roleRecord) {
      logger.warn("Invalid role provided during registration", { email, role });
      return res.status(400).json({ message: "Invalid role provided." });
    }
    await UserRoles.create({ userId: newUser.id, roleId: roleRecord.id });

    logger.info("User registered successfully", { userId: newUser.id, email, role });
    res.status(201).json({ message: "User registered successfully.", user: newUser });
  } catch (error) {
    logger.error("Registration error", { error: error.message });
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Server error, please try again." });
  }
};




// **Login & Authenticate User**
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await Users.findOne({
      where: { email },
      include: [{ model: Roles, through: UserRoles, attributes: ["roleName"] }],
    });
    console.log("Fetched User Data:", JSON.stringify(user, null, 2));

    if (!user) {
      logger.warn("Login attempt with invalid email", { email });
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    // Generate JWT Token
    const accessToken = jwt.sign(
      { userId: user.id, roles: user.Roles.map(r => r.roleName) },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );
    logger.info("User login successful", { userId: user.id, email });
    // 🔑 Generate Refresh Token
    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false, // Set to true in production
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.json({
      accessToken,
      user: { id: user.id, username: user.username, email: user.email, lastName: user.lastName, firstName: user.firstName },
      roles: user.Roles.map(role => role.roleName),
    });
  } catch (error) {
    logger.error("Error during login", { error: error.message });
    res.status(500).json({ message: "Server error", error });
  }
};

// **Get User Details After Authentication**
exports.getUserDetails = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    let user;
    try {
      // Try verifying as internal JWT (Email/Password Login)
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      user = await Users.findOne({
        where: { id: decoded.userId },
        include: [{ model: Roles, attributes: ["roleName"], through: { attributes: [] } }],
      });
    } catch (error) {
      console.log("JWT verification failed. Checking Okta token...");
      try {
        // Check if it's an Okta token
        const jwtClaims = await oktaJwtVerifier.verifyAccessToken(token, "api://default");
        user = await Users.findOne({ where: { email: jwtClaims.claims.email } });
      } catch (err) {
        console.error("Invalid Okta token:", err);
        return res.status(401).json({ message: "Unauthorized - Invalid Token" });
      }
    }

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      user: { id: user.id, username: user.username, email: user.email, firstName: user.firstName || user.username?.split(" ")[0] || "User", lastName: user.lastName, },
      roles: user.Roles ? user.Roles.map(role => role.roleName) : [],
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(401).json({ message: "Unauthorized" });
  }
};

exports.refresh = async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ message: "No refresh token" });

  try {
    const decoded = jwt.verify(token, process.env.REFRESH_SECRET);
    const user = await Users.findByPk(decoded.userId, {
      include: [{ model: Roles, through: UserRoles, attributes: ["roleName"] }]
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    const newAccessToken = jwt.sign(
      { userId: user.id, roles: user.Roles.map(r => r.roleName) },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    res.json({
      token: newAccessToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName || user.username?.split(" ")[0] || "User",
        lastName: user.lastName
      },
      roles: user.Roles.map(r => r.roleName),
    });

  } catch (err) {
    res.status(403).json({ message: "Refresh token invalid" });
  }
};



// **Login with Okta**
exports.loginWithOkta = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: "Token is required" });

    // Verify Okta Token
    const jwtClaims = await oktaJwtVerifier.verifyAccessToken(token, "api://default");

    // Extract User Information from Okta JWT
    const { sub, email, name } = jwtClaims.claims;

    // Check if the user exists in DB, if not create a new record
    let user = await Users.findOne({ where: { email } });

    if (!user) {
      user = await Users.create({ username: name, email, password: null });
    }

    // Generate Internal JWT Token (to maintain session)
    const internalToken = jwt.sign(
      { userId: user.id, roles: [] }, // Add role handling here if needed
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      token: internalToken,
      user: { id: user.id, username: user.username, email: user.email },
      roles: [], // Fetch user roles if required
    });
  } catch (error) {
    console.error("Error verifying Okta token:", error);
    res.status(401).json({ message: "Invalid Okta token" });
  }
};

// **Get User Details (Supports Okta & Email/Password)**
exports.getUserDetails = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    let user;
    try {
      // Try verifying as internal JWT (Email/Password Login)
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      user = await Users.findOne({
        where: { id: decoded.userId },
        include: [{ model: Roles, attributes: ["roleName"], through: { attributes: [] } }],
      });
    } catch {
      // If JWT verification fails, check if it's an Okta token
      const jwtClaims = await oktaJwtVerifier.verifyAccessToken(token, "api://default");
      user = await Users.findOne({ where: { email: jwtClaims.claims.email } });
    }

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      user: { id: user.id, username: user.username, email: user.email },
      roles: user.Roles ? user.Roles.map(role => role.roleName) : [],
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(401).json({ message: "Unauthorized" });
  }
};


/* edit profile api*/
exports.editUserProfile = async (req, res) => {
  const userId = req.user.userId;
  const { username, password, firstName, lastName, locationIds } = req.body;

  try {
    const user = await Users.findByPk(userId);
    if (!user) {
      logger.warn("Edit profile attempt for non-existent user", { userId });
      return res.status(404).json({ message: "User not found." });
    }

    // Check if username is taken by another user
    if (username && username !== user.username) {
      const existingUsername = await Users.findOne({ where: { username } });
      if (existingUsername) {
        logger.warn("Username already exists", { username });
        return res.status(400).json({ message: "Username is already taken." });
      }
    }


    // Prepare update data
    const updateData = {
      username: username || user.username,
      firstName: firstName || user.firstName,
      lastName: lastName || user.lastName,
    };

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    await user.update(updateData);

    if (Array.isArray(locationIds) && !req.user.roles.includes("Super Admin")) {
      await UserLocationAccess.destroy({ where: { userId } });
      for (const locationId of locationIds) {
        await UserLocationAccess.create({ userId, locationId });
      }
    }

    logger.info("Profile updated successfully", { userId });
    res.json({
      message: "Profile updated successfully",
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (error) {
    logger.error("Error updating user profile", { error: error.message });
    res.status(500).json({ message: "Internal server error." });
  }
};


// **Logout User**
exports.logout = async (req, res) => {
  try {
    res.clearCookie("refreshToken");
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
