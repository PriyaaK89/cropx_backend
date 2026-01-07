const multer = require("multer");
const multerS3 = require("multer-s3");
const s3 = require("../config/s3");
const path = require("path");

const s3Upload = (folderName) => {
  return multer({
    storage: multerS3({
      s3,
      bucket: process.env.AWS_BUCKET_NAME,
      // acl: "public-read",
      contentType: multerS3.AUTO_CONTENT_TYPE,
      key: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const fileName = `${folderName}/${Date.now()}-${Math.round(
          Math.random() * 1e9
        )}${ext}`;
        cb(null, fileName);
      },
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.startsWith("image")) {
        return cb(new Error("Only image files allowed"), false);
      }
      cb(null, true);
    },
  });
};

module.exports = s3Upload;

