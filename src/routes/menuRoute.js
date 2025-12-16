const express = require("express");
const router = express.Router();
const { getMenu } = require("../controllers/menuController");

// Mega Menu API
router.get("/get-menu", getMenu);

module.exports = router;
