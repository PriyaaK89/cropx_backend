const db = require("../config/db");

// FIND TODAY'S CART ITEM (for date-wise entries)
exports.findCartItem = async (user_id, product_id, variant_id, multipack_id) => {
  const [rows] = await db.query(
    `SELECT * FROM cart 
     WHERE user_id = ? 
       AND product_id = ?
       AND (variant_id = ? OR (? IS NULL AND variant_id IS NULL))
       AND (multipack_id = ? OR (? IS NULL AND multipack_id IS NULL))
       AND DATE(created_at) = CURDATE()`,
    [user_id, product_id, variant_id, variant_id, multipack_id, multipack_id]
  );
  return rows[0];
};

// UPDATE QUANTITY (add to existing row)
exports.updateQuantity = async (cartId, quantity) => {
  await db.query(
    `UPDATE cart SET quantity = quantity + ? WHERE id = ?`,
    [quantity, cartId]
  );
};

// ADD NEW CART ROW
exports.addCartItem = async (user_id, product_id, variant_id, multipack_id, quantity) => {
  await db.query(
    `INSERT INTO cart (user_id, product_id, variant_id, multipack_id, quantity)
     VALUES (?, ?, ?, ?, ?)`,
    [user_id, product_id, variant_id, multipack_id, quantity]
  );
};

// ------------------- FETCH ITEMS ---------------------

exports.getSinglePackItems = async (user_id) => {
  const [rows] = await db.query(
    `
    SELECT 
      c.id AS cart_id,
      c.quantity AS cart_quantity,
      c.product_id,

      p.product_name,
      p.product_category,
      p.product_description,
      p.product_type,
      p.product_img,
      p.mfg_date,
      p.exp_date,
      

      v.id AS variant_id,
      v.quantity_type,
      v.quantity_value,
      v.actual_price,
      v.discount_percent,
      v.discounted_price

    FROM cart c
    LEFT JOIN products p ON c.product_id = p.id
    LEFT JOIN product_variants v ON c.variant_id = v.id

    WHERE c.user_id = ?
      AND c.variant_id IS NOT NULL
      AND c.multipack_id IS NULL
    `,
    [user_id]
  );
  return rows || [];
};

exports.getMultiPackItems = async (user_id) => {
  const [rows] = await db.query(
    `
    SELECT 
      c.id AS cart_id,
      c.quantity AS cart_quantity,
      c.product_id,

      p.product_name,
      p.product_category,
      p.product_description,
      p.product_type,
      p.product_img,
      p.mfg_date,
      p.exp_date,
    

      mp.id AS multipack_id,
      mp.variant_id,
      mp.unit_price,
      mp.base_pack,
      mp.pack_quantity,
      mp.total_quantity_value,
      mp.quantity_type,
      mp.total_actual_price,
      mp.discount_percentage,
      mp.total_discounted_price

    FROM cart c
    LEFT JOIN products p ON c.product_id = p.id
    LEFT JOIN product_multipacks mp ON c.multipack_id = mp.id

    WHERE c.user_id = ? AND c.multipack_id IS NOT NULL
    `,
    [user_id]
  );
  return rows || [];
};

// -------------------- MODIFY ITEMS ---------------------

// Get row by cart_id
exports.getCartItemById = async (cart_id) => {
  const [rows] = await db.query(
    `SELECT * FROM cart WHERE id = ? LIMIT 1`,
    [cart_id]
  );
  return rows[0];
};

// Decrease only 1 quantity
exports.decreaseQuantity = async (cart_id) => {
  await db.query(
    `UPDATE cart SET quantity = quantity - 1 WHERE id = ?`,
    [cart_id]
  );
};

// Delete full row
exports.deleteCartItem = async (cart_id) => {
  return db.query(`DELETE FROM cart WHERE id = ?`, [cart_id]);
};

// Increase stock (used when removing from cart)
exports.increaseVariantStock = async (variant_id, qty) => {
  await db.query(
    `UPDATE product_variants SET stock_qty = stock_qty + ? WHERE id = ?`,
    [qty, variant_id]
  );
};

// Find today's cart row WITHOUT cart_id
exports.findCartRowAnyDate = async (user_id, product_id, variant_id, multipack_id) => {
  const [rows] = await db.query(
    `SELECT * FROM cart 
     WHERE user_id = ?
       AND product_id = ?
       AND (variant_id = ? OR (? IS NULL AND variant_id IS NULL))
       AND (multipack_id = ? OR (? IS NULL AND multipack_id IS NULL))
     ORDER BY id DESC
     LIMIT 1`,
    [
      user_id,
      product_id,
      variant_id, variant_id,
      multipack_id, multipack_id
    ]
  );
  return rows[0];
};


