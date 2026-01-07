const db = require("../config/db");

exports.createSubCategory = async (category_id, name, slug = null, menu_order = 0) => {
  const sql = `
    INSERT INTO sub_categories (category_id, name, slug, menu_order)
    VALUES (?, ?, ?, ?)
  `;
  const [result] = await db.query(sql, [
    category_id,
    name,
    slug,
    menu_order,
  ]);
  return result;
};

exports.getSubCategory = async (category_id) => {
  const [rows] = await db.query(
    `SELECT id, category_id, name, slug, menu_order, created_at
     FROM sub_categories
     WHERE category_id = ?
     ORDER BY menu_order ASC, created_at DESC`,
    [category_id]
  );
  return rows;
};

exports.deleteSubCategory = async(id)=>{
   const sql = "DELETE FROM sub_categories WHERE id = ?";
   const [result] = await db.query(sql,[id]);
   return result;
}