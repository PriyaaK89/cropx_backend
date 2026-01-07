const db = require("../config/db");

exports.createChildCategory = async (
  sub_category_id,
  name,
  slug = null,
  menu_order = 0
) => {
  const sql = `
    INSERT INTO child_categories (sub_category_id, name, slug, menu_order)
    VALUES (?, ?, ?, ?)
  `;
  const [result] = await db.query(sql, [
    sub_category_id,
    name,
    slug,
    menu_order
  ]);
  return result;
};

exports.getChildCategory = async (sub_category_id) => {
  const [rows] = await db.query(
    `
    SELECT id, sub_category_id, name, slug, menu_order, created_at
    FROM child_categories
    WHERE sub_category_id = ?
    ORDER BY menu_order ASC, created_at DESC
    `,
    [sub_category_id]
  );
  return rows;
};

exports.deleteChildCategory = async(id)=>{
   const sql = "DELETE FROM child_categories WHERE id = ?";
   const [result] = await db.query(sql, [id]);
   return result;
}