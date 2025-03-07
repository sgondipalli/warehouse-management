const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const OpenIDConnectStrategy = require("passport-openidconnect").Strategy;
const OktaJwtVerifier = require("@okta/jwt-verifier");
const { Users, Roles, UserRoles } = require("../../../common/db/models");
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
    const users = await Users.findAll({
      attributes: ["id", "username", "email", "firstName", "lastName", "isActive", "createdAt"],
      include: [
        {
          model: Roles,
          as: "Roles", 
          through: { model: UserRoles, attributes: [] }, // Exclude UserRoles table from response
          attributes: ["roleName"], // Fetch only assigned roles
        },
      ],
    });

    // Format response to structure roles correctly
    const formattedUsers = users.map(user => ({
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isActive: user.isActive,
      createdAt: user.createdAt,
      role: user.Roles.length > 0 ? user.Roles[0].roleName : "No Role Assigned", // Extract **only assigned** roles
    }));

    res.status(200).json(formattedUsers);
  } catch (error) {
    console.error("Error fetching users with roles:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};



// **Register a New User**
exports.register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    const existingUser = await Users.findOne({ where: { email } });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await Users.create({ username, email, password: hashedPassword });

    let assignedRole = null;
    if (role) {
      assignedRole = await Roles.findOne({ where: { roleName: role } });
      if (assignedRole) {
        await UserRoles.create({ userId: newUser.id, roleId: assignedRole.id });
      }
    }

    // Return the created user with assigned role
    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: assignedRole ? assignedRole.roleName : "No Role Assigned",
      },
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Server error", error });
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

    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    // Generate JWT Token
    const token = jwt.sign(
      { userId: user.id, roles: user.Roles.map(role => role.roleName) },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      token,
      user: { id: user.id, username: user.username, email: user.email },
      roles: user.Roles.map(role => role.roleName),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// **Get User Details After Authentication**
exports.getUserDetails = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await Users.findOne({
      where: { id: decoded.userId },
      include: [{ model: Roles, attributes: ["roleName"], through: { attributes: [] } }],
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      user: { id: user.id, username: user.username, email: user.email },
      roles: user.Roles.map(role => role.roleName),
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(401).json({ message: "Unauthorized" });
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

// **Logout User**
exports.logout = async (req, res) => {
  try {
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
