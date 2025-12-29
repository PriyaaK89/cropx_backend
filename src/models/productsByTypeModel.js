const db = require("../config/db");

exports.getBestSellingProducts = async (page = 1, limit = 10) => {
  const offset = (page - 1) * limit;

  const sql = `
    SELECT
  p.id,
  p.product_name,
  p.product_img,
  p.rating,
  MIN(v.discounted_price) AS price,
  p.total_sold
FROM products p
LEFT JOIN product_variants v ON v.product_id = p.id
WHERE p.total_sold > 0
GROUP BY p.id
ORDER BY p.total_sold DESC
LIMIT ? OFFSET ?;
  `;

  const [rows] = await db.query(sql, [limit, offset]);
  return rows;
};

exports.getBestSellingCount = async () => {
  const sql = `
    SELECT COUNT(DISTINCT product_id) AS total
    FROM order_items
  `;
  const [[row]] = await db.query(sql);
  return row.total;
};

exports.getNewArrivals = async (page = 1, limit = 10) => {
  const offset = (page - 1) * limit;

  const sql = `
    SELECT
      p.id,
      p.product_name,
      p.product_img,
      p.rating,
      MIN(v.discounted_price) AS price
    FROM products p
    LEFT JOIN product_variants v ON v.product_id = p.id
    GROUP BY p.id
    ORDER BY p.created_at DESC
    LIMIT ? OFFSET ?
  `;

  const [rows] = await db.query(sql, [limit, offset]);
  return rows;
};

exports.getNewArrivalsCount = async () => {
  const sql = `
    SELECT COUNT(*) AS total
    FROM products
  `;
  const [[row]] = await db.query(sql);
  return row.total;
};


exports.getFeaturedProducts = async (page = 1, limit = 10) => {
  const offset = (page - 1) * limit;

  const sql = `
    SELECT
      p.id,
      p.product_name,
      p.product_img,
      p.rating,
      p.rating_count,
      p.total_sold,
      SUM(v.stock_qty) AS total_stock,
      MIN(v.discounted_price) AS price
    FROM products p
    LEFT JOIN product_variants v ON v.product_id = p.id
    WHERE p.is_featured = 1
    GROUP BY p.id
    LIMIT ? OFFSET ?
  `;

  const [rows] = await db.query(sql, [limit, offset]);
  return rows;
};

exports.getFeaturedProductsCount = async () => {
  const sql = `
    SELECT COUNT(*) AS total
    FROM products
    WHERE is_featured = 1
  `;
  const [[row]] = await db.query(sql);
  return row.total;
};

