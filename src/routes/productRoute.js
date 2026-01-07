const express = require("express");
const multer = require("multer");
const { addProduct, getProducts, removeProducts, UpdateProducts, getProductByID, getProductsByCategory  } = require("../controllers/productController");

const router = express.Router();
const upload = multer({ dest: "uploads/" });
const s3Upload = require("../middleware/upload");

router.post("/add-product", s3Upload("products").single('product_img'), addProduct);
router.get("/get-products", getProducts);
router.delete("/delete-product/:id", removeProducts);
router.put("/update-product/:id", s3Upload("products").single("product_img"),UpdateProducts);
router.get("/get-about-product/:product_id", getProductByID);
router.get("/get-products-by-category/:type/:value", getProductsByCategory);

module.exports = router;
