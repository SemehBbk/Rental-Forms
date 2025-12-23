const jwt = require("jsonwebtoken");
const Admin = require("../models/adminModel");

const authenticate = async (req, res, next) => {
    const authHeader = req.header("Authorization");
    const token = authHeader?.startsWith("Bearer ") ? authHeader.replace("Bearer ", "") : null;

    if (!token) {
        return res.status(401).json({ message: "Authorization token is required" });
    }

    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY);

        const user = await Admin.findById(decoded.id);
        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }

        req.user = user;
        next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};

module.exports = authenticate;
