const {findCartItem,updateQuantity,addCartItem} = require("../models/cartModel");
const db = require("../config/db");

exports.addToCart = async (req, res) => {
  try {
    const { user_id, product_id, variant_id, multipack_id, quantity } = req.body;

    if (!user_id || !product_id || !quantity) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    //  Fetch product info (to check stock & expiry)
    const [productRows] = await db.query(
      "SELECT stock_qty, exp_date, product_name FROM products WHERE id = ? LIMIT 1",
      [product_id]
    );

    if (productRows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    const product = productRows[0];
    // const currentDate = new Date();
    // const expDate = new Date(product.exp_date);

    // //  Check expiry
    // if (product.exp_date && expDate < currentDate) {
    //   return res.status(400).json({
    //     message: `Cannot add "${product.product_name}" to cart — product is expired.`,
    //   });
    // }

    //  Check stock availability
    if (product.stock_qty < quantity) {
      return res.status(400).json({
        message: `Only ${product.stock_qty} units available in stock.`,
      });
    }

    //  Check if item already exists in cart
    const existingItem = await findCartItem(
      user_id,
      product_id,
      variant_id,
      multipack_id
    );

    if (existingItem) {
      // Update cart quantity
      await updateQuantity(existingItem.id, quantity);
    } else {
      // Add new entry
      await addCartItem(user_id, product_id, variant_id, multipack_id, quantity);
    }

    //  Decrease stock in products table
    await db.query(
      `UPDATE products SET stock_qty = stock_qty - ? WHERE id = ?`,
      [quantity, product_id]
    );

    return res.status(200).json({
      success: true,
      message: existingItem
        ? "Cart updated successfully and stock adjusted."
        : "Item added to cart successfully and stock updated.",
    });
  } catch (error) {
    console.error("Add to cart error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
