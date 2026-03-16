const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const UserProfile = require("../models/UserProfile");

// ── Helper: create JWT & set HTTP-only cookie ────────────────────────
const generateTokenAndSetCookie = (user, res) => {
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES || "7d",
    });

    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: "/",
    });

    return token;
};

// ── Register ─────────────────────────────────────────────────────────
const registerUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Basic validation
        if (!username || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Check duplicate
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: "User already exists" });
        }

        // Create user (password is hashed by pre-save hook)
        const user = await User.create({ username, email, password, role: req.body.role || "user" });

        // Initial profiles
        if (user.role === "doctor") {
            const DoctorProfile = require("../models/DoctorProfile");
            await DoctorProfile.create({ userId: user._id, doctorName: user.username, email: user.email });
        } else {
            await UserProfile.create({ userId: user._id, name: user.username, email: user.email });
        }

        generateTokenAndSetCookie(user, res);

        res.status(201).json({
            message: "User registered successfully",
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
            },
        });
    } catch (err) {
        // Mongoose validation errors
        if (err.name === "ValidationError") {
            const messages = Object.values(err.errors).map((e) => e.message);
            return res.status(400).json({ message: messages.join(", ") });
        }
        console.error("Register error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};

// ── Login ────────────────────────────────────────────────────────────
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res
                .status(400)
                .json({ message: "Email and password are required" });
        }

        // +password to explicitly select the hidden field
        const user = await User.findOne({ email }).select("+password");
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        generateTokenAndSetCookie(user, res);

        res.status(200).json({
            message: "Logged in successfully",
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
            },
        });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};

// ── Logout ───────────────────────────────────────────────────────────
const logoutUser = async (_req, res) => {
    try {
        res.cookie("token", "", {
            httpOnly: true,
            expires: new Date(0),
            path: "/",
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
        });

        res.status(200).json({ message: "Logged out successfully" });
    } catch (err) {
        console.error("Logout error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};



// ── Doctor Login ───────────────────────────────────────────────────
const loginDoctor = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const user = await User.findOne({ email, role: "doctor" }).select("+password");
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        generateTokenAndSetCookie(user, res);

        res.status(200).json({
            message: "Doctor logged in successfully",
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
            },
        });
    } catch (err) {
        console.error("Doctor login error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};

const getProfile = async (req, res) => {
    try {
        const user = req.user;
        const profile = await UserProfile.findOne({ userId: user._id });
        res.status(200).json({
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
            },
            profile: profile || {}
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching profile" });
    }
};

const updateProfile = async (req, res) => {
    try {
        const user = req.user;
        const { username, name, phoneNumber, location, pets } = req.body;

        if (username) {
            user.username = username;
            await user.save();
        }

        let profile = await UserProfile.findOne({ userId: user._id });
        if (!profile) {
            profile = new UserProfile({ userId: user._id });
        }

        if (name) profile.name = name;
        if (phoneNumber) profile.phoneNumber = phoneNumber;
        if (location) profile.location = location;
        if (pets) profile.pets = pets;

        await profile.save();

        res.status(200).json({
            message: "Profile updated successfully",
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
            },
            profile
        });
    } catch (error) {
        res.status(500).json({ message: "Error updating profile" });
    }
};

module.exports = {
    registerUser,
    loginUser,
    loginDoctor,
    logoutUser,
    getProfile,
    updateProfile
};
