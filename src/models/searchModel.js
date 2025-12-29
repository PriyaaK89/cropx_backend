const db = require("../config/db");

exports.searchProductsAndCategories = async (keyword) => {
  const cleanKeyword = keyword.trim();
  const likeValue = `%${cleanKeyword}%`; 
  const isNumber = !isNaN(cleanKeyword);

  let sql = `
    SELECT DISTINCT
      p.id AS product_id,
      p.product_name,
      p.product_img,

      c.id AS category_id,
      c.cate_name AS category_name,
      c.slug AS category_slug
    FROM products p
    LEFT JOIN child_categories cc ON cc.id = p.child_category_id
    LEFT JOIN sub_categories sc ON sc.id = cc.sub_category_id
    LEFT JOIN categories c ON c.id = sc.category_id
    WHERE
      LOWER(p.product_name) LIKE LOWER(?)
      OR LOWER(c.cate_name) LIKE LOWER(?)
  `;

  const params = [likeValue, likeValue];

  if (isNumber) {
    sql += ` OR p.id = ?`;
    params.push(Number(cleanKeyword));
  }

  sql += ` ORDER BY p.id DESC LIMIT 20`;

  const [rows] = await db.query(sql, params);
  return rows;
};

