const express = require("express");
const { createUser, updateUser, deleteUser } = require("../controllers/userController");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

router.post("/register", authMiddleware, createUser); // Create User
router.put("/update-user/:id", authMiddleware, updateUser); // Update User
router.delete("/delete-user/:id", authMiddleware, deleteUser); // Delete User

module.exports = router;
