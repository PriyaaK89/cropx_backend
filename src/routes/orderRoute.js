const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const userOrderController = require("../controllers/userOrderController")

router.get("/Order-summary/:user_id", orderController.getOrderSummary);
router.post("/place-order", orderController.placeOrder);
router.put("/update-order-status", orderController.updateOrderStatus);
router.get("/order-history/:user_id", userOrderController.getUserOrderHistory);
router.post("/create-order", orderController.createRazorpayOrder);
router.post("/verify-payment", orderController.verifyPayment);
router.get("/order-details/:order_id", orderController.getOrderDetailsById);

module.exports = router;