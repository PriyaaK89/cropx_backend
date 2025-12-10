const express = require("express");
const router = express.Router();
const adminOrderController = require("../controllers/adminOrderController");

router.get("/admin/order-list", adminOrderController.getAdminOrderList);

module.exports = router;