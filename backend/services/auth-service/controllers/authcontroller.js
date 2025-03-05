const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { Users, Roles, UserRoles } = require("../../../common/db/models");
require("dotenv").config();

// **Register a New User**
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await Users.findOne({ where: { email } });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await Users.create({ username, email, password: hashedPassword });

    res.status(201).json({ message: "User registered successfully", userId: newUser.id });
  } catch (error) {
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

// **Logout User**
exports.logout = async (req, res) => {
  try {
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
