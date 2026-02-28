const express = require("express");
const animalController = require("../controllers/animal.controller");
const adminProtect = require("../middlewares/admin.middleware");

const router = express.Router();

// Public routes
router.get("/", animalController.getAllAnimals);
router.get("/:slug", animalController.getAnimalBySlug);

// Admin-protected routes
router.post("/", adminProtect, animalController.createAnimal);
router.put("/:slug", adminProtect, animalController.updateAnimal);
router.delete("/:slug", adminProtect, animalController.deleteAnimal);

// Disease sub-routes (admin-protected)
router.post("/:slug/diseases", adminProtect, animalController.addDisease);
router.delete("/:slug/diseases/:diseaseId", adminProtect, animalController.deleteDisease);

module.exports = router;
