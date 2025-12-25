const db = require("../config/db");
exports.getProductsWithVariantsByProductIds = async (productIds = []) => {
  if (!productIds.length) {
    return { variants: [], multipacks: [] };
  }

  /* =========================
     SINGLE PACK VARIANTS
  ========================== */
  const [variants] = await db.query(`
    SELECT
      p.id AS product_id,
      p.product_name,
      p.product_description,
      p.brand,
      p.product_type,
      p.product_img,
      p.mfg_date,
      p.exp_date,

      v.id AS variant_id,
      v.quantity_type,
      v.quantity_value,
      v.actual_price,
      v.discount_percent,
      v.discounted_price,
      v.stock_qty
    FROM products p
    JOIN product_variants v ON v.product_id = p.id
    WHERE p.id IN (?)
  `, [productIds]);

  /* =========================
     MULTI PACKS
  ========================== */
  const [multipacks] = await db.query(`
    SELECT
      p.id AS product_id,
      v.id AS variant_id,
      m.id AS multipack_id,
      m.pack_quantity,
      (v.quantity_value * m.pack_quantity) AS total_quantity_value,
      m.actual_price,
      m.discounted_price
    FROM products p
    JOIN product_variants v ON v.product_id = p.id
    JOIN product_multipacks m ON m.variant_id = v.id
    WHERE p.id IN (?)
  `, [productIds]);

  return { variants, multipacks };
};

exports.getProductsBySlugModel = async ({
  level,
  slug,
  page = 1,
  limit = 12,
  minPrice,
  maxPrice,
  rating,
  sort,
  stock,
}) => {
  const offset = (page - 1) * limit;

  let joinClause = "";
  let whereConditions = [];
  let values = [];

  /* =========================
     LEVEL BASED JOIN
  ========================== */

  if (level === "collection") {
    joinClause = `
      JOIN collection_category_map m 
        ON p.child_category_id = m.child_category_id
      JOIN collections c 
        ON c.id = m.collection_id
    `;
    whereConditions.push("c.slug = ?");
    values.push(slug);
  }

  if (level === "category") {
    joinClause = `JOIN categories c ON p.category_id = c.id`;
    whereConditions.push("c.slug = ?");
    values.push(slug);
  }

  if (level === "sub-category") {
    joinClause = `JOIN sub_categories sc ON p.sub_category_id = sc.id`;
    whereConditions.push("sc.slug = ?");
    values.push(slug);
  }

  if (level === "child-category") {
    joinClause = `JOIN child_categories cc ON p.child_category_id = cc.id`;
    whereConditions.push("cc.slug = ?");
    values.push(slug);
  }

  /* =========================
     FILTERS
  ========================== */

  if (minPrice) {
    whereConditions.push("v.discounted_price >= ?");
    values.push(minPrice);
  }

  if (maxPrice) {
    whereConditions.push("v.discounted_price <= ?");
    values.push(maxPrice);
  }

  if (rating) {
    whereConditions.push("p.rating >= ?");
    values.push(rating);
  }

  if (!whereConditions.length) {
    whereConditions.push("1 = 1");
  }

  /* =========================
     STOCK FILTER (SAFE)
  ========================== */

  let stockCondition = "";

  if (stock === "in") {
    stockCondition = "WHERE total_stock > 0";
  }

  if (stock === "out") {
    stockCondition = "WHERE total_stock = 0";
  }

  /* =========================
     SORTING
  ========================== */

  let orderBy = "id DESC";

  if (sort === "price_low") orderBy = "starting_price ASC";
  if (sort === "price_high") orderBy = "starting_price DESC";
  if (sort === "rating") orderBy = "rating DESC";
  if (sort === "best_selling") orderBy = "total_sold DESC";

  /* =========================
     COUNT QUERY (FIXED)
  ========================== */

  const countSql = `
    SELECT COUNT(*) AS total
    FROM (
      SELECT
        p.id,
        SUM(v.stock_qty) AS total_stock
      FROM products p
      ${joinClause}
      JOIN product_variants v ON v.product_id = p.id
      WHERE ${whereConditions.join(" AND ")}
      GROUP BY p.id
    ) t
    ${stockCondition}
  `;

  const [[{ total }]] = await db.query(countSql, values);

  /* =========================
     FINAL DATA QUERY
  ========================== */

  const dataSql = `
    SELECT *
    FROM (
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
      WHERE ${whereConditions.join(" AND ")}
      GROUP BY p.id
    ) t
    ${stockCondition}
    ORDER BY ${orderBy}
    LIMIT ? OFFSET ?
  `;

  const [rows] = await db.query(dataSql, [
    ...values,
    Number(limit),
    Number(offset),
  ]);

  return {
    rows,
    totalItems: total,
  };
};
