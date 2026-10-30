const express = require("express");
const protect = require("../middlewares/auth.middleware");
const controller = require("../controllers/subscription.controller");

const router = express.Router();

router.get("/plans", controller.getPlans);
router.use(protect);
router.get("/current", controller.getCurrentSubscription);
router.post("/create-order", controller.createSubscriptionOrder);
router.post("/verify-payment", controller.verifySubscriptionPayment);
router.get("/invoices", controller.getMyInvoices);
router.post("/reset", controller.resetSubscription);

module.exports = router;
