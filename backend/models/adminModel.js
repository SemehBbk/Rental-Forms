const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs"); // Using bcryptjs as installed

const adminSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
            validate: [validator.isEmail, "Please provide a valid email"],
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [8, "Password must be at least 8 characters"],
            select: false,
        },
        role: {
            type: String,
            default: "admin",
            enum: ["admin"], // Restrict to admin for now
        },
    },
    {
        timestamps: true,
    }
);

// Hash password before saving
// Hash password before saving - MOVED TO CONTROLLER
// adminSchema.pre("save", function (next) { ... });

// Method to verify password
adminSchema.methods.verifyPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const Admin = mongoose.model("Admin", adminSchema);
module.exports = Admin;
