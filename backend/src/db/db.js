const mongoose = require("mongoose");
const dns = require("dns");

async function connectDB() {
    try {
        // Fix for MongoDB SRV lookup issues on some Windows machines
        try {
            dns.setServers(['8.8.8.8', '1.1.1.1']);
        } catch (e) {
            console.log("Note: Could not set custom DNS servers");
        }

        console.log("Connecting to Database...");
        
        // Disable buffering globally to avoid 10s hangs
        mongoose.set("bufferCommands", false);
        
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
        });
        console.log("✅ Database is connected!!");

        // Seed admin if not exists
        const User = require("../models/user.model");
        const adminExists = await User.findOne({ role: "admin" });
        if (!adminExists) {
            await User.create({
                username: "admin",
                email: "admin@animalhealth.com",
                password: "adminpassword123",
                role: "admin"
            });
            console.log("✅ Default admin created: admin@animalhealth.com / adminpassword123");
        }

        // Seed doctor if not exists
        const doctorExists = await User.findOne({ role: "doctor" });
        if (!doctorExists) {
            const doctor = await User.create({
                username: "General Doctor",
                email: "doctor@example.com",
                password: "doctorpassword123",
                role: "doctor"
            });
            
            // Create the profile for the doctor
            const DoctorProfile = require("../models/DoctorProfile");
            await DoctorProfile.create({
                userId: doctor._id,
                doctorName: "Dr. General Vet",
                email: "doctor@example.com",
                specialization: "General Practice",
                qualification: "BVSc & AH",
                yearsOfExperience: 5,
                availabilityStatus: "Available",
                rating: 4.5
            });
            console.log("✅ Default doctor created: doctor@example.com / doctorpassword123");
        }
    } catch (err) {
        console.error("❌ Database connection error:", err);
        // Don't exit immediately, let the app try to handle it or show errors
    }
}

module.exports = connectDB;