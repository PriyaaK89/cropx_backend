const express = require("express");
const router = express.Router();
const {addProductDetails, getProductDetails, updateProductDetails} = require("../controllers/productDetailsController")

router.post("/add-product-details/:product_id", addProductDetails);
router.get("/get-product-details/:product_id", getProductDetails);
router.put("/update-product-details/:product_id", updateProductDetails);

module.exports = router