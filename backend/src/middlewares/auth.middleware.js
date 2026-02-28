const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const protect = async (req, res, next) => {
    try {
        const token = req.cookies?.token;

        if (!token) {
            return res
                .status(401)
                .json({ message: "Not authorized — no token provided" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.id); // password excluded by default (select: false)
        if (!user) {
            return res
                .status(401)
                .json({ message: "Not authorized — user not found" });
        }

        req.user = user;
        next();
    } catch (err) {
        console.error("Auth middleware error:", err.message);
        return res
            .status(401)
            .json({ message: "Not authorized — invalid token" });
    }
};

module.exports = protect;
