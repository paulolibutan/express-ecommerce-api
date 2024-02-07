const express = require("express");
const router = express.Router();

const { verify, verifyAdmin } = require("../auth")
const cartController = require("../controllers/cart");

// Cart Routes
router.get("/", verify, cartController.getUserCart);
router.post("/addToCart", verify, cartController.addToCart);
router.put("/updateQuantity", verify, cartController.updateQuantity);
router.delete("/:productId/removeFromCart", verify, cartController.removeFromCart);
router.delete("/clearCart", verify, cartController.clearCart);

module.exports = router;