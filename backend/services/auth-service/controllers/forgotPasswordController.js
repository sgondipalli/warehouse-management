const { Users } = require("../../../common/db/models");
const sendEmail = require("../utils/emailSender");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    // Check if the user exists
    const user = await Users.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: "No account found with this email." });
    }

    // **For Okta Users → Redirect to Okta Reset Page**
    if (user.authProvider === "okta") {
      const oktaResetLink = `https://${process.env.OKTA_DOMAIN}/signin/reset-password`;
      return res.json({ message: "Redirecting to Okta password reset", redirectTo: oktaResetLink });
    }

    // **For Non-Okta Users → Generate JWT Token for Reset**
    const resetToken = jwt.sign(
      { userId: user.id, email },
      process.env.JWT_SECRET,
      { expiresIn: "15m" } // Token expires in 15 minutes
    );

    // **Generate Password Reset Link**
    const resetLink = `http://localhost:3000/reset-password?token=${resetToken}`;

    // **Send Email**
    const emailSent = await sendEmail({
      to: email,
      subject: "Password Reset Request",
      html: `
        <p>Hi ${user.firstName},</p>
        <p>You requested to reset your password. Click the link below:</p>
        <p><a href="${resetLink}">${resetLink}</a></p>
        <p>This link will expire in 15 minutes.</p>
        <p>If you did not request this, please ignore this email.</p>
      `,
    });

    if (!emailSent) {
      return res.status(500).json({ message: "Failed to send the email. Please try again." });
    }

    res.status(200).json({ message: "Password reset email sent successfully." });
  } catch (err) {
    console.error("Error in forgotPassword:", err);
    res.status(500).json({ message: "An error occurred while processing your request." });
  }
};

module.exports = { forgotPassword };
