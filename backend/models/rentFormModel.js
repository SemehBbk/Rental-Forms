const mongoose = require("mongoose");

const rentFormSchema = new mongoose.Schema(
    {
        token: {
            type: String,
            required: true,
            unique: true,
            index: true, // For faster lookups by token
        },
        room: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Room",
            required: true,
        },
        house: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "House",
            required: true,
        },
        status: {
            type: String,
            enum: ["Active", "Submitted", "Expired"],
            default: "Active",
        },
        clientData: {
            name: { type: String, trim: true },
            email: { type: String, trim: true, lowercase: true },
            phone: { type: String, trim: true },
            cin: { type: String, trim: true },
            address: { type: String, trim: true },
            // Add any other specific fields you need from the client here
        },
        csvContent: {
            type: String, // We'll store the CSV string here for easy download
        },
        submittedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

const RentForm = mongoose.model("RentForm", rentFormSchema);
module.exports = RentForm;
