const express = require("express");
const multer = require("multer");
const {
  addCollection,
  getCollections,mapCategory,updateCollection
} = require("../controllers/collectionController");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/create-collection", upload.single("image"), addCollection);
router.get("/all-collections", getCollections);
router.post("/map-category", mapCategory);
router.put(
  "/collections/:id",
  upload.single("image"),
  updateCollection
);

module.exports = router;
