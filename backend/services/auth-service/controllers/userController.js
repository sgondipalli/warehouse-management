const { Users, UserRoles, Roles } = require("../../../common/db/models");
const bcrypt = require("bcryptjs");
const logger = require('../../../common/utils/logger');

// Create User (Only Super Admin & Manager)
const createUser = async (req, res) => {
  try {
    const { username, email, password, firstName, lastName, role } = req.body;
    const creatorRole = req.user.role;

    // Validate required fields
    if (!username || !email || !password || !firstName || !lastName || !role) {
      logger.warn("Create user failed: Missing required fields", { requestedBy: creatorRole });
      return res.status(400).json({ message: "All fields are required." });
    }

    // Check if email is already registered
    const existingUser = await Users.findOne({ where: { email } });

    if (existingUser) {
      if (existingUser.isDeleted) {
        logger.warn("Attempt to re-create previously deleted user", { email });
        return res.status(400).json({ message: "User was deleted. Allowing rejoin.", userId: existingUser.id });
      }
      logger.warn("Attempt to create user with existing email", { email });
      return res.status(400).json({ message: "Email already in use." });
    }

    // Check if username already exists
    const existingUsername = await Users.findOne({ where: { username } });
    if (existingUsername) {
      logger.warn("Attempt to create user with existing username", { username });
      return res.status(400).json({ message: "Username is already taken." });
    }

    // Role validation
    if (creatorRole === "Warehouse Manager" && ["Super Admin", "Auditor/Compliance Officer"].includes(role)) {
      logger.warn("Unauthorized role assignment attempt", { creatorRole, attemptedRole: role });
      return res.status(403).json({ message: "Managers cannot create Admins or Auditors." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await Users.create({ username, email, password: hashedPassword, firstName, lastName, isDeleted: false });

    const roleRecord = await Roles.findOne({ where: { roleName: role } });
    if (!roleRecord){
      logger.warn("Invalid role provided during user creation", { role }); 
      return res.status(400).json({ message: "Invalid role provided." });
    }

    await UserRoles.create({ userId: newUser.id, roleId: roleRecord.id });

    logger.info("User created successfully", { userId: newUser.id, createdBy: creatorRole });
    res.status(201).json({ message: "User created successfully.", user: newUser });
  } catch (error) {
    logger.error("Create user error", { error: error.message });
    console.error("Create User Error:", error);
    res.status(500).json({ message: "Server error, please try again." });
  }
};

// Update User
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, firstName, lastName, role } = req.body;
    const updaterRole = req.user.role;

    const user = await Users.findByPk(id);
    if (!user){
      logger.warn("Attempt to update non-existent user", { userId: id }); 
      return res.status(404).json({ message: "User not found." });
    }

    if (updaterRole === "Warehouse Manager" && ["Super Admin", "Auditor/Compliance Officer"].includes(role)) {
      logger.warn("Unauthorized user update attempt", { updaterRole, targetRole: role });
      return res.status(403).json({ message: "Managers cannot update Admins or Auditors." });
    }

    await user.update({ username, email, firstName, lastName });
    
    logger.info("User updated successfully", { userId: user.id, updatedBy: updaterRole });
    res.status(200).json({ message: "User updated successfully." });
  } catch (error) {
    logger.error("Update user error", { error: error.message });
    console.error("Update User Error:", error);
    res.status(500).json({ message: "Server error, please try again." });
  }
};

// Soft Delete User (Marks as Deleted)
const softDeleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const deleterRole = req.user.role;

    const user = await Users.findByPk(id);
    if (!user) {
      logger.warn("Attempt to delete non-existent user", { userId: id });
      return res.status(404).json({ message: "User not found." });
    }

    if (deleterRole === "Warehouse Manager" && ["Super Admin", "Auditor/Compliance Officer"].includes(user.role)) {
      logger.warn("Unauthorized delete attempt", { deleterRole, targetUserRoles: userRoles });
      return res.status(403).json({ message: "Managers cannot delete Admins or Auditors." });
    }

    await user.update({ isDeleted: true });
  
    logger.info("User soft-deleted successfully", { userId: user.id, deletedBy: deleterRole });
    res.status(200).json({ message: "User marked as deleted (soft delete)." });
  } catch (error) {
    logger.error("Soft delete user error", { error: error.message });
    console.error("Soft Delete User Error:", error);
    res.status(500).json({ message: "Server error, please try again." });
  }
};

// Restore Deleted User
const restoreUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { newRole } = req.body;

    const user = await Users.findByPk(id);
    if (!user || !user.isDeleted){ 
      logger.warn("Attempt to restore user not marked as deleted", { userId: id });
      return res.status(400).json({ message: "User is not marked as deleted." });
    }

    await user.update({ isDeleted: false });

    if (newRole) {
      const roleRecord = await Roles.findOne({ where: { roleName: newRole } });
      if (roleRecord) {
        await UserRoles.update({ roleId: roleRecord.id }, { where: { userId: user.id } });
      } else {
        logger.warn("Invalid role provided during user restoration", { newRole });
      }
    }

    logger.info("User restored successfully", { userId: user.id });
    res.status(200).json({ message: "User restored successfully.", user });
  } catch (error) {
    logger.error("Restore user error", { error: error.message });
    console.error("Restore User Error:", error);
    res.status(500).json({ message: "Server error, please try again." });
  }
};

// Get Deleted Users
const getDeletedUsers = async (req, res) => {
  try {
    const users = await Users.findAll({ where: { isDeleted: true } });
    logger.info("Fetched deleted users", { count: users.length });
    res.status(200).json(users);
  } catch (error) {
    logger.error("Get deleted users error", { error: error.message });
    console.error("Get Deleted Users Error:", error);
    res.status(500).json({ message: "Server error, please try again." });
  }
};

module.exports = { createUser, updateUser, softDeleteUser, restoreUser, getDeletedUsers };
