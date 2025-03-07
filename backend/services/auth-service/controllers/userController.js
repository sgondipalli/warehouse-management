const { Users, UserRoles, Roles } = require("../../../common/db/models");
const bcrypt = require("bcryptjs");

// ✅ Create User (Only Super Admin & Manager)
const createUser = async (req, res) => {
  try {
    const { username, email, password, firstName, lastName, role } = req.body;
    const creatorRole = req.user.role; // Role of the logged-in user

    // Check if email is already registered
    const existingUser = await Users.findOne({ where: { email } });
    if (existingUser) return res.status(400).json({ message: "Email already in use." });

    // Role validation
    if (creatorRole === "Warehouse Manager" && ["Super Admin", "Auditor/Compliance Officer"].includes(role)) {
      return res.status(403).json({ message: "Managers cannot create Admins or Auditors." });
    }

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create User
    const newUser = await Users.create({
      username,
      email,
      password: hashedPassword,
      firstName,
      lastName,
    });

    // Assign Role
    const roleRecord = await Roles.findOne({ where: { roleName: role } });
    if (!roleRecord) return res.status(400).json({ message: "Invalid role provided." });

    await UserRoles.create({ userId: newUser.id, roleId: roleRecord.id });

    res.status(201).json({ message: "User created successfully.", user: newUser });
  } catch (error) {
    console.error("Create User Error:", error);
    res.status(500).json({ message: "Server error, please try again." });
  }
};

// ✅ Update User (Only Super Admin & Manager with restrictions)
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, firstName, lastName, role } = req.body;
    const updaterRole = req.user.role;

    const user = await Users.findByPk(id);
    if (!user) return res.status(404).json({ message: "User not found." });

    // Role-based validation
    if (updaterRole === "Warehouse Manager" && ["Super Admin", "Auditor/Compliance Officer"].includes(role)) {
      return res.status(403).json({ message: "Managers cannot update Admins or Auditors." });
    }

    // Update user fields
    await user.update({ username, email, firstName, lastName });

    res.status(200).json({ message: "User updated successfully." });
  } catch (error) {
    console.error("Update User Error:", error);
    res.status(500).json({ message: "Server error, please try again." });
  }
};

// ✅ Delete User (Only Super Admin & Manager with restrictions)
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const deleterRole = req.user.role;

    const user = await Users.findByPk(id);
    if (!user) return res.status(404).json({ message: "User not found." });

    // Role-based validation
    if (deleterRole === "Warehouse Manager" && ["Super Admin", "Auditor/Compliance Officer"].includes(user.role)) {
      return res.status(403).json({ message: "Managers cannot delete Admins or Auditors." });
    }

    await user.destroy();
    res.status(200).json({ message: "User deleted successfully." });
  } catch (error) {
    console.error("Delete User Error:", error);
    res.status(500).json({ message: "Server error, please try again." });
  }
};

module.exports = { createUser, updateUser, deleteUser };
