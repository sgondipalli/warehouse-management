const express = require("express");
const router = express.Router();
const shelfController = require("../controllers/shelfController");

router.post("/shelves", shelfController.createShelf);
router.get("/shelves", shelfController.getAllShelves);
router.get("/shelves/:id", shelfController.getShelfById);
router.put("/shelves/:id", shelfController.updateShelf);
router.delete("/shelves/:id", shelfController.deleteShelf);
router.get("/shelves/dropdown/list", shelfController.getShelfDropdown);

module.exports = router;
