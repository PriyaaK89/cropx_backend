const UserOrder = require("../models/userOrderModel");
const AdminOrder = require("../models/adminOrderModel");

exports.getUserOrderHistory = async (req, res) => {
  try {
    // use req.params.user_id or authenticated user (change as per your auth)
    const user_id = req.params.user_id || req.user?.id;
    if (!user_id) {
      return res.status(400).json({ success: false, message: "Missing user_id" });
    }

    const orders = await UserOrder.getUserOrders(user_id);

    const resultOrders = [];

    for (const order of orders) {
      const items = await UserOrder.getOrderItemsDetailed(order.order_id);

      // Group items by product_id to build product-level object with single_packs & multi_packs
      const productMap = new Map();

      let total_items_count = 0;

      for (const itm of items) {
        total_items_count += Number(itm.order_quantity || 0);

        // if product not present yet, add base product object
        if (!productMap.has(itm.product_id)) {
          productMap.set(itm.product_id, {
            product_id: itm.product_id,
            product_name: itm.product_name,
            product_category: itm.product_category,
            product_description: itm.product_description,
            product_type: itm.product_type,
            product_img: itm.product_img,
            mfg_date: itm.mfg_date,
            exp_date: itm.exp_date,
            single_packs: [],
            multi_packs: []
          });
        }

        const productObj = productMap.get(itm.product_id);

        if (itm.multipack_id == null) {
          // single pack (use variant fields)
          productObj.single_packs.push({
            cart_item_id: itm.order_item_id,            // maps to example's cart_item_id
            variant_id: itm.variant_id,
            quantity_value: itm.v_quantity_value != null ? String(itm.v_quantity_value) : null,
            quantity_type: itm.v_quantity_type || null,
            actual_price: itm.v_actual_price != null ? Number(itm.v_actual_price).toFixed(2) : null,
            discount_percent: itm.v_discount_percent != null ? String(itm.v_discount_percent) : null,
            discounted_price: itm.v_discounted_price != null ? Number(itm.v_discounted_price).toFixed(2) : null,
            cart_quantity: Number(itm.order_quantity) || 0,
            total_price: itm.item_total_price != null ? Number(itm.item_total_price).toFixed(2) : null
          });
        } else {
          // multipack (use mp fields)
          productObj.multi_packs.push({
            cart_item_id: itm.order_item_id,
            multipack_id: itm.multipack_id,
            variant_id: itm.mp_variant_id || itm.variant_id,
            base_quantity: itm.mp_base_pack != null ? String(itm.mp_base_pack) : null,
            pack_quantity: itm.mp_pack_quantity != null ? Number(itm.mp_pack_quantity) : null,
            total_quantity_value: itm.mp_total_quantity_value != null ? String(itm.mp_total_quantity_value) : null,
            quantity_type: itm.mp_quantity_type || itm.v_quantity_type || null,
            actual_price: itm.mp_actual_price != null ? Number(itm.mp_actual_price).toFixed(2) : null,
            discount_percentage: itm.mp_discount_percentage != null ? String(itm.mp_discount_percentage) : null,
            discounted_price: itm.mp_discounted_price != null ? Number(itm.mp_discounted_price).toFixed(2) : null,
            cart_quantity: Number(itm.order_quantity) || 0,
            total_price: itm.item_total_price != null ? Number(itm.item_total_price).toFixed(2) : null
          });
        }
      }

      // Convert productMap to array
      const products = Array.from(productMap.values());

      // Optional: build product_names string similar to previous API (comma separated, including repeats)
      const product_names = items.map(i => i.product_name).join(", ");

      // Get address if you want to include (reuse your function)
      let address = null;
      if (order.address_id) {
        address = await AdminOrder.getAddressById(order.address_id);
      }

      resultOrders.push({
        order_id: order.order_id,
        address_id: order.address_id,
        product_names,
        total_items: String(total_items_count),
        subtotal: order.subtotal != null ? String(order.subtotal) : null,
        delivery_fee: order.delivery_fee != null ? String(order.delivery_fee) : null,
        total_amount: order.total_amount != null ? String(order.total_amount) : null,
        payment_method: order.payment_method,
        payment_status: order.payment_status,
        order_status: order.order_status,
        created_at: order.created_at,
        address,
        products // this includes single_packs & multi_packs arrays per product
      });
    }

    return res.status(200).json({
      success: true,
      message: "User order history fetched successfully",
      orders: resultOrders
    });

  } catch (err) {
    console.error("GetUserOrderHistoryError:", err);
    return res.status(500).json({ success: false, message: "Failed to fetch orders", error: err.message });
  }
};
