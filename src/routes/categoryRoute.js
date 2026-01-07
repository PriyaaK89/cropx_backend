const express = require("express");
const multer = require("multer");
const { addCategory, getCategories, removeCategory } = require("../controllers/categoryController");

const router = express.Router();
const s3Upload = require("../middleware/upload");

router.post("/add-category",  s3Upload("category").single('image'), addCategory);
router.get("/get-category", getCategories);
router.delete("/delete-category/:id", removeCategory)

module.exports = router;
