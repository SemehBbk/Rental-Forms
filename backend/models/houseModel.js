const mongoose = require("mongoose");

const houseSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "House name is required"],
            trim: true,
        },
        address: {
            type: String,
            required: [true, "Address is required"],
            trim: true,
        },
        rooms: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Room",
            },
        ],
    },
    {
        timestamps: true,
    }
);

const House = mongoose.model("House", houseSchema);
module.exports = House;
