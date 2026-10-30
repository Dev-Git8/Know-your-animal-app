const mongoose = require("mongoose");
const dns = require("dns");

async function connectDB() {
    // Fix for MongoDB SRV lookup issues on some Windows machines.
    try {
        dns.setServers(["8.8.8.8", "1.1.1.1"]);
    } catch (error) {
        console.log("Note: Could not set custom DNS servers");
    }

    console.log("Connecting to Database...");
    mongoose.set("bufferCommands", false);

    let lastError;
    for (let attempt = 1; attempt <= 5; attempt += 1) {
        try {
            await mongoose.connect(process.env.MONGO_URI, {
                serverSelectionTimeoutMS: 10000,
                connectTimeoutMS: 10000,
                family: 4,
            });
            console.log("✅ Database is connected!!");
            lastError = null;
            break;
        } catch (error) {
            lastError = error;
            console.error(`Database connection attempt ${attempt}/5 failed:`, error.message);
            await mongoose.disconnect();
            if (attempt < 5) {
                await new Promise((resolve) => setTimeout(resolve, 3000));
            }
        }
    }

    if (lastError) {
        throw new Error(`MongoDB unavailable after 5 attempts: ${lastError.message}`);
    }

    try {
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
    } catch (error) {
        console.error("❌ Database seeding error:", error);
        throw error;
    }
}

module.exports = connectDB;