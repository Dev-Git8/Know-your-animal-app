const User = require("../models/user.model");
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
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
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

module.exports = { adminLogin, adminLogout, adminProfile };
