const CartService = require("../service/cartService");
const Address = require("../models/addressModel");
const Order = require("../models/orderModel");
const db = require("../config/db");
const crypto = require("crypto");
const razorpay = require("../service/razorpay");


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

    const { 
      user_id, 
      address_id, 
      payment_method,
      razorpay_payment_id,
      razorpay_order_id
    } = req.body;

    // Validation
    if (!user_id || !address_id || !payment_method) {
      return res.status(400).json({
        message: "user_id, address_id, and payment_method are required"
      });
    }

    if (!["COD", "ONLINE"].includes(payment_method)) {
      return res.status(400).json({ message: "Invalid payment method" });
    }

    // Fetch Cart
    const cartData = await CartService.getCartData(user_id);
    if (!cartData || cartData.cart_items === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Calculate Amounts
    const subtotal = cartData.price_summary.subtotal;
    const delivery_fee = subtotal < 500 ? 70 : 0;
    const total_amount = subtotal + delivery_fee;

    // -------------------------------
    // PAYMENT HANDLING
    // -------------------------------
    let payment_status = "PENDING";
    let payment_id = null;

    // For ONLINE Payment → Razorpay details MUST be sent
    if (payment_method === "ONLINE") {
      if (!razorpay_payment_id || !razorpay_order_id) {
        return res.status(400).json({
          message: "Missing razorpay_payment_id or razorpay_order_id"
        });
      }

      payment_status = "PAID";
      payment_id = razorpay_payment_id;
    }

    // -------------------------------
    // CREATE ORDER
    // -------------------------------
    const order_id = await Order.createOrder({
      user_id,
      address_id,
      subtotal,
      delivery_fee,
      total_amount,
      payment_method,
      payment_status,
      payment_id,       // saving real payment id
      order_status: "PLACED"
    }, connection);

    // -------------------------------
    // CREATE ORDER ITEMS & STOCK REDUCTION
    // -------------------------------
    for (let product of cartData.cart) {

      // SINGLE PACK ITEMS
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

        // Reduce Stock
        await connection.query(
          `UPDATE product_variants SET stock_qty = stock_qty - ? WHERE id = ?`,
          [quantity, item.variant_id]
        );
      }

      // MULTIPACK ITEMS
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

        // Reduce stock for multipack
        const totalQty = item.pack_quantity * quantity;

        await connection.query(
          `UPDATE product_variants SET stock_qty = stock_qty - ? WHERE id = ?`,
          [totalQty, item.variant_id]
        );
      }
    }

    // CLEAR CART
    await Order.clearUserCart(user_id, connection);

    await connection.commit();

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order_id,
      payment_method,
      payment_status,
      payment_id,
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

exports.createRazorpayOrder = async (req, res) => {
  try {
    const { amount } = req.body; // amount in INR
    
    if (!amount) {
      return res.status(400).json({ message: "Amount is required" });
    }

    const options = {
      amount: amount * 100,   // convert to paisa
      currency: "INR",
      receipt: "rcpt_" + Date.now(),
    };

    const razorpayOrder = await razorpay
    .orders.create(options);

    return res.status(200).json({
      success: true,
      order_id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
    });

  } catch (error) {
    console.error("Razorpay Order Error:", error);
    return res.status(500).json({ message: "Failed to create Razorpay order" });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Payment verification failed" });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Verify Error:", error);
    res.status(500).json({ message: "Verification failed" });
  }
};


exports.getOrderDetailsById = async (req, res) => {
  try {
    const { order_id } = req.params;

    if (!order_id) {
      return res.status(400).json({ message: "order_id is required" });
    }

    const orderDetails = await Order.getOrderById(order_id);

    if (!orderDetails) {
      return res.status(404).json({ message: "Order not found" });
    }

    // const orderItems = await Order.getOrderItems(order_id);

    return res.status(200).json({
      success: true,
      order: orderDetails,
      // items: orderItems
    });

  } catch (error) {
    console.error("Get Order Details Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};
