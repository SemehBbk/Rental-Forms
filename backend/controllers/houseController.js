const House = require("../models/houseModel");
const Room = require("../models/roomModel");

exports.createHouse = async (req, res) => {
    try {
        const { name, address } = req.body;

        const newHouse = await House.create({
            name,
            address
        });

        res.status(201).json({
            message: "House created successfully",
            data: { house: newHouse }
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.getAllHouses = async (req, res) => {
    try {
        const houses = await House.find().populate("rooms");
        res.status(200).json({
            results: houses.length,
            data: { houses }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getHouse = async (req, res) => {
    try {
        const house = await House.findById(req.params.id).populate({
            path: "rooms",
            populate: { path: "currentForm" } // to see form details if pending
        });

        if (!house) {
            return res.status(404).json({ message: "House not found" });
        }

        res.status(200).json({
            data: { house }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteHouse = async (req, res) => {
    try {
        const house = await House.findByIdAndDelete(req.params.id);
        // Optional: Delete associated rooms
        if (house) {
            await Room.deleteMany({ house: house._id });
        }
        res.status(204).json({ data: null });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
