const cartModel = require("../models/cartModel");

function groupByProduct(singleRows = [], multiRows = []) {
  const productMap = {};

  // -------------------------
  // GROUP SINGLE PACK ITEMS
  // -------------------------
  for (let row of singleRows) {
    if (!row || !row.product_id) continue;

    if (!productMap[row.product_id]) {
      productMap[row.product_id] = {
        product_id: row.product_id,
        product_name: row.product_name,
        product_category: row.product_category,
        product_description: row.product_description,
        product_type: row.product_type,
        product_img: row.product_img,
        mfg_date: row.mfg_date,
        exp_date: row.exp_date,
        // stock_qty: row.stock_qty || 0,
        single_packs: [],
        multi_packs: []
      };
    }

    if (row.variant_id) {
      productMap[row.product_id].single_packs.push({
        cart_item_id: row.cart_id,
        variant_id: row.variant_id,
        quantity_value: row.quantity_value,
        quantity_type: row.quantity_type,
        actual_price: row.actual_price,
        discount_percent: row.discount_percent,
        discounted_price: row.discounted_price,
        cart_quantity: row.cart_quantity,
        total_price: row.total_price
      });
    }
  }

  // -------------------------
  // GROUP MULTI PACK ITEMS
  // -------------------------
  for (let row of multiRows) {
    if (!row || !row.product_id) continue;

    if (!productMap[row.product_id]) {
      productMap[row.product_id] = {
        product_id: row.product_id,
        product_name: row.product_name,
        product_category: row.product_category,
        product_description: row.product_description,
        product_type: row.product_type,
        product_img: row.product_img,
        mfg_date: row.mfg_date,
        exp_date: row.exp_date,
        // stock_qty: row.stock_qty || 0,
        single_packs: [],
        multi_packs: []
      };
    }

    if (row.multipack_id) {
      productMap[row.product_id].multi_packs.push({
        cart_item_id: row.cart_id,
        multipack_id: row.multipack_id,
        variant_id: row.variant_id,
        base_quantity: row.base_pack,     // correct column
        base_quantity_type: row.base_quantity_type,       // correct column
        pack_quantity: row.pack_quantity,
        total_quantity_value: row.total_quantity_value,
        quantity_type: row.quantity_type,
        actual_price: row.actual_price,
        discount_percentage: row.discount_percentage,
        discounted_price: row.discounted_price,
        cart_quantity: row.cart_quantity,
        total_price: row.total_price
      });
    }
  }

  return Object.values(productMap);
}




exports.getCartData = async (user_id) => {
  const singleRows = await cartModel.getSinglePackItems(user_id) || [];
  const multiRows = await cartModel.getMultiPackItems(user_id) || [];

  const subtotal = [...singleRows, ...multiRows].reduce(
    (sum, item) => sum + Number(item.total_price),
    0
  );

  const delivery_fee = subtotal > 500 ? 0 : 70;
  const gst = 0; // optional
  const grand_total = subtotal + delivery_fee + gst;

  const grouped = groupByProduct(singleRows, multiRows);

  return {
    cart_items: [...singleRows, ...multiRows].reduce((sum, item) => sum + item.cart_quantity, 0),

    price_summary: {
      subtotal,
      gst,
      delivery_fee,
      grand_total
    },

    cart: grouped
  };
};
