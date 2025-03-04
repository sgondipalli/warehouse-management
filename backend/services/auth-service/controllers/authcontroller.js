const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { Users, Roles, UserRoles } = require("../../../common/db/models");
require("dotenv").config();


// ✅ **Register a new user**
exports.register = async (req, res) => {
  try {
    const { username, email, password, roleName } = req.body;

    // Check if user already exists
    const existingUser = await Users.findOne({ where: { email } });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    // Create the new user
    const newUser = await Users.create({ username, email, password });

    // Find the requested role
    const role = await Roles.findOne({ where: { roleName } });
    if (!role) return res.status(400).json({ message: "Role not found" });

    // Assign the role to the user
    await UserRoles.create({ userId: newUser.id, roleId: role.id });  // ✅ FIXED (use `id` instead of `roleId`)

    res.status(201).json({ message: "User registered successfully", userId: newUser.id });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};


// ✅ **Login & Authenticate User**
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("🔍 Login attempt:", email);

    // Find user
    const user = await Users.findOne({
      where: { email },
      include: [
        {
          model: Roles,
          through: UserRoles,
          attributes: ["id", "roleName"]
        }
      ]
    });

    if (!user) {
      console.log("❌ User not found");
      return res.status(401).json({ message: "Invalid credentials" });
    }

    console.log("✅ User found:", user.dataValues);

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    console.log("🔍 Password match result:", isMatch);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, roles: user.Roles.map(role => role.roleName) },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    console.log("✅ Token generated:", token);

    res.status(200).json({
      user: {
        user_id: user.id,
        username: user.username,
        email: user.email
      },
      roles: user.Roles.map(role => role.roleName),
      token
    });
  } catch (error) {
    console.error("❌ Login Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};



// ✅ **Assign Roles to Users**
exports.assignRole = async (req, res) => {
  try {
    const { userId, roleName } = req.body;
    const adminRole = "Super Admin";
    const managerRole = "Warehouse Manager";

    // Fetch the requesting user's roles
    const requestingUser = await Users.findOne({
      where: { id: req.user.userId },
      include: Roles,
    });

    if (!requestingUser) {
      return res.status(403).json({ message: "Unauthorized request" });
    }

    const isAdmin = requestingUser.Roles.some(role => role.roleName === adminRole);
    const isManager = requestingUser.Roles.some(role => role.roleName === managerRole);

    // Fetch the role to be assigned
    const role = await Roles.findOne({ where: { roleName } });
    if (!role) return res.status(400).json({ message: "Role not found" });

    // 🛠️ **Super Admin can assign any role**
    if (isAdmin) {
      await UserRoles.create({ userId, roleId: role.id });  // ✅ FIXED

      // Fetch updated roles for the user
      const updatedUser = await Users.findOne({ where: { id: userId }, include: Roles });

      return res.status(200).json({
        message: `Assigned role ${roleName} successfully.`,
        roles: updatedUser.Roles.map(role => role.roleName),
      });
    }

    // 🛠️ **Warehouse Manager can assign only Warehouse Worker or Delivery Agent**
    if (isManager) {
      if (!["Warehouse Worker", "Delivery Agent"].includes(roleName)) {
        return res.status(403).json({ message: "Unauthorized to assign this role" });
      }

      // Get the user to whom the role is being assigned
      const user = await Users.findOne({ where: { id: userId } });

      // Assign the role
      await UserRoles.create({ userId, roleId: role.id });  // ✅ FIXED

      // Fetch updated roles for the user
      const updatedUser = await Users.findOne({ where: { id: userId }, include: Roles });

      return res.status(200).json({
        message: `Assigned role ${roleName} successfully.`,
        roles: updatedUser.Roles.map(role => role.roleName),
      });
    }

    return res.status(403).json({ message: "Unauthorized request" });

  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};


// ✅ **Logout User**
exports.logout = async (req, res) => {
  try {
    req.session.destroy((err) => {
      if (err) return res.status(500).json({ message: "Logout failed" });
      res.status(200).json({ message: "Logged out successfully" });
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
