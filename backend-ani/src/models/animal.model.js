const mongoose = require("mongoose");

const diseaseSchema = new mongoose.Schema({
    name: { type: String, required: true },
    nameHi: { type: String, default: "" },
    symptoms: [{ type: String }],
    causes: { type: String, default: "" },
    treatment: { type: String, default: "" },
    prevention: [{ type: String }],
});

const animalSchema = new mongoose.Schema(
    {
        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        name: { type: String, required: true, trim: true },
        nameHi: { type: String, default: "" },
        image: { type: String, default: "" },
        description: { type: String, default: "" },
        diseases: [diseaseSchema],
    },
    { timestamps: true }
);

const Animal = mongoose.model("Animal", animalSchema);

module.exports = Animal;
