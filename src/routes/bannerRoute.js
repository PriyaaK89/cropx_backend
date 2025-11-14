const express = require("express");
const multer = require("multer");
const { uploadBanner, fetchBanners, deleteBanners } = require("../controllers/bannerController");

const router = express.Router();
const upload = multer({ dest:"uploads/" });

router.post("/add-banner", upload.single("banner"), uploadBanner);
router.get("/get-banners", fetchBanners);
router.delete("/delete-banner/:id",deleteBanners )

module.exports = router;
