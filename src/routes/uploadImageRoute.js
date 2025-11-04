const express = require('express');
const multer = require('multer');
const { uploadImage } = require('../controllers/uploadimage.controller');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/upload-image', upload.single('image'), uploadImage);

module.exports = router;