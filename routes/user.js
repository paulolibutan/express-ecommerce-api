const express = require("express");
const router = express.Router();

const { verify, verifyAdmin } = require("../auth")

const userController = require("../controllers/user");

router.post("/", userController.registerUser);
router.post("/login", userController.loginUser);
router.get("/details", verify, userController.getUserDetails);
router.patch("/:userId/set-as-admin", verify, verifyAdmin, userController.updateUserAsAdmin);
router.patch("/update-password", verify, userController.updateUserPassword);
module.exports = router;