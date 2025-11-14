const db = require("../config/db");

exports.findCartItem = async (user_id, product_id, variant_id, multipack_id) => {
  const [rows] = await db.query(
    `SELECT * FROM cart
     WHERE user_id = ?
       AND product_id = ?
       AND (variant_id = ? OR (? IS NULL AND variant_id IS NULL))
       AND (multipack_id = ? OR (? IS NULL AND multipack_id IS NULL))
     LIMIT 1`,
    [user_id, product_id, variant_id, variant_id, multipack_id, multipack_id]
  );
  return rows[0];
};

exports.updateQuantity = async (cartId, quantity) => {
  await db.query(
    `UPDATE cart SET quantity = quantity + ? WHERE id = ?`,
    [quantity, cartId]
  );
};

exports.addCartItem = async (user_id, product_id, variant_id, multipack_id, quantity) => {
  await db.query(
    `INSERT INTO cart (user_id, product_id, variant_id, multipack_id, quantity)
     VALUES (?, ?, ?, ?, ?)`,
    [user_id, product_id, variant_id, multipack_id, quantity]
  );
};
