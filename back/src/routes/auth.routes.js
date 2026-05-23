const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const { protect } = require("../middlewares/auth.middleware");
const { googleLogin } = require("../controllers/google.controller");
const upload = require("../middlewares/upload.middleware");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/user", protect, authController.user);
router.post("/google-login", googleLogin);
router.post("/deposit", protect, authController.deposit);
router.get("/analytics", protect, authController.analytics);
router.put("/profile/email", protect, authController.changeEmail);
router.put("/profile/password", protect, authController.changePassword);
router.post(
  "/profile/avatar",
  protect,
  upload.single("avatar"),
  authController.changeAvatar,
);
router.delete("/account", protect, authController.deleteAccount);

module.exports = router;
