const RentForm = require("../models/rentFormModel");
const Room = require("../models/roomModel");
const houseModel = require("../models/houseModel");
const { Parser } = require("json2csv");
const fs = require("fs");
const path = require("path");

// PUBLIC: Get Form Data by Token
exports.getFormByToken = async (req, res) => {
    try {
        const { token } = req.params;
        const form = await RentForm.findOne({ token }).populate("room").populate("house");

        if (!form) {
            return res.status(404).json({ message: "Form link invalid." });
        }

        if (form.status !== "Active") {
            return res.status(410).json({ message: "This form link has expired or has already been submitted." });
        }

        // Return only necessary info to public
        res.status(200).json({
            data: {
                houseName: form.house.name,
                roomName: form.room.name,
                status: form.status
            }
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// PUBLIC: Submit Form
exports.submitForm = async (req, res) => {
    try {
        const { token } = req.params;
        const clientData = req.body; // { name, email, phone, ... }

        const form = await RentForm.findOne({ token });

        if (!form || form.status !== "Active") {
            return res.status(400).json({ message: "Form invalid or already submitted." });
        }

        // 1. Update Form Data
        form.clientData = clientData;
        form.status = "Submitted";
        form.submittedAt = new Date();

        // 2. Generate CSV Data
        // We can store it as a string in DB or a file.
        // Let's store string in DB for simplicity and portability
        const fields = ["name", "email", "phone", "cin", "address"];
        const json2csvParser = new Parser({ fields });
        const csv = json2csvParser.parse(clientData);

        form.csvContent = csv;
        await form.save();

        // 3. Update Room Status
        await Room.findByIdAndUpdate(form.room, {
            status: "Rented",
            $push: { history: form._id } // Keep history
        });

        res.status(200).json({ message: "Form submitted successfully!" });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ADMIN: Download CSV
// This could be in a separate controller but keeping form logic here is fine.
// Or we can return the CSV content in the room/form details.
// Let's make a specific endpoint to download it.
exports.downloadCSV = async (req, res) => {
    try {
        const { formId } = req.params;
        const form = await RentForm.findById(formId);

        if (!form || !form.csvContent) {
            return res.status(404).json({ message: "CSV not found" });
        }

        res.header('Content-Type', 'text/csv');
        res.attachment(`rent_form_${formId}.csv`);
        res.send(form.csvContent);

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}
