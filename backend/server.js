require("dotenv").config();
const app = require("./src/app");
const connectDB = require("./src/db/db");
const dns = require("dns");

// Force DNS fix globally for Windows 
try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

const PORT = process.env.PORT || 3000;

// Connect to MongoDB first, then start listening
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
});