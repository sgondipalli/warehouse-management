const { Users, UserRoles, Roles, UserLocationAccess, sequelize } = require("../../../common/db/models");
const bcrypt = require("bcryptjs");
const logger = require('../../../common/utils/logger');
const { isRoleRestrictedByManager, canAssignLocations } = require("../../../common/utils/roleValidator");

// Create User (Only Super Admin & Manager)
const createUser = async (req, res) => {
  const t = await sequelize.transaction(); //  Start a transaction
  try {
    const { username, email, password, firstName, lastName, role, locationIds } = req.body;
    const creatorRole = req.user.role;
    const creatorId = req.user.id;
    
     // Validate required fields
    if (!username || !email || !password || !firstName || !lastName || !role) {
      logger.warn("Create user failed: Missing required fields", { requestedBy: creatorRole });
      return res.status(400).json({ message: "All fields are required." });
    }

    if (isRoleRestrictedByManager(creatorRole, role)) {
      return res.status(403).json({ message: "Managers cannot create Admins or Auditors." });
    }
    
    // Check if email is already registered
    const existingUser = await Users.findOne({ where: { email }, transaction: t });

    if (existingUser) {
      if (existingUser.isDeleted) {
        logger.warn("Attempt to re-create previously deleted user", { email });
        return res.status(400).json({ message: "User was deleted. Allowing rejoin.", userId: existingUser.id });
      }
      logger.warn("Attempt to create user with existing email", { email });
      return res.status(400).json({ message: "Email already in use." });
    }
    
    // Check if username already exists
    const existingUsername = await Users.findOne({ where: { username }, transaction: t });
    if (existingUsername) {
      logger.warn("Attempt to create user with existing username", { username });
      return res.status(400).json({ message: "Username is already taken." });
    }

    // Role validation
    if (creatorRole === "Warehouse Manager" && ["Super Admin", "Auditor/Compliance Officer"].includes(role)) {
      logger.warn("Unauthorized role assignment attempt", { creatorRole, attemptedRole: role });
      return res.status(403).json({ message: "Managers cannot create Admins or Auditors." });
    }

    if (canAssignLocations(role) && (!Array.isArray(locationIds) || locationIds.length === 0)) {
      return res.status(400).json({ message: "Please assign at least one location." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await Users.create({
      username,
      email: email.toLowerCase(),
      password: hashedPassword,
      firstName,
      lastName,
      isDeleted: false
    }, { transaction: t });

    const roleRecord = await Roles.findOne({ where: { roleName: role }, transaction: t });
    if (!roleRecord) {
      logger.warn("Invalid role provided during user creation", { role });
      await t.rollback(); // Rollback transaction
      return res.status(400).json({ message: "Invalid role provided." });
    }

    await UserRoles.create({ userId: newUser.id, roleId: roleRecord.id }, { transaction: t });

    // Assign Locations (Only if not Super Admin)
    // Assign Locations (Only if not Super Admin)

    if (Array.isArray(locationIds) && locationIds.length > 0) {
      if (creatorRole === "Super Admin") {
        // Super Admin can assign any location
        for (const locId of locationIds) {
          await UserLocationAccess.create({ userId: newUser.id, locationId: locId }, { transaction: t });
        }
      } else if (creatorRole === "Warehouse Manager") {
        const managerLocations = await UserLocationAccess.findAll({ where: { userId: creatorId }, transaction: t });
        const allowedLocationIds = managerLocations.map((l) => l.locationId);

        // Check if all assigned locations are within allowed ones
        const unauthorized = locationIds.filter((locId) => !allowedLocationIds.includes(locId));
        if (unauthorized.length > 0) {
          logger.warn("Manager attempted to assign unauthorized locations", {
            managerId: creatorId,
            unauthorized,
          });
          await t.rollback(); // Rollback
          return res.status(403).json({
            message: "You cannot assign locations you do not have access to.",
            unauthorized,
          });
        }
        // Safe to assign
        for (const locId of locationIds) {
          await UserLocationAccess.create({ userId: newUser.id, locationId: locId }, { transaction: t });
        }
      } else {
        logger.warn("Unauthorized location assignment attempt", { creatorRole });
        await t.rollback();
        return res.status(403).json({ message: "You are not allowed to assign locations." });
      }
    }

    await t.commit(); // Commit transaction if all went well

    logger.info("User created successfully", { userId: newUser.id, createdBy: creatorRole });
    res.status(201).json({
      message: "User created successfully.",
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        role,
      },
    });

  } catch (error) {
    await t.rollback(); // Rollback in case of error
    logger.error("Create user error", { error: error.message });
    console.error("Create User Error:", error);
    res.status(500).json({ message: "Server error, please try again." });
  }
};

// Update User

const updateUser = async (req, res) => {
  const t = await sequelize.transaction(); // Start transaction
  try {
    const { id } = req.params;
    const { username, email, firstName, lastName, role, locationIds } = req.body;
    const updaterRole = req.user.role;
    const updaterId = req.user.id;

    const user = await Users.findByPk(id, { transaction: t });
    if (!user) {
      logger.warn("Attempt to update non-existent user", { userId: id });
      await t.rollback();
      return res.status(404).json({ message: "User not found." });
    }

    // Role restrictions
    if (updaterRole === "Warehouse Manager" && ["Super Admin", "Auditor/Compliance Officer"].includes(role)) {
      logger.warn("Unauthorized role update attempt", { updaterRole, targetRole: role });
      await t.rollback();
      return res.status(403).json({ message: "Managers cannot update Admins or Auditors." });
    }

    // Update basic profile fields
    await user.update({ username, email, firstName, lastName }, { transaction: t });

    // Update role if provided
    if (role) {
      const roleRecord = await Roles.findOne({ where: { roleName: role }, transaction: t });
      if (!roleRecord) {
        logger.warn("Invalid role during user update", { role });
        await t.rollback();
        return res.status(400).json({ message: "Invalid role provided." });
      }
      await UserRoles.update({ roleId: roleRecord.id }, { where: { userId: id }, transaction: t });
    }

    // Update locations if applicable
    if (Array.isArray(locationIds) && updaterRole !== "Super Admin") {
      const managerLocations = await UserLocationAccess.findAll({ where: { userId: updaterId }, transaction: t });
      const allowedLocationIds = managerLocations.map((l) => l.locationId);

      const unauthorized = locationIds.filter((locId) => !allowedLocationIds.includes(locId));
      if (unauthorized.length > 0) {
        logger.warn("Unauthorized location assignment during user update", { updaterId, unauthorized });
        await t.rollback();
        return res.status(403).json({
          message: "You cannot assign locations you do not have access to.",
          unauthorized,
        });
      }
    }

    if (Array.isArray(locationIds)) {
      await UserLocationAccess.destroy({ where: { userId: id }, transaction: t });
      for (const locId of locationIds) {
        await UserLocationAccess.create({ userId: id, locationId: locId }, { transaction: t });
      }
    }

    await t.commit(); // All successful, commit transaction

    logger.info("User updated successfully", { userId: id, updatedBy: updaterRole });
    res.status(200).json({ message: "User updated successfully." });
  } catch (error) {
    await t.rollback(); // Rollback on failure
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
    const { newRole, locationIds = [] } = req.body;
    const restorerRole = req.user.role;
    const restorerId = req.user.id;

    const user = await Users.findByPk(id);
    if (!user || !user.isDeleted) {
      logger.warn("Attempt to restore user not marked as deleted", { userId: id });
      return res.status(400).json({ message: "User is not marked as deleted." });
    }
    // Role restriction check for Manager
    if (isRoleRestrictedByManager(restorerRole, newRole)) {
      return res.status(403).json({ message: "Managers cannot restore users to Admin or Auditor roles." });
    }
    // Validate location assignment if required
    if (canAssignLocations(newRole)) {
      if (!Array.isArray(locationIds) || locationIds.length === 0) {
        return res.status(400).json({ message: "Please assign at least one location." });
      }

      if (restorerRole === "Warehouse Manager") {
        const managerLocations = await UserLocationAccess.findAll({ where: { userId: restorerId } });
        const allowedLocationIds = managerLocations.map((l) => l.locationId);

        const unauthorized = locationIds.filter((locId) => !allowedLocationIds.includes(locId));
        if (unauthorized.length > 0) {
          return res.status(403).json({
            message: "You cannot assign locations you do not have access to.",
            unauthorized,
          });
        }
      }
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
