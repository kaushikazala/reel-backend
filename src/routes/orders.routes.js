const express = require("express");
const orderController = require("../controllers/order.controller");
const authMiddleware = require("../middlewares/auth.middlewares");

const router = express.Router();

// Create order (user-only)
router.post("/", authMiddleware.authUserMiddleware, orderController.createOrder);

// List current user's orders
router.get("/me", authMiddleware.authUserMiddleware, orderController.listMyOrders);

// Fetch a specific order by id (user-only; must own the order)
router.get("/:orderId", authMiddleware.authUserMiddleware, orderController.getOrderById);

module.exports = router;
