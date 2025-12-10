const AdminOrder = require("../models/adminOrderModel");

exports.getAdminOrderList = async (req, res) => {
  try {
    const orders = await AdminOrder.getAllOrders();

    for (let order of orders) {
      // Get order items
      order.items = await AdminOrder.getOrderItemsByOrderId(order.order_id);

      // Get address
      order.address = await AdminOrder.getAddressById(order.address_id);
    }

    return res.status(200).json({
      success: true,
      total_orders: orders.length,
      orders
    });

  } catch (error) {
    console.error("Admin Order List Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch admin orders",
      error: error.message
    });
  }
};