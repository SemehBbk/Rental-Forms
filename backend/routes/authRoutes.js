const express = require("express");
const { signup, login, getMe } = require("../controllers/authController");
const authenticate = require("../middleware/authenticate");

const router = express.Router();

router.post("/signup", signup); // Make sure to protect this or disable in prod if you don't want open registration
router.post("/login", login);
router.get("/me", authenticate, getMe);

module.exports = router;
