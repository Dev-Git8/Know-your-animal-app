const express = require("express");
const adminController = require("../controllers/admin.controller");
const adminProtect = require("../middlewares/admin.middleware");

const router = express.Router();

// Public
router.post("/login-admin", adminController.adminLogin);
router.post("/logout", adminController.adminLogout);

// Protected (admin only)
router.get("/profile", adminProtect, adminController.adminProfile);
router.get("/users", adminProtect, adminController.getAllUsers);
router.get("/doctors", adminProtect, adminController.getAllDoctors);
router.post("/doctors", adminProtect, adminController.addDoctor);
router.put("/doctors/:id", adminProtect, adminController.updateDoctor);
router.delete("/doctors/:id", adminProtect, adminController.deleteDoctor);

module.exports = router;
