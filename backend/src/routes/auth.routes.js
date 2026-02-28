const express = require("express");
const authController = require("../controllers/auth.controller");
const protect = require("../middlewares/auth.middleware");

const router = express.Router();

// Public routes
router.post("/register", authController.registerUser);
router.post("/login", authController.loginUser);
router.post("/logout", authController.logoutUser);

// Protected route (example)
router.get("/profile", protect, authController.getProfile);

module.exports = router;
