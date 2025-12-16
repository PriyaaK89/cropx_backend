const db = require("../config/db");

// Insert or update rating (variant / multipack based)
exports.addOrUpdateRating = async ({
  product_id,
  variant_id,
  multipack_id = null,
  user_id,
  rating
}) => {
  const sql = `
    INSERT INTO product_ratings
      (product_id, variant_id, multipack_id, user_id, rating)
    VALUES (?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE rating = VALUES(rating)
  `;

  return db.query(sql, [
    product_id,
    variant_id,
    multipack_id,
    user_id,
    rating
  ]);
};

// Recalculate product rating (aggregate from all variants & multipacks)
exports.updateProductRatingStats = async (product_id) => {
  const sql = `
    UPDATE products
    SET
      rating = (
        SELECT ROUND(AVG(rating), 1)
        FROM product_ratings
        WHERE product_id = ?
      ),
      rating_count = (
        SELECT COUNT(*)
        FROM product_ratings
        WHERE product_id = ?
      )
    WHERE id = ?
  `;

  return db.query(sql, [product_id, product_id, product_id]);
};
