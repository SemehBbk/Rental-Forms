const Room = require("../models/roomModel");
const House = require("../models/houseModel");
const RentForm = require("../models/rentFormModel");
const { v4: uuidv4 } = require("uuid"); // Ensure uuid is installed or use crypto

exports.createRoom = async (req, res) => {
    try {
        const { houseId, name, price } = req.body;

        const house = await House.findById(houseId);
        if (!house) {
            return res.status(404).json({ message: "House not found" });
        }

        const newRoom = await Room.create({
            house: houseId,
            name,
            price
        });

        // Add room to house
        house.rooms.push(newRoom._id);
        await house.save();

        res.status(201).json({
            message: "Room created successfully",
            data: { room: newRoom }
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.generateRentLink = async (req, res) => {
    try {
        const { roomId } = req.params;

        const room = await Room.findById(roomId);
        if (!room) {
            return res.status(404).json({ message: "Room not found" });
        }

        // Optional: Check if already rented
        if (room.status === "Rented") {
            // logic choice: allow regen? or block? 
            // User asked: "admin can rent 1 room at a time... mark house as rented... mark as available to send form again"
            // We'll allow generating a new link even if rented, but typically you'd want to reset first.
            // For safety, let's warn or just proceed (overwriting status to Pending).
        }

        const token = uuidv4();

        // Create a NEW form entry
        const newForm = await RentForm.create({
            token,
            room: roomId,
            house: room.house,
            status: "Active"
        });

        // Update Room
        room.status = "Pending";
        room.currentForm = newForm._id;
        await room.save();

        // Construct Link
        // Assuming Front runs on port 5173 by default
        const link = `http://localhost:5173/rent/${token}`;

        res.status(200).json({
            message: "Rent link generated successfully",
            data: {
                link,
                token,
                formId: newForm._id
            }
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.resetRoom = async (req, res) => {
    try {
        const { roomId } = req.params;
        const room = await Room.findById(roomId);

        if (!room) return res.status(404).json({ message: "Room not found" });

        // If there was a current form, maybe expire it?
        if (room.currentForm) {
            await RentForm.findByIdAndUpdate(room.currentForm, { status: "Expired" });
        }

        room.status = "Available";
        room.currentForm = null;
        await room.save();

        res.status(200).json({ message: "Room status reset to Available" });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteRoom = async (req, res) => {
    try {
        const { id } = req.params;
        const room = await Room.findByIdAndDelete(id);
        if (room) {
            // Remove from House
            await House.findByIdAndUpdate(room.house, { $pull: { rooms: id } });
        }
        res.status(204).json({ data: null });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}
