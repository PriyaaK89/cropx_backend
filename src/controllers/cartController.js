const {findCartItem,updateQuantity,addCartItem,getSinglePackItems,getMultiPackItems,getCartItemById,decreaseQuantity,deleteCartItem,increaseStock} = require("../models/cartModel");
const db = require("../config/db");
const CartService = require("../service/cartService")

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

    //  Check stock availability
    if (product.stock_qty < quantity) {
      return res.status(400).json({
        message: `Only ${product.stock_qty} units available in stock.`,
      });
    }

    //  IMPORTANT CHANGE: Find cart item ONLY if created today
    const [existingRows] = await db.query(
      `SELECT * FROM cart 
       WHERE user_id = ? 
         AND product_id = ?
         AND (variant_id = ? OR (? IS NULL AND variant_id IS NULL))
         AND (multipack_id = ? OR (? IS NULL AND multipack_id IS NULL))
         AND DATE(created_at) = CURDATE()`,
      [
        user_id,
        product_id,
        variant_id, variant_id,
        multipack_id, multipack_id,
      ]
    );

    const existingItem = existingRows[0];

    if (existingItem) {
      // Update cart quantity for today's entry
      await updateQuantity(existingItem.id, quantity);
    } else {
      // Create NEW row for a new day
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

exports.getCartItems = async (req, res) => {
  try {
    const user_id = req.params.user_id;

    if (!user_id) {
      return res.status(400).json({ message: "user_id is required" });
    }

    const cartData = await CartService.getCartData(user_id);

    res.json(cartData);

  } catch (err) {
    console.error("Cart fetch error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.removeSingleItem = async (req, res) => {
  try {
    const { cart_id } = req.body;

    if (!cart_id) {
      return res.status(400).json({ message: "cart_id is required" });
    }

    const item = await getCartItemById(cart_id);
    if (!item) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    const { product_id, quantity } = item;

    // Case 1: Reduce one quantity
    if (quantity > 1) {
      await decreaseQuantity(cart_id);
      await increaseStock(product_id, 1);

      return res.json({
        success: true,
        message: "1 quantity removed from item",
      });
    }

    // Case 2: Quantity = 1, delete row
    await deleteCartItem(cart_id);
    await increaseStock(product_id, 1);

    return res.json({
      success: true,
      message: "Item removed completely (last quantity)",
    });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.removeWholeItem = async (req, res) => {
  try {
    const { cart_id } = req.body;

    if (!cart_id) {
      return res.status(400).json({ message: "cart_id is required" });
    }

    const item = await getCartItemById(cart_id);
    if (!item) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    const { product_id, quantity } = item;

    // Remove full item
    await deleteCartItem(cart_id);

    // Return quantity back to stock
    await increaseStock(product_id, quantity);

    return res.json({
      success: true,
      message: "Item removed fully",
    });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};



