const express = require("express");
const { getHomepageData } = require("../controllers/homeController");
const {
  getHomeCategoryList
} = require("../controllers/homeCategoryController");

const router = express.Router();

router.get("/home", getHomepageData);
router.get("/home/categories", getHomeCategoryList);

module.exports = router;
