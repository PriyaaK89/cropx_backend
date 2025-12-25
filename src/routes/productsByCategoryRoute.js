const express = require("express");
const router = express.Router();
const {bestSellingProducts} = require("../controllers/productByTypeController");

router.get("/products/best-selling", bestSellingProducts);
router.get("/products/new-arrivals", newArrivals);
router.get("/products/featured", featuredProducts);
