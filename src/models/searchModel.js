const db = require("../config/db");

exports.searchProductsAndCategories = async (keyword) => {
  const cleanKeyword = keyword.trim();
  const likeValue = `${cleanKeyword}%`;;
  const isNumber = !isNaN(cleanKeyword);

  let sql = `
    SELECT 
      p.id AS product_id,
      p.product_name,
      p.product_img,
      p.product_category,
      c.id AS category_id,
      c.cate_name
    FROM products p
    LEFT JOIN categories c
      ON LOWER(TRIM(p.product_category)) = LOWER(TRIM(c.cate_name))
    WHERE 
      LOWER(TRIM(p.product_name)) LIKE LOWER(?)
      OR LOWER(TRIM(p.product_category)) LIKE LOWER(?)
  `;

  const params = [likeValue, likeValue];

  //  ID search
  if (isNumber) {
    sql += ` OR p.id = ?`;
    params.push(Number(cleanKeyword));
  }

  sql += ` ORDER BY p.id DESC LIMIT 20`;

  const [rows] = await db.query(sql, params);
  return rows;
};
