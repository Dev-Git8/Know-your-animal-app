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
    } catch (err) {
        console.error("❌ Database connection error:", err);
        // Don't exit immediately, let the app try to handle it or show errors
    }
}

module.exports = connectDB;