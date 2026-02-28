const express = require("express");
const adminController = require("../controllers/admin.controller");
const adminProtect = require("../middlewares/admin.middleware");

const router = express.Router();

// Public
router.post("/login", adminController.adminLogin);
router.post("/logout", adminController.adminLogout);

// Protected (admin only)
router.get("/profile", adminProtect, adminController.adminProfile);

module.exports = router;
