const express = require("express");
const multer = require("multer");
const { addProduct, getProducts, removeProducts, UpdateProducts } = require("../controllers/productController");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/add-product", upload.single("product_img"), addProduct);
router.get("/get-products", getProducts);
router.delete("/delete-product/:id", removeProducts);
router.put("/update-product/:id",upload.single("product_img"),UpdateProducts);

module.exports = router;
