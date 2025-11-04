const express = require("express");
const multer = require("multer");
const { addProduct, getProducts } = require("../controllers/productController");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/add-product", upload.single("product_img"), addProduct);
router.get("/get-products", getProducts);

module.exports = router;
