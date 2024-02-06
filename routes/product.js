const express = require("express");
const router = express.Router();

const { verify, verifyAdmin } = require("../auth")
const productController = require("../controllers/product");

// Product Routes
router.post("/", verify, verifyAdmin, productController.createProduct);
router.get("/all", productController.getAllProducts);
router.get("/active", productController.getAllActiveProducts);
router.get("/:productId", productController.getProductById);
router.put("/:productId", verify, verifyAdmin, productController.updateProductInfo);
router.patch("/archive/:productId", verify, verifyAdmin, productController.archiveProduct);
router.patch("/activate/:productId", verify, verifyAdmin, productController.activateProduct);

module.exports = router;