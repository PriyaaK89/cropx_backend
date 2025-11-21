const express = require("express");
const multer = require("multer");
const { uploadBanner, fetchBanners, deleteBanners } = require("../controllers/bannerController");
const auth = require("../middleware/auth")

const router = express.Router();
const upload = multer({ dest:"uploads/" });

router.post("/add-banner", auth, upload.single("banner"), uploadBanner);
router.get("/get-banners", fetchBanners);
router.get("/admin/get-banners",auth, fetchBanners);
router.delete("/delete-banner/:id", auth, deleteBanners )

module.exports = router;
