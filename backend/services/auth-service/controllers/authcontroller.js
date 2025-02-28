const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { Users, Roles, UserRoles } = require("../../common/db/models");
require("dotenv").config();

exports.register = async (req, res) => {
  try {
    const { username, email, password, roleName } = req.body;

    const existingUser = await Users.findOne({ where: { email } });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const newUser = await Users.create({ username, email, password });

    const role = await Roles.findOne({ where: { roleName } });
    if (!role) return res.status(400).json({ message: "Role not found" });

    await UserRoles.create({ userId: newUser.userId, roleId: role.roleId });

    res.status(201).json({ message: "User registered successfully", userId: newUser.userId });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await Users.findOne({ where: { email }, include: Roles });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ userId: user.userId, roles: user.Roles }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
