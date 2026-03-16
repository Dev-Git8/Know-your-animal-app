const mongoose = require("mongoose");

const patientRecordSchema = new mongoose.Schema(
    {
        doctorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true,
        },
        petName: {
            type: String,
            required: true,
        },
        treatmentNotes: {
            type: String,
            required: true,
        },
        date: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

const PatientRecord = mongoose.model("PatientRecord", patientRecordSchema);

module.exports = PatientRecord;
