const db = require("../config/db");

/**
 * Get homepage collections
 */
exports.getHomepageCollections = async () => {
  const sql = `
    SELECT id, title, slug, image
    FROM collections
    WHERE show_on_home = 1
    ORDER BY home_order
  `;

  const [rows] = await db.query(sql);
  return rows;
};

/**
 * Get product IDs for a collection
 */
exports.getProductsByCollectionId = async (collectionId, limit = 10) => {
  const sql = `
    SELECT DISTINCT p.id
    FROM products p
    INNER JOIN collection_category_map m
      ON m.child_category_id = p.child_category_id
    WHERE m.collection_id = ?
    LIMIT ?
  `;

  const [rows] = await db.query(sql, [collectionId, limit]);

  // Always return numeric IDs
  return rows.map(r => Number(r.id));
};
