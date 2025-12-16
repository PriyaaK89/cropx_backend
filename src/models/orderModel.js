const db = require("../config/db");

exports.createOrder = async(orderData, connection)=>{
    const sql = `INSERT INTO orders (user_id, address_id, subtotal, delivery_fee, total_amount, payment_method, payment_status, fake_transaction_id, order_status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const [result] = await connection.query(sql, [
        orderData.user_id,
        orderData.address_id,
        orderData.subtotal,
        orderData.delivery_fee,
        orderData.total_amount,
        orderData.payment_method,
        orderData.payment_status,
        orderData.fake_transaction_id || null,
        orderData.order_status || 'PLACED'
    ]);
  return  result.insertId;
};

exports.createOrderItems = async(item, connection)=>{
    const sql = `INSERT INTO order_items (order_id, product_id, variant_id, multipack_id, quantity, price, total_price)
    VALUES (?, ?, ?, ?, ?, ?, ?)`;

    await connection.query(sql, [
        item.order_id,
        item.product_id,
        item.variant_id,
        item.multipack_id,
        item.quantity,
        item.price,
        item.total_price
    ])
}

exports.clearUserCart = async(user_id, connection)=>{
    await connection.query("DELETE FROM cart WHERE user_id = ?",[user_id]);
}

exports.updateOrderStatus = async (order_id, new_status) => {
  let sql = `
    UPDATE orders 
    SET order_status = ?,
        delivered_at = CASE 
          WHEN ? = 'DELIVERED' THEN NOW()
          ELSE delivered_at
        END
    WHERE id = ?
  `;

  const [result] = await db.query(sql, [
    new_status,
    new_status,
    order_id
  ]);

  return result;
};
/* Get Order Items (for stock restore on cancel) */
exports.getOrderItems = async (order_id) => {
  const [rows] = await db.query(
    `SELECT * FROM order_items WHERE order_id = ?`,
    [order_id]
  );
  return rows;
};

exports.getOrderById = async (order_id) => {
  //  Fetch Order Master + User + Address
  const [order] = await db.query(
    `
    SELECT 
      o.id AS order_id,
      o.user_id,
      o.address_id,
      o.subtotal,
      o.delivery_fee,
      o.total_amount,
      o.payment_method,
      o.payment_status,
      o.order_status,
      o.created_at,
      o.delivered_at,

      -- Address fields
      a.name,
      a.phone_number,
      a.pincode,
      a.street_name,
      a.city,
      a.state,
      a.landmark

    FROM orders o
    LEFT JOIN delivery_address a ON a.id = o.address_id
    WHERE o.id = ?
    `,
    [order_id]
  );

  if (!order.length) return null;

  //  Fetch Order Items (single + multipack details)
  const [items] = await db.query(
    `
    SELECT
       oi.id AS order_item_id,
       oi.product_id,
       p.product_name,
       p.product_category,
       p.product_description,
       p.product_img,

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
     WHERE oi.order_id = ?
    `,
    [order_id]
  );

  return {
    order_details: order[0],
    order_items: items
  };
};



/* Get order items */
// exports.getOrderItems = async (order_id) => {
//   const [rows] = await db.query(
//     `SELECT 
//         oi.order_id,
//         oi.product_id,
//         oi.variant_id,
//         oi.multipack_id,
//         oi.quantity,
//         oi.price,
//         oi.total_price,
//         p.product_name,
//         pv.variant_name,
//         pv.weight,
//         pv.unit,
//         pv.image
//     FROM order_items oi
//     LEFT JOIN products p ON oi.product_id = p.id
//     LEFT JOIN product_variants pv ON oi.variant_id = pv.id
//     WHERE oi.order_id = ?`,
//     [order_id]
//   );
//   return rows;
// };