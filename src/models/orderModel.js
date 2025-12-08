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
  const [result] = await db.query(
    `UPDATE orders SET order_status = ? WHERE id = ?`,
    [new_status, order_id]
  );
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