const fs = require('fs');
const path = require('path');
const imagbbService = require('../service/ImgbbService');

const imageUrls = [];


// exports.uploadImage = async (req, res) => {
//   try {
//     if (!req.file) return res.status(400).send('No file uploaded.');

//     const filePath = path.resolve(req.file.path);
//     const imageData = fs.readFileSync(filePath, { encoding: 'base64' });

//     const imageUrl = await imagbbService.uploadToImgBB(imageData, req.file.originalname);

//     fs.unlinkSync(filePath); // remove temp file
//     imageUrls.push(imageUrl);

//     res.status(200).json({ success: true, imageUrl });
//   } catch (error) {
//     console.error('Upload failed:', error.message);
//     res.status(500).json({ success: false, message: 'Image upload failed' });
//   }
// };

exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).send("No file uploaded.");

    const filePath = path.resolve(req.file.path);

    const fileBuffer = fs.readFileSync(filePath); 

    const imageUrl = await imagbbService.uploadToImgBB(
      fileBuffer,
      req.file.originalname
    );

    fs.unlinkSync(filePath);

    res.status(200).json({ success: true, imageUrl });
  } catch (error) {
    console.error("Upload failed:", error.message);
    res.status(500).json({ success: false, message: "Image upload failed" });
  }
};
