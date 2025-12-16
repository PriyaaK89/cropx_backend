const express = require("express");
const router = express.Router();
const ratingController = require("../controllers/ratingController");
const auth = require("../middleware/auth")

router.post("/rate-product",auth, ratingController.rateProduct);

module.exports = router;
