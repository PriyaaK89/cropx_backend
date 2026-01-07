const express = require("express");
const s3Upload = require("../middleware/upload");

const router = express.Router();

// default product upload
router.post(
  "/upload-image",
  s3Upload("products").single("image"),
  (req, res) => {
    res.status(200).json({
      success: true,
      imageUrl: req.file.location,
    });
  }
);

module.exports = router;
