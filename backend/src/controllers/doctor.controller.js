const DoctorProfile = require("../models/DoctorProfile");
const PatientRecord = require("../models/PatientRecord");
const UserProfile = require("../models/UserProfile");

// ── Update Doctor Profile ──────────────────────────────────────────
exports.updateProfile = async (req, res) => {
    try {
        const profile = await DoctorProfile.findOneAndUpdate(
            { userId: req.user._id },
            { ...req.body, userId: req.user._id },
            { new: true, upsert: true }
        );

        res.status(200).json({
            message: "Profile updated successfully",
            profile,
        });
    } catch (err) {
        console.error("Update profile error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};

// ── Get Doctor Profile ─────────────────────────────────────────────
exports.getProfile = async (req, res) => {
    try {
        const profile = await DoctorProfile.findOne({ userId: req.user._id });
        if (!profile) {
            return res.status(404).json({ message: "Profile not found" });
        }
        res.status(200).json(profile);
    } catch (err) {
        console.error("Get profile error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};

// ── Get Patients (who contacted this doctor) ────────────────────────
exports.getPatients = async (req, res) => {
    try {
        // In a real app, you'd have a 'Contacts' or 'Appointments' table.
        // For now, let's find patient records assigned to this doctor.
        const records = await PatientRecord.find({ doctorId: req.user._id }).populate("userId", "username email");
        res.status(200).json(records);
    } catch (err) {
        console.error("Get patients error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};

// ── Add Treatment Note ─────────────────────────────────────────────
exports.addTreatmentNote = async (req, res) => {
    try {
        const { userId, petName, treatmentNotes } = req.body;

        if (!userId || !petName || !treatmentNotes) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const record = await PatientRecord.create({
            doctorId: req.user._id,
            userId,
            petName,
            treatmentNotes,
        });

        res.status(201).json({
            message: "Treatment note added successfully",
            record,
        });
    } catch (err) {
        console.error("Add treatment note error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};
