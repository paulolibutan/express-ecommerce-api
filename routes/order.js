const express = require("express");
const router = express.Router();

const { verify, verifyAdmin } = require("../auth");
const orderController = require("../controllers/order");

router.post("/checkout", verify, orderController.checkoutOrder);
router.get("/all-orders", verify, verifyAdmin, orderController.getAllOrders);
router.get("/my-orders", verify, orderController.getUserOrders);

module.exports = router;