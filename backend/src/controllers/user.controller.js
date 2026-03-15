const User = require("../models/user.model");

const updateProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        const updates = req.body;

        // If files are uploaded, add them to the documents array
        if (req.files && req.files.length > 0) {
            const newDocs = req.files.map(file => ({
                name: file.originalname,
                url: `/uploads/${file.filename}`,
                uploadedAt: new Date()
            }));
            
            // Using $push to add to the existing documents array
            await User.findByIdAndUpdate(userId, {
                $push: { documents: { $each: newDocs } }
            });
        }

        // Update other fields
        const allowedUpdates = ["username", "specialization", "clinic", "experience", "bio", "contact", "location"];
        const filteredUpdates = {};
        allowedUpdates.forEach(field => {
            if (updates[field] !== undefined) {
                filteredUpdates[field] = updates[field];
            }
        });

        const user = await User.findByIdAndUpdate(userId, filteredUpdates, { new: true });

        res.status(200).json({
            message: "Profile updated successfully",
            user
        });
    } catch (err) {
        console.error("Update profile error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};

const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        res.status(200).json({ user });
    } catch (err) {
        res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = { updateProfile, getProfile };
