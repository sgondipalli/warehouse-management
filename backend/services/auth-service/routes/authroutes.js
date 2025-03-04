const express = require("express");
const authController = require("../controllers/authcontroller");
const authMiddleware = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const { Users, Roles } = require("../../../common/db/models");

const router = express.Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/assign-role", authMiddleware, authController.assignRole);
router.post("/logout", authMiddleware, authController.logout);


//  Protected Routes
router.get("/protected", authMiddleware, async (req, res) => {
  try {
    let userId = req.query.user_id || req.user.id; // ✅ Fix `userId` reference

    const user = await Users.findOne({
      where: { id: userId }, // ✅ Fix `userId` column reference
      include: { model: Roles, through: { attributes: [] } }, // ✅ Fix role association
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      },
      roles: user.Roles.map(role => role.roleName),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});



router.get("/me", authMiddleware, async (req, res) => {
  try {
    console.log("Extracted user from token:", req.user); // Debug log

    const user = await Users.findOne({
      where: { id: req.user.userId }, // Ensure consistency with JWT payload
      include: [
        {
          model: Roles,
          attributes: ["roleName"],
          through: { attributes: [] },
        }
      ],
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      },
      roles: user.Roles.map(role => role.roleName),
    });
  } catch (error) {
    console.error("Error fetching user:", error); // Log full error
    res.status(500).json({ message: "Server error", error });
  }
});



router.get("/admin", authMiddleware, authorize(["Super Admin"]), (req, res) => {
  res.json({ message: "Admin access granted" });
});

router.get("/manager", authMiddleware, authorize(["Warehouse Manager"]), (req, res) => {
  res.json({ message: "Manager access granted" });
});

module.exports = router;
