const db = require("../config/db");

exports.getMenuData = async () => {
  const query = `
    SELECT 
      product_category,
      sub_category,
      child_category
    FROM products
    WHERE 
      product_category IS NOT NULL 
      AND sub_category IS NOT NULL 
      AND child_category IS NOT NULL
    GROUP BY product_category, sub_category, child_category
    ORDER BY product_category, sub_category, child_category
  `;
  const [rows] = await db.query(query);
  return rows;
};
