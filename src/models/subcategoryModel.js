const db = require("../config/db");

exports.createSubCategory = async (category_id, name) => {
  const sql = `INSERT INTO sub_categories (category_id, name) VALUES (?, ?)`;
  const [result] = await db.query(sql, [category_id, name]);
  return result;
};

exports.getSubCategory = async(category_id)=>{
    const [rows] = await db.query(
        `SELECT * FROM sub_categories WHERE category_id = ?`,[category_id]
    )
    return rows;
}