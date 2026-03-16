const mongoose = require("mongoose");

const doctorProfileSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true,
        },
        doctorName: {
            type: String,
            required: [true, "Doctor name is required"],
            trim: true,
        },
        profilePhoto: {
            type: String,
            default: "",
        },
        qualification: {
            type: String,
            trim: true,
        },
        yearsOfExperience: {
            type: Number,
            default: 0,
        },
        specialization: {
            type: String,
            trim: true,
        },
        clinicName: {
            type: String,
            trim: true,
        },
        location: {
            type: String,
            trim: true,
        },
        contactNumber: {
            type: String,
            trim: true,
        },
        email: {
            type: String,
            trim: true,
            lowercase: true,
        },
        availabilityStatus: {
            type: String,
            enum: ["Available", "Busy", "Offline"],
            default: "Available",
        },
        rating: {
            type: Number,
            default: 0,
        },
        ratings: {
            type: Number,
            default: 0,
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

const DoctorProfile = mongoose.model("DoctorProfile", doctorProfileSchema);

module.exports = DoctorProfile;
