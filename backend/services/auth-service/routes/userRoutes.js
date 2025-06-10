const express = require("express");
const { createUser, updateUser, softDeleteUser, restoreUser, getDeletedUsers, getAvailableDeliveryAgents } = require("../controllers/userController");
const authMiddleware = require("../middleware/auth");
const { authenticateJWT, authorizeRoles } = require("../middleware/authorize1");

const router = express.Router();

router.post("/register", authMiddleware, createUser); // Create User
router.put("/update-user/:id", authMiddleware, updateUser); // Update User
router.delete("/delete-user/:id", authMiddleware, softDeleteUser); // Soft Delete User
router.post("/restore-user/:id", authMiddleware, restoreUser); // Restore Deleted User
router.get("/deleted-users", authMiddleware, getDeletedUsers); // Fetch Deleted Users
router.get(
    "/available-delivery-agents",
    authenticateJWT,
    authorizeRoles(["Super Admin", "Warehouse Manager"]),
    getAvailableDeliveryAgents
  );



module.exports = router;
