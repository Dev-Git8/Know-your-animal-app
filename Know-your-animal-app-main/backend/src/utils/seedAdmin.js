// ── One-time script to seed an admin user ────────────────────────────
// Usage: node src/utils/seedAdmin.js
//
// This will create an admin user if one doesn't already exist.
// Run once, then delete or keep for future use.

require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/user.model");

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@animalhealth.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Admin@1234";
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "Admin";

async function seedAdmin() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("DB connected");

        const existing = await User.findOne({ email: ADMIN_EMAIL });
        if (existing) {
            console.log("Admin user already exists:", ADMIN_EMAIL);
        } else {
            await User.create({
                username: ADMIN_USERNAME,
                email: ADMIN_EMAIL,
                password: ADMIN_PASSWORD,
                role: "admin",
            });
            console.log("Admin user created successfully!");
            console.log("  Email:", ADMIN_EMAIL);
            console.log("  Password:", ADMIN_PASSWORD);
        }
    } catch (err) {
        console.error("Seed error:", err.message);
    } finally {
        await mongoose.disconnect();
    }
}

seedAdmin();
