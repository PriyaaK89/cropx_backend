const db = require("../config/db");

exports.getAllOrders = async () => {
  const [orders] = await db.query(`
    SELECT 
      o.id AS order_id,
      o.user_id,
      u.name AS user_name,
      o.address_id,

      -- Use correct column name
      GROUP_CONCAT(p.product_name SEPARATOR ', ') AS product_names,

      o.subtotal,
      o.delivery_fee,
      o.total_amount,
      o.payment_method,
      o.payment_status,
      o.order_status,
      o.created_at

    FROM orders o
    JOIN users u ON u.id = o.user_id
    JOIN order_items oi ON oi.order_id = o.id
    JOIN products p ON p.id = oi.product_id

    GROUP BY o.id
    ORDER BY o.id DESC
  `);

  return orders;
};


exports.getOrderItemsByOrderId = async (order_id) => {
  const [items] = await db.query(`
    SELECT 
      oi.id,
      oi.product_id,
      p.product_name,
      p.product_img,

      -- Variant details (for single pack)
      v.quantity_value AS variant_quantity_value,
      v.quantity_type AS variant_quantity_type,
      v.actual_price AS variant_actual_price,
      v.discount_percent AS variant_discount_percent,
      v.discounted_price AS variant_discounted_price,

      -- Multipack details
      mp.base_pack,
      mp.pack_quantity,
      mp.total_quantity_value,
      mp.quantity_type AS multipack_quantity_type,
      mp.actual_price AS multipack_actual_price,
      mp.discount_percentage AS multipack_discount_percentage,
      mp.discounted_price AS multipack_discounted_price,

      oi.variant_id,
      oi.multipack_id,
      oi.quantity AS cart_quantity,
      oi.price,
      oi.total_price

    FROM order_items oi
    JOIN products p ON p.id = oi.product_id
    LEFT JOIN product_variants v ON oi.variant_id = v.id
    LEFT JOIN product_multipacks mp ON oi.multipack_id = mp.id

    WHERE oi.order_id = ?
  `, [order_id]);

  return items;
};


exports.getAddressById = async (address_id) => {
  const [rows] = await db.query(
    `SELECT * FROM delivery_address WHERE id = ?`,
    [address_id]
  );
  return rows[0];
};