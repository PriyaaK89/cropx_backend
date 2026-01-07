const express = require("express");
const multer = require("multer");
const { addCollection,getCollections,mapCategory,updateCollection,deleteCollection} = require("../controllers/collectionController");
const router = express.Router();
const s3Upload = require("../middleware/upload");

router.post("/create-collection", s3Upload("collections").single('image'), addCollection);
router.get("/all-collections", getCollections);
router.post("/map-category", mapCategory);
router.put( "/collections/:id", s3Upload("collections").single('image'), updateCollection);
router.delete("/collection/:id", deleteCollection);

module.exports = router;
