const db = require("../config/db");

exports.UploadBanner = async (imageUrl) => {
  const sql = "INSERT INTO banners (banner_img) VALUES (?)";
  const result = await db.query(sql, [imageUrl]);
  return result;
};

exports.getBanner = async () => {
  const [rows] = await db.query("SELECT * FROM banners ORDER BY id ASC");
  return rows;
};

exports.deleteBanner = async(id)=>{
   const sql = "DELETE FROM banners WHERE id = ?";
   const [result] = await db.query(sql, [id]);
   return result;
}
