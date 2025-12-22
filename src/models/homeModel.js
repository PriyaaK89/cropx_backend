const db = require("../config/db");

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

exports.getProductsByCollectionId = async (collectionId, limit = 10) => {
  console.log("QUERYING PRODUCTS FOR COLLECTION ID:", collectionId);

  const sql = `
    SELECT
      p.id,
      p.product_name,
      p.child_category_id,
      p.product_img,
      p.rating,
      MIN(v.discounted_price) AS price
    FROM products p
    JOIN collection_category_map m
      ON m.child_category_id = p.child_category_id
    LEFT JOIN product_variants v
      ON v.product_id = p.id
    WHERE m.collection_id = ?
    GROUP BY p.id
    LIMIT ?
  `;

  console.log("SQL:", sql);
  console.log("VALUES:", [collectionId, limit]);

  const [rows] = await db.query(sql, [collectionId, limit]);

  console.log("ROWS FOUND:", rows.length);

  return rows;
};


// exports.getProductsByCollectionId = async (collectionId, limit = 10) => {
//   const [rows] = await db.query(`
//     SELECT
//       p.id,
//       p.product_name,
//       p.product_img,
//       p.rating,
//       MIN(v.discounted_price) AS price
//     FROM products p
//     JOIN collection_category_map m
//       ON m.child_category_id = p.child_category_id
//     LEFT JOIN product_variants v
//       ON v.product_id = p.id
//     WHERE m.collection_id = ?
//     GROUP BY p.id
//     LIMIT ?
//   `, [collectionId, limit]);

//   return rows;
// };
