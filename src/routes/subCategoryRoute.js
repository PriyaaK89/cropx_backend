const express = require("express");
const router = express.Router();
const { addChildCategory, getChildCategories, deleteChildCategories } = require("../controllers/childcategoryController");
const {addSubCategory, getSubCategories, deleteSubCategory} = require("../controllers/subcategoryController")

router.post("/create-child-category", addChildCategory);
router.get("/get-child-categories", getChildCategories);
router.post("/create-subCategory", addSubCategory);
router.get("/get-subcategories", getSubCategories);
router.delete("/delete-subcategory/:id", deleteSubCategory)
router.delete("/delete-child-category/:id", deleteChildCategories);

module.exports = router;
