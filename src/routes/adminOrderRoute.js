const express = require("express");
const router = express.Router();
const adminOrderController = require("../controllers/adminOrderController");
const auth = require("../middleware/auth")

router.get("/admin/order-list",auth, adminOrderController.getAdminOrderList);

module.exports = router;