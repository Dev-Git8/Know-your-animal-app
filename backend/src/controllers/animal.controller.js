const Animal = require("../models/animal.model");

// ── PUBLIC: Get all animals (list) ───────────────────────────────────
const getAllAnimals = async (_req, res) => {
    try {
        const animals = await Animal.find().select("slug name nameHi image description").sort("name");
        res.status(200).json({ animals });
    } catch (err) {
        console.error("Get animals error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};

// ── PUBLIC: Get one animal by slug ───────────────────────────────────
const getAnimalBySlug = async (req, res) => {
    try {
        const animal = await Animal.findOne({ slug: req.params.slug });
        if (!animal) {
            return res.status(404).json({ message: "Animal not found" });
        }
        res.status(200).json({ animal });
    } catch (err) {
        console.error("Get animal error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};

// ── ADMIN: Add a new animal ──────────────────────────────────────────
const createAnimal = async (req, res) => {
    try {
        const { slug, name, nameHi, image, description, diseases } = req.body;

        if (!slug || !name) {
            return res.status(400).json({ message: "Slug and name are required" });
        }

        const existing = await Animal.findOne({ slug: slug.toLowerCase() });
        if (existing) {
            return res.status(409).json({ message: "Animal with this slug already exists" });
        }

        const animal = await Animal.create({ slug, name, nameHi, image, description, diseases: diseases || [] });
        res.status(201).json({ message: "Animal created successfully", animal });
    } catch (err) {
        console.error("Create animal error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};

// ── ADMIN: Update an animal ──────────────────────────────────────────
const updateAnimal = async (req, res) => {
    try {
        const animal = await Animal.findOne({ slug: req.params.slug });
        if (!animal) {
            return res.status(404).json({ message: "Animal not found" });
        }

        const { name, nameHi, image, description, diseases } = req.body;
        if (name !== undefined) animal.name = name;
        if (nameHi !== undefined) animal.nameHi = nameHi;
        if (image !== undefined) animal.image = image;
        if (description !== undefined) animal.description = description;
        if (diseases !== undefined) animal.diseases = diseases;

        await animal.save();
        res.status(200).json({ message: "Animal updated successfully", animal });
    } catch (err) {
        console.error("Update animal error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};

// ── ADMIN: Delete an animal ──────────────────────────────────────────
const deleteAnimal = async (req, res) => {
    try {
        const animal = await Animal.findOneAndDelete({ slug: req.params.slug });
        if (!animal) {
            return res.status(404).json({ message: "Animal not found" });
        }
        res.status(200).json({ message: "Animal deleted successfully" });
    } catch (err) {
        console.error("Delete animal error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};

// ── ADMIN: Add a disease to an animal ────────────────────────────────
const addDisease = async (req, res) => {
    try {
        const animal = await Animal.findOne({ slug: req.params.slug });
        if (!animal) {
            return res.status(404).json({ message: "Animal not found" });
        }

        const { name, nameHi, symptoms, causes, treatment, prevention } = req.body;
        if (!name) {
            return res.status(400).json({ message: "Disease name is required" });
        }

        animal.diseases.push({ name, nameHi, symptoms, causes, treatment, prevention });
        await animal.save();

        res.status(201).json({ message: "Disease added successfully", animal });
    } catch (err) {
        console.error("Add disease error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};

// ── ADMIN: Delete a disease from an animal ───────────────────────────
const deleteDisease = async (req, res) => {
    try {
        const animal = await Animal.findOne({ slug: req.params.slug });
        if (!animal) {
            return res.status(404).json({ message: "Animal not found" });
        }

        const disease = animal.diseases.id(req.params.diseaseId);
        if (!disease) {
            return res.status(404).json({ message: "Disease not found" });
        }

        disease.deleteOne();
        await animal.save();

        res.status(200).json({ message: "Disease deleted successfully", animal });
    } catch (err) {
        console.error("Delete disease error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = {
    getAllAnimals,
    getAnimalBySlug,
    createAnimal,
    updateAnimal,
    deleteAnimal,
    addDisease,
    deleteDisease,
};
