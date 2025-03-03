const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { Users, Roles, UserRoles } = require("../../../common/db/models");
require("dotenv").config();

exports.register = async (req, res) => {
  try {
    const { username, email, password, roleName } = req.body;

    // Check if user exists
    const existingUser = await Users.findOne({ where: { email } });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    // Create user
    const newUser = await Users.create({ username, email, password });

    // Find role
    const role = await Roles.findOne({ where: { roleName } });
    if (!role) return res.status(400).json({ message: "Role not found" });

    // Assign role to user
    await UserRoles.create({ userId: newUser.userId, roleId: role.roleId });

    res.status(201).json({ message: "User registered successfully", userId: newUser.userId });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};


exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user with roles
    const user = await Users.findOne({ where: { email }, include: Roles });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.userId, roles: user.Roles.map(role => role.roleName) },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({ token, roles: user.Roles.map(role => role.roleName) });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

exports.assignRole = async (req, res) => {
  try {
    const { userId, roleName } = req.body;
    const adminRole = "Super Admin";
    const managerRole = "Warehouse Manager";
    
    const requestingUser = await Users.findOne({ where: { userId: req.user.userId }, include: Roles });

    if (!requestingUser) return res.status(403).json({ message: "Unauthorized request" });

    const isAdmin = requestingUser.Roles.some(role => role.roleName === adminRole);
    const isManager = requestingUser.Roles.some(role => role.roleName === managerRole);

    // Only Super Admin can assign any role
    if (isAdmin) {
      const role = await Roles.findOne({ where: { roleName } });
      if (!role) return res.status(400).json({ message: "Role not found" });

      await UserRoles.create({ userId, roleId: role.roleId });
      return res.status(200).json({ message: `Assigned role ${roleName} successfully.` });
    }

    // Warehouse Manager can only assign Warehouse Worker or Delivery Agent within their warehouse
    if (isManager) {
      if (!["Warehouse Worker", "Delivery Agent"].includes(roleName)) {
        return res.status(403).json({ message: "Unauthorized to assign this role" });
      }

      const managerWarehouse = await LocationMaster.findOne({ where: { LocationID: req.user.warehouseId } });
      const user = await Users.findOne({ where: { userId } });

      if (user.warehouseId !== managerWarehouse.LocationID) {
        return res.status(403).json({ message: "User must belong to the same warehouse" });
      }

      const role = await Roles.findOne({ where: { roleName } });
      if (!role) return res.status(400).json({ message: "Role not found" });

      await UserRoles.create({ userId, roleId: role.roleId });
      return res.status(200).json({ message: `Assigned role ${roleName} successfully.` });
    }

    return res.status(403).json({ message: "Unauthorized request" });

  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};


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
