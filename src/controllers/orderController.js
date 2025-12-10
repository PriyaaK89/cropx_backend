const CartService = require("../service/cartService");
const Address = require("../models/addressModel");
const Order = require("../models/orderModel");
const db = require("../config/db")

exports.getOrderSummary = async (req, res) => {
  try {
    const user_id = req.params.user_id;

    if (!user_id) {
      return res.status(400).json({ message: "user_id is required" });
    }

    // Fetch cart data with price summary
    const cartData = await CartService.getCartData(user_id);

    if (!cartData || cartData.cart_items === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const delivery_address = await Address.getLatestAddressForOrder(user_id);

    if(!delivery_address){
      return res.status(400).json({
        message: 'No delivery address found. Please add an address first.'
      })
    }

    // Return order summary
    return res.status(200).json({
      success: true,
      order_summary: cartData.price_summary,
      cart_items_count: cartData.cart_items,
      cart_products: cartData.cart,
      delivery_address: delivery_address
    });

  } catch (error) {
    console.error("Order summary error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.placeOrder = async (req, res) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const { user_id, address_id, payment_method } = req.body;

    if (!user_id || !address_id || !payment_method) {
      return res.status(400).json({
        message: "user_id, address_id, and payment_method are required"
      });
    }

    if (!["COD", "ONLINE"].includes(payment_method)) {
      return res.status(400).json({ message: "Invalid payment method" });
    }

    //  1. Fetch Cart
    const cartData = await CartService.getCartData(user_id);
    if (!cartData || cartData.cart_items === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    //  2. Amount Calculation
    const subtotal = cartData.price_summary.subtotal;
    const delivery_fee = subtotal < 500 ? 70 : 0;
    const total_amount = subtotal + delivery_fee;

    //  3. Payment Logic
    let payment_status = "PENDING";
    let fake_transaction_id = null;

    if (payment_method === "ONLINE") {
      payment_status = "PAID";
      fake_transaction_id = "FAKE_TXN_" + Date.now();
    }

    //  4. Create Order
    const order_id = await Order.createOrder({
      user_id,
      address_id,
      subtotal,
      delivery_fee,
      total_amount,
      payment_method,
      payment_status,
      fake_transaction_id,
      order_status: "PLACED"
    }, connection);

    //  5. Insert Order Items + Reduce Stock (CORRECT GROUPED LOOP)
    for (let product of cartData.cart) {

      // -------- SINGLE PACK ITEMS --------
      for (let item of product.single_packs) {
        const quantity = item.cart_quantity;
        const price = item.discounted_price || item.actual_price;
        const total_price = quantity * price;

        await Order.createOrderItems({
          order_id,
          product_id: product.product_id,
          variant_id: item.variant_id,
          multipack_id: null,
          quantity,
          price,
          total_price
        }, connection);

        //  Reduce stock (single)
        await connection.query(
          `UPDATE product_variants SET stock_qty = stock_qty - ? WHERE id = ?`,
          [quantity, item.variant_id]
        );
      }

      // -------- MULTI PACK ITEMS --------
      for (let item of product.multi_packs) {
        const quantity = item.cart_quantity;
        const price = item.discounted_price || item.actual_price;
        const total_price = quantity * price;

        await Order.createOrderItems({
          order_id,
          product_id: product.product_id,
          variant_id: item.variant_id,
          multipack_id: item.multipack_id,
          quantity,
          price,
          total_price
        }, connection);

        //  Reduce stock (multipack)
        const totalQty = item.pack_quantity * quantity;

        await connection.query(
          `UPDATE product_variants SET stock_qty = stock_qty - ? WHERE id = ?`,
          [totalQty, item.variant_id]
        );
      }
    }

    //  6. Clear User Cart
    await Order.clearUserCart(user_id, connection);

    await connection.commit();

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order_id,
      payment_method,
      payment_status,
      total_amount
    });

  } catch (error) {
    await connection.rollback();
    console.error("Place Order Error:", error);

    return res.status(500).json({
      message: "Order placement failed",
      error: error.message
    });

  } finally {
    connection.release();
  }
};


exports.updateOrderStatus = async (req, res) => {
  const { order_id, new_status } = req.body;

  const VALID_STATUS = ["PLACED", "DISPATCHED", "SHIPPED", "DELIVERED", "CANCELLED"];

  if (!order_id || !new_status) {
    return res.status(400).json({ message: "order_id and new_status are required" });
  }

  if (!VALID_STATUS.includes(new_status)) {
    return res.status(400).json({ message: "Invalid order status" });
  }

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    //  Update order status
    const result = await Order.updateOrderStatus(order_id, new_status);

    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ message: "Order not found" });
    }

    //  If order is cancelled → restore stock
    if (new_status === "CANCELLED") {
      const items = await Order.getOrderItems(order_id);

      for (const item of items) {
        if (item.variant_id && !item.multipack_id) {
          //  Single Pack Restore
          await connection.query(
            `UPDATE product_variants 
             SET stock_qty = stock_qty + ? 
             WHERE id = ?`,
            [item.quantity, item.variant_id]
          );
        }

        if (item.multipack_id) {
          const [mp] = await connection.query(
            `SELECT pack_quantity, variant_id 
             FROM product_multipacks WHERE id = ?`,
            [item.multipack_id]
          );

          const totalRestoreQty = mp[0].pack_quantity * item.quantity;

          await connection.query(
            `UPDATE product_variants 
             SET stock_qty = stock_qty + ? 
             WHERE id = ?`,
            [totalRestoreQty, mp[0].variant_id]
          );
        }
      }
    }

    await connection.commit();

    return res.status(200).json({
      success: true,
      message: `Order status updated to ${new_status}`
    });

  } catch (error) {
    await connection.rollback();
    console.error("Update Order Status Error:", error);
    return res.status(500).json({
      message: "Failed to update order status",
      error: error.message
    });
  } finally {
    connection.release();
  }
};
