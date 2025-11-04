const db = require("../config/db");

exports.createCategory = async (cate_name, description, imageUrl) => {
  const sql = "INSERT INTO categories (cate_name, description, image) VALUES (?, ?, ?)";
  const [result] = await db.query(sql, [cate_name, description, imageUrl]);
  return result;
};

exports.getAllCategories = async () => {
  const [rows] = await db.query("SELECT * FROM categories");
  return rows;
};

