const express = require("express");
const { createRoom, generateRentLink, resetRoom, deleteRoom } = require("../controllers/roomController");
const authenticate = require("../middleware/authenticate");
const { whoCanDo } = require("../middleware/whoCanDo");

const router = express.Router();

// Admin only routes
router.use(authenticate);
router.use(whoCanDo("admin"));

router.post("/", createRoom);
router.delete("/:id", deleteRoom);

// Specific Actions
router.post("/:roomId/generate", generateRentLink);
router.patch("/:roomId/reset", resetRoom);

module.exports = router;
