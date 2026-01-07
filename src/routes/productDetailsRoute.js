const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
const s3Upload = require("../middleware/upload");

const {addProductDetails, getProductDetails, editProductDetails} = require("../controllers/productDetailsController")

router.post(
  "/add-product-details/:product_id",
  s3Upload("products/details").array("images", 4),
  addProductDetails
);
// router.post("/add-product-details/:product_id", addProductDetails);
router.get("/get-product-details/:product_id", getProductDetails);

router.put(
  "/update-product-details/:product_id",
  s3Upload("products/details").array("images", 4),
  editProductDetails
);

module.exports = router