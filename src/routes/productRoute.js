const express = require("express");
const multer = require("multer");
const { addProduct, getProducts, removeProducts, UpdateProducts, getProductByID, getProductsByCategory  } = require("../controllers/productController");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/add-product", upload.single("product_img"), addProduct);
router.get("/get-products", getProducts);
router.delete("/delete-product/:id", removeProducts);
router.put("/update-product/:id",upload.single("product_img"),UpdateProducts);
router.get("/get-about-product/:product_id", getProductByID);
router.get("/get-products-by-category/:category", getProductsByCategory);

module.exports = router;
