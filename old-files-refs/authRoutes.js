// Routes d'authentification
const express = require("express");
const {
  signupJoueur,
  signupPro,
  signupAdmin,
  login,
  devenirPro,
  getCurrentUser,
} = require("../controllers/authController");

const authenticate = require("../middleware/authenticate");  
const { whoCanDo } = require("../middleware/whoCanDo");
const upload = require("../utils/multerConfig");

const router = express.Router();
router.get("/me", authenticate,getCurrentUser);

router.post("/signup/joueur", signupJoueur);
router.post("/signup/pro", signupPro);
router.post("/signup/admin", signupAdmin);
router.post("/login", login);
router.post(
  "/devenir-pro",
  upload.fields([
    { name: "imageCouverture", maxCount: 1 },
    { name: "gallery", maxCount: 5 },
  ]),
  authenticate,
  whoCanDo("joueur", "prop"),
  devenirPro
);

module.exports = router;
