const express = require("express");
const { getFormByToken, submitForm, downloadCSV } = require("../controllers/formController");
const authenticate = require("../middleware/authenticate"); // For admin download
const { whoCanDo } = require("../middleware/whoCanDo");

const router = express.Router();

// Public Routes
router.get("/public/:token", getFormByToken);
router.post("/public/:token", submitForm);

// Admin Routes for Forms (e.g. download)
router.get("/download/:formId", authenticate, whoCanDo("admin"), downloadCSV);

module.exports = router;
