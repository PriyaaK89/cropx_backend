const express = require("express");
const { getHomepageCollectionsWithProducts } = require("../controllers/homeController");
const {
  getHomeCategoryList
} = require("../controllers/homeCategoryController");

const router = express.Router();

router.get("/home", getHomepageCollectionsWithProducts);
router.get("/home/categories", getHomeCategoryList);

module.exports = router;
