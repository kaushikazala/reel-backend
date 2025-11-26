const express = require("express");
const authController = require("../controllers/auth.controller");

const router = express.Router();

//user routes
router.post("/user/register",authController.registerUser);
router.post("/user/login",authController.loginUser);
router.get("/user/logout",authController.logoutUser);

//food partner routes
router.post("/food-partner/register",authController.registerFoodPartner);
router.post("/food-partner/login",authController.loginFoodPartner);
router.get("/food-partner/logout",authController.logoutFoodPartner);

// Google OAuth (client-side token verification)
// Google OAuth removed

// forgot/reset
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);



module.exports = router;
