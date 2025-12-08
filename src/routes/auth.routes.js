const express = require("express");
const authController = require("../controllers/auth.controller");
const { authUserMiddleware, authFoodPartnerMiddleware } = require("../middlewares/auth.middlewares");

const router = express.Router();

//user routes
router.post("/user/register",authController.registerUser);
router.post("/user/login",authController.loginUser);
router.get("/user/logout",authController.logoutUser);

//food partner routes
router.post("/food-partner/register",authController.registerFoodPartner);
router.post("/food-partner/login",authController.loginFoodPartner);
router.get("/food-partner/logout",authController.logoutFoodPartner);

// Get currently logged-in user
router.get("/user/me", authUserMiddleware, (req, res) => {
  res.json({ success: true, user: req.user });
});

// Get currently logged-in food partner
router.get("/food-partner/me", authFoodPartnerMiddleware, (req, res) => {
  res.json({ success: true, foodPartner: req.foodPartner });
});


// forgot/reset
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);



module.exports = router;
