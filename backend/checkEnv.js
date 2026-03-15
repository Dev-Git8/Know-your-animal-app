require("dotenv").config();
console.log("JWT_SECRET exists:", !!process.env.JWT_SECRET);
console.log("MONGO_URI exists:", !!process.env.MONGO_URI);
console.log("PORT:", process.env.PORT);
