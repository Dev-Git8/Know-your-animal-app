const express = require("express");
const doctorController = require("../controllers/doctor.controller");
const doctorProtect = require("../middlewares/doctor.middleware");

const router = express.Router();

router.use(doctorProtect);

router.get("/profile", doctorController.getProfile);
router.put("/profile", doctorController.updateProfile);
router.get("/patients", doctorController.getPatients);
router.post("/treatment-notes", doctorController.addTreatmentNote);

module.exports = router;
