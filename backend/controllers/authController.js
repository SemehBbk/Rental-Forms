const Admin = require("../models/adminModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const createToken = (id) => {
    return jwt.sign({ id }, process.env.SECRET_KEY, {
        expiresIn: "1d",
    });
};

exports.signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            return res.status(400).json({ message: "Email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const newAdmin = await Admin.create({
            name,
            email,
            password: hashedPassword,
        });

        const token = createToken(newAdmin._id);

        res.status(201).json({
            message: "Admin created successfully",
            token,
            data: { user: newAdmin },
        });
    } catch (err) {
        console.error("Signup Error:", err);
        res.status(400).json({ message: err.message });
    }
};
/* 
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Please provide email and password" });
        }

        const admin = await Admin.findOne({ email }).select("+password");

        if (!admin || !(await admin.verifyPassword(password))) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const token = createToken(admin._id);

        // Don't send password back
        admin.password = undefined;

        res.status(200).json({
            message: "Logged in successfully",
            token,
            data: { user: admin },
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
*/


exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await Admin.findOne({ email }).select("+password");

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res
                .status(401)
                .json({ message: "Email ou mot de passe invalide" });
        }

        const token = jwt.sign(
            {
                id: user._id,
                name: user.name,
            },
            process.env.SECRET_KEY
        );

        res.status(200).json({
            message: "Connexion réussie",
            token,
            user,
            roles: user.role,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getMe = async (req, res) => {
    try {
        const user = req.user;
        res.status(200).json({
            data: { user },
        });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};
