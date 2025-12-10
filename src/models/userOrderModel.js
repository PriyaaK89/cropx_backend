const db = require("../config/db");

exports.getUserOrders = async (user_id) => {
  const [orders] = await db.query(
    `SELECT 
       o.id AS order_id,
       o.address_id,
       o.subtotal,
       o.delivery_fee,
       o.total_amount,
       o.payment_method,
       o.payment_status,
       o.order_status,
       o.created_at
     FROM orders o
     WHERE o.user_id = ?
     ORDER BY o.id DESC`,
    [user_id]
  );
  return orders || [];
};

exports.getOrderItemsDetailed = async (order_id) => {
  const [rows] = await db.query(
    `SELECT
       oi.id AS order_item_id,
       oi.product_id,
       p.product_name,
       p.product_category,
       p.product_description,
       p.product_type,
       p.product_img,
       p.mfg_date,
       p.exp_date,

       oi.variant_id,
       oi.multipack_id,
       oi.quantity AS order_quantity,
       oi.price AS item_price,
       oi.total_price AS item_total_price,

       -- variant fields (single pack)
       v.quantity_value AS v_quantity_value,
       v.quantity_type AS v_quantity_type,
       v.actual_price AS v_actual_price,
       v.discount_percent AS v_discount_percent,
       v.discounted_price AS v_discounted_price,

       -- multipack fields (if multipack)
       mp.id AS mp_id,
       mp.variant_id AS mp_variant_id,
       mp.base_pack AS mp_base_pack,
       mp.pack_quantity AS mp_pack_quantity,
       mp.total_quantity_value AS mp_total_quantity_value,
       mp.quantity_type AS mp_quantity_type,
       mp.actual_price AS mp_actual_price,
       mp.discount_percentage AS mp_discount_percentage,
       mp.discounted_price AS mp_discounted_price

     FROM order_items oi
     JOIN products p ON p.id = oi.product_id
     LEFT JOIN product_variants v ON v.id = oi.variant_id
     LEFT JOIN product_multipacks mp ON mp.id = oi.multipack_id
     WHERE oi.order_id = ?`,
    [order_id]
  );

  return rows || [];
};
