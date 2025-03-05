const express = require("express");
const authController = require("../controllers/authcontroller"); // Ensure Correct Path
const authMiddleware = require("../middleware/auth");

const router = express.Router();

//  Debugging: Ensure `authController` is imported correctly
if (!authController || !authController.login || !authController.register) {
  console.error(" authController functions are missing! Ensure `authcontroller.js` exports all functions.");
}

//  Define Routes
router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/me", authMiddleware, authController.getUserDetails); // Get User Details
router.post("/logout", authMiddleware, authController.logout);

module.exports = router;
