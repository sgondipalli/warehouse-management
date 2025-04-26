const express = require("express");
const authController = require("../controllers/authcontroller"); // Ensure Correct Path
const authMiddleware = require("../middleware/auth");
const { forgotPassword } = require("../controllers/forgotPasswordController");
const { resetPassword } = require("../controllers/resetPasswordController");

const router = express.Router();

//  Debugging: Ensure `authController` is imported correctly
if (!authController || !authController.login || !authController.register) {
  console.error(" authController functions are missing! Ensure `authcontroller.js` exports all functions.");
}

//  Define Routes
// router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/refresh", authController.refresh);
router.post("/login/okta", authController.loginWithOkta);
router.get("/me", authMiddleware, authController.getUserDetails); // Get User Details
router.get("/users", authMiddleware, authController.getAllUsers);
router.post("/logout", authMiddleware, authController.logout);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.put('/edit-profile', authMiddleware, authController.editUserProfile);


module.exports = router;
