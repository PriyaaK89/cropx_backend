const db = require("../config/db");

exports.searchProductsAndCategories = async (keyword) => {
  const cleanKeyword = keyword.trim();
  const likeValue = `${cleanKeyword}%`;
  const isNumber = !isNaN(cleanKeyword);

  let sql = `
    SELECT 
      p.id AS product_id,
      p.product_name,
      p.product_img,

      p.category_id,
      c.cate_name AS category_name
    FROM products p
    LEFT JOIN categories c
      ON p.category_id = c.id
    WHERE 
      LOWER(p.product_name) LIKE LOWER(?)
      OR LOWER(c.cate_name) LIKE LOWER(?)
  `;

  const params = [likeValue, likeValue];

  // Search by product ID if number
  if (isNumber) {
    sql += ` OR p.id = ?`;
    params.push(Number(cleanKeyword));
  }

  sql += ` ORDER BY p.id DESC LIMIT 20`;

  const [rows] = await db.query(sql, params);
  return rows || [];
};
