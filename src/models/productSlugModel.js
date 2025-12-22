const db = require("../config/db");

exports.getProductsBySlugModel = async ({
  level,
  slug,
  page,
  limit,
  minPrice,
  maxPrice,
  rating,
  sort,
  stock
}) => {
  const offset = (page - 1) * limit;

  let joinClause = "";
  let whereClause = "";
  let values = [];
if (level === "collection") {
  joinClause = `
    JOIN collection_category_map m ON p.child_category_id = m.child_category_id
    JOIN collections c ON c.id = m.collection_id
  `;
  whereClause = `c.slug = ?`;
  values.push(slug);
}
  // 🔹 LEVEL BASED JOIN
  if (level === "category") {
    joinClause = `JOIN categories c ON p.category_id = c.id`;
    whereClause = `c.slug = ?`;
    values.push(slug);
  }

  if (level === "sub-category") {
    joinClause = `JOIN sub_categories sc ON p.sub_category_id = sc.id`;
    whereClause = `sc.slug = ?`;
    values.push(slug);
  }

  if (level === "child-category") {
    joinClause = `JOIN child_categories cc ON p.child_category_id = cc.id`;
    whereClause = `cc.slug = ?`;
    values.push(slug);
  }

  // 🔹 FILTERS
  if (minPrice) {
    whereClause += ` AND v.discounted_price >= ?`;
    values.push(minPrice);
  }

  if (maxPrice) {
    whereClause += ` AND v.discounted_price <= ?`;
    values.push(maxPrice);
  }

  if (rating) {
    whereClause += ` AND p.rating >= ?`;
    values.push(rating);
  }

  if (stock === "in") whereClause += ` AND v.stock_qty > 0`;
  if (stock === "out") whereClause += ` AND v.stock_qty = 0`;

  // 🔹 SORT
  let orderBy = "p.id DESC";
  if (sort === "price_low") orderBy = "starting_price ASC";
  if (sort === "price_high") orderBy = "starting_price DESC";
  if (sort === "rating") orderBy = "p.rating DESC";
  if (sort === "best_selling") orderBy = "p.total_sold DESC";

  const sql = `
    SELECT
      p.id,
      p.product_name,
      p.product_img,
      p.rating,
      p.rating_count,
      p.total_sold,
      MIN(v.discounted_price) AS starting_price,
      SUM(v.stock_qty) AS total_stock
    FROM products p
    ${joinClause}
    JOIN product_variants v ON v.product_id = p.id
    WHERE ${whereClause}
    GROUP BY p.id
    ORDER BY ${orderBy}
    LIMIT ? OFFSET ?
  `;

  values.push(Number(limit), Number(offset));

  const [rows] = await db.query(sql, values);
  return rows;
};
