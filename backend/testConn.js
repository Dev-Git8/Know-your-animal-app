require('dotenv').config();
const mongoose = require('mongoose');
const dns = require('dns');

// Try setting DNS servers to see if it helps with SRV lookup
try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
    console.log("DNS servers set to Google/Cloudflare");
} catch (e) {
    console.log("Could not set DNS servers:", e.message);
}

console.log("Connecting to:", process.env.MONGO_URI);

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("Connected successfully!");
        process.exit(0);
    })
    .catch(err => {
        console.error("Connection failed!");
        console.error(err);
        process.exit(1);
    });
