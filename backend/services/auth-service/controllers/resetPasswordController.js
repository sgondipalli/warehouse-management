const { Users } = require("../../../common/db/models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const resetPassword = async (req, res) => {
  const { token, password } = req.body;

  try {
    // Verify the JWT reset token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user by email extracted from token
    const user = await Users.findOne({ where: { email: decoded.email } });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token." });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user password
    await Users.update({ password: hashedPassword }, { where: { id: user.id } });

    res.status(200).json({ message: "Password reset successfully." });
  } catch (error) {
    console.error("Error resetting password:", error);
    
    if (error.name === "TokenExpiredError") {
      return res.status(400).json({ message: "Reset token has expired. Please request a new one." });
    }

    res.status(500).json({ message: "Server error, try again later." });
  }
};

module.exports = { resetPassword };
