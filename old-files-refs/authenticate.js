const jwt = require("jsonwebtoken");
const User = require("../models/userModel"); // Assure-toi du bon chemin vers ton modèle User

const authenticate = async (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    return res.status(401).json({ message: "Authorization token is required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    //console.log("Decoded token:", decoded); // Debug

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user; //   On stocke l'utilisateur complet dans req.user
    //console.log(req.user);
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = authenticate;
