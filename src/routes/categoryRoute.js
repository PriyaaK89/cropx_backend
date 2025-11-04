const express = require("express");
const multer = require("multer");
const { addCategory, getCategories } = require("../controllers/categoryController");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/add-category", upload.single("image"), addCategory);
router.get("/get-category", getCategories);

module.exports = router;
