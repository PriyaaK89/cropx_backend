const express = require("express");
const router = express.Router();
const { getProductsBySlug} = require("../controllers/productSlugController");

// Category / Sub-category / Child-category
router.get("/products/:level/:slug", getProductsBySlug);

module.exports = router;
