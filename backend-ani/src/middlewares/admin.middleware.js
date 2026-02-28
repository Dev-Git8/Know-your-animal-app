const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const adminProtect = async (req, res, next) => {
    try {
        const token = req.cookies?.adminToken;

        if (!token) {
            return res
                .status(401)
                .json({ message: "Not authorized — no admin token" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.role !== "admin") {
            return res
                .status(403)
                .json({ message: "Not authorized — admin access required" });
        }

        const user = await User.findById(decoded.id);
        if (!user || user.role !== "admin") {
            return res
                .status(403)
                .json({ message: "Not authorized — admin access required" });
        }

        req.user = user;
        next();
    } catch (err) {
        console.error("Admin auth middleware error:", err.message);
        return res
            .status(401)
            .json({ message: "Not authorized — invalid token" });
    }
};

module.exports = adminProtect;
