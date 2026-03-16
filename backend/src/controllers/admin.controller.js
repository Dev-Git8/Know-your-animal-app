const User = require("../models/user.model");
const DoctorProfile = require("../models/DoctorProfile");
const PatientRecord = require("../models/PatientRecord");
const jwt = require("jsonwebtoken");

// ── Helper: create JWT & set HTTP-only cookie ────────────────────────
const generateTokenAndSetCookie = (user, res) => {
    const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES || "7d" }
    );

    res.cookie("adminToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: "/",
    });

    return token;
};

// ── Admin Login ──────────────────────────────────────────────────────
const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res
                .status(400)
                .json({ message: "Email and password are required" });
        }

        const user = await User.findOne({ email, role: "admin" }).select("+password");
        if (!user) {
            return res.status(401).json({ message: "Invalid admin credentials" });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid admin credentials" });
        }

        generateTokenAndSetCookie(user, res);

        res.status(200).json({
            message: "Admin logged in successfully",
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
            },
        });
    } catch (err) {
        console.error("Admin login error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};

// ── Admin Logout ─────────────────────────────────────────────────────
const adminLogout = async (_req, res) => {
    try {
        res.cookie("adminToken", "", {
            httpOnly: true,
            expires: new Date(0),
            path: "/",
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
        });
        res.status(200).json({ message: "Admin logged out successfully" });
    } catch (err) {
        console.error("Admin logout error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};

// ── Admin Profile ────────────────────────────────────────────────────
const adminProfile = async (req, res) => {
    try {
        res.status(200).json({
            message: "Admin profile fetched successfully",
            user: req.user,
        });
    } catch (err) {
        console.error("Admin profile error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};

// ── User Management ────────────────────────────────────────────────
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({ role: "user" });
        res.status(200).json(users);
    } catch (err) {
        console.error("Get all users error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};

// ── Doctor Management ──────────────────────────────────────────────
const getAllDoctors = async (req, res) => {
    try {
        const doctors = await User.find({ role: "doctor" });
        const profiles = await DoctorProfile.find().populate("userId", "username email");
        res.status(200).json({ doctors, profiles });
    } catch (err) {
        console.error("Get all doctors error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};

const addDoctor = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: "User already exists" });
        }
        const user = await User.create({ username, email, password, role: "doctor" });
        await DoctorProfile.create({ userId: user._id, doctorName: username, email });
        res.status(201).json({ message: "Doctor account created", user });
    } catch (err) {
        console.error("Add doctor error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};

const deleteDoctor = async (req, res) => {
    try {
        const { id } = req.params;
        await User.findByIdAndDelete(id);
        await DoctorProfile.findOneAndDelete({ userId: id });
        res.status(200).json({ message: "Doctor removed successfully" });
    } catch (err) {
        console.error("Delete doctor error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};

const updateDoctor = async (req, res) => {
    try {
        const { id } = req.params;
        const profile = await DoctorProfile.findOneAndUpdate(
            { userId: id },
            { ...req.body },
            { new: true }
        );
        res.status(200).json({ message: "Doctor profile updated", profile });
    } catch (err) {
        console.error("Update doctor error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = { 
    adminLogin, 
    adminLogout, 
    adminProfile, 
    getAllUsers, 
    getAllDoctors, 
    addDoctor, 
    deleteDoctor, 
    updateDoctor 
};
