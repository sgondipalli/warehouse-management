const express = require("express");
const { createUser, updateUser, softDeleteUser, restoreUser, getDeletedUsers } = require("../controllers/userController");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

router.post("/register", authMiddleware, createUser); // Create User
router.put("/update-user/:id", authMiddleware, updateUser); // Update User
router.delete("/delete-user/:id", authMiddleware, softDeleteUser); // Soft Delete User
router.post("/restore-user/:id", authMiddleware, restoreUser); // Restore Deleted User
router.get("/deleted-users", authMiddleware, getDeletedUsers); // Fetch Deleted Users

module.exports = router;
