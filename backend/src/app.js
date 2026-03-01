const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/auth.routes");
const adminRoutes = require("./routes/admin.routes");
const animalRoutes = require("./routes/animal.routes");
const chatRoutes = require("./routes/chat.routes");

const app = express();

// ── Global Middleware ────────────────────────────────────────────────
app.use(
    cors({
        origin: function (origin, callback) {
            // Allow requests with no origin (e.g. mobile apps, curl, Postman)
            if (!origin) return callback(null, true);
            // In production, use CLIENT_URL; in dev, allow any localhost port
            const allowedOrigin = process.env.CLIENT_URL || "http://localhost:8080";
            if (
                origin === allowedOrigin ||
                /^http:\/\/localhost:\d+$/.test(origin)
            ) {
                return callback(null, true);
            }
            callback(new Error("Not allowed by CORS"));
        },
        credentials: true,
    })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ── Routes ───────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/animals", animalRoutes);
app.use("/api/chat", chatRoutes);

module.exports = app;
