const express = require("express");
const router = express.Router();
const {
  addChildCategory,
  getChildCategories,
} = require("../controllers/childcategoryController");
const {addSubCategory, getSubCategories} = require("../controllers/subcategoryController")

router.post("/create-child-category", addChildCategory);
router.get("/get-child-categories", getChildCategories);
router.post("/create-subCategory", addSubCategory);
router.get("/get-subcategories", getSubCategories)

module.exports = router;
