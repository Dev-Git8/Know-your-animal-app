const express = require("express");
const router = express.Router();
const { updateProfile, getProfile } = require("../controllers/user.controller");
const protect = require("../middlewares/auth.middleware");
const upload = require("../middlewares/upload.middleware");

router.get("/profile", protect, getProfile);
router.put("/profile", protect, upload.array("documents", 5), updateProfile);

module.exports = router;
