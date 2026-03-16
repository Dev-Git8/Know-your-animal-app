const mongoose = require("mongoose");

const petSchema = new mongoose.Schema({
    petName: {
        type: String,
        trim: true,
    },
    animalType: {
        type: String,
        trim: true,
    },
    breed: {
        type: String,
        trim: true,
    },
    age: {
        type: Number,
    },
    gender: {
        type: String,
        trim: true,
    },
    vaccinationStatus: {
        type: String,
        trim: true,
    },
    medicalHistory: {
        type: String,
        trim: true,
    },
    emergencyNotes: {
        type: String,
        trim: true,
    },
});

const userProfileSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true,
        },
        name: {
            type: String,
            trim: true,
        },
        email: {
            type: String,
            trim: true,
            lowercase: true,
        },
        phoneNumber: {
            type: String,
            trim: true,
        },
        location: {
            type: String,
            trim: true,
        },
        profilePhoto: {
            type: String,
            trim: true,
        },
        pets: [petSchema],
        createdAt: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

const UserProfile = mongoose.model("UserProfile", userProfileSchema);

module.exports = UserProfile;
