const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
    {
        house: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "House",
            required: [true, "Room must belong to a house"],
        },
        name: {
            type: String,
            required: [true, "Room name/number is required"],
            trim: true,
        },
        status: {
            type: String,
            enum: ["Available", "Pending", "Rented"],
            default: "Available",
        },
        price: {
            type: Number,
            default: 0
        },
        // The currently active form (if pending) or the form that rented it
        currentForm: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "RentForm",
        },
        // History of all rentals for this room
        history: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "RentForm",
            },
        ],
    },
    {
        timestamps: true,
    }
);

const Room = mongoose.model("Room", roomSchema);
module.exports = Room;
