const express = require("express");
const router = express.Router();

const { verify, verifyAdmin } = require("../auth");
const userController = require("../controllers/user");

// User Routes
router.post("/", userController.registerUser);
router.post("/login", userController.loginUser);
router.get("/details", verify, userController.getUserDetails);
router.patch("/:userId/set-as-admin", verify, verifyAdmin, userController.updateUserAsAdmin);
router.patch("/update-password", verify, userController.updateUserPassword);
router.get("/update-password/:token", userController.updateUserPasswordWithToken);
router.post("/update-password/:token", userController.updateUserPasswordForm);
router.get("/:token", userController.confirmEmail);

module.exports = router;