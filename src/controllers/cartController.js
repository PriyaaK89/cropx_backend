const {findCartItem,updateQuantity,addCartItem,getSinglePackItems,getMultiPackItems,getCartItemById,decreaseQuantity,deleteCartItem,increaseStock, findCartRowAnyDate} = require("../models/cartModel");
const db = require("../config/db");
const CartService = require("../service/cartService")

exports.addToCart = async (req, res) => {
  try {
    const { user_id, product_id, variant_id, multipack_id, quantity } = req.body;

    if (!user_id || !product_id || !quantity) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    let variantStock, packQty = 1;

    // ----------------------------------------
    //  FETCH STOCK BASED ON SINGLE / MULTIPACK
    // ----------------------------------------

    if (variant_id && !multipack_id) {
      // Single pack
      const [v] = await db.query(
        "SELECT stock_qty FROM product_variants WHERE id = ?",
        [variant_id]
      );
      if (v.length === 0) return res.status(404).json({ message: "Variant not found" });

      variantStock = v[0].stock_qty;
    }

    if (multipack_id) {
      // Multipack
      const [mp] = await db.query(`
        SELECT m.pack_quantity, v.stock_qty
        FROM product_multipacks m
        JOIN product_variants v ON m.variant_id = v.id
        WHERE m.id = ?
      `, [multipack_id]);

      if (mp.length === 0)
        return res.status(404).json({ message: "Multipack not found" });

      packQty = mp[0].pack_quantity;   // e.g. 3-pack
      variantStock = mp[0].stock_qty;  // base variant stock
    }

    // ----------------------------------------
    //  STOCK VALIDATION
    // ----------------------------------------
    const requiredStock = quantity * packQty;

    if (variantStock < requiredStock) {
      return res.status(400).json({
        message: `Only ${variantStock / packQty} multipacks available.`,
      });
    }

    // ----------------------------------------
    //  FIND EXISTING CART ITEM
    // ----------------------------------------
    const existingItem = await findCartItem(
      user_id,
      product_id,
      variant_id,
      multipack_id
    );

    if (existingItem) {
      await updateQuantity(existingItem.id, quantity);
    } else {
      await addCartItem(user_id, product_id, variant_id, multipack_id, quantity);
    }

    // ----------------------------------------
    //  REDUCE STOCK IN VARIANT TABLE (IMPORTANT)
    // ----------------------------------------
    // let variantIdToUpdate = variant_id;

    // if (multipack_id) {
    //   const [mp] = await db.query(
    //     `SELECT variant_id FROM product_multipacks WHERE id = ?`,
    //     [multipack_id]
    //   );

    //   variantIdToUpdate = mp[0].variant_id;
    // }

    // await db.query(
    //   `UPDATE product_variants SET stock_qty = stock_qty - ? WHERE id = ?`,
    //   [requiredStock, variantIdToUpdate]
    // );

    // ----------------------------------------
    //  SUCCESS RESPONSE
    // ----------------------------------------
    return res.status(200).json({
      success: true,
      message: existingItem
        ? "Cart updated successfully"
        : "Item added to cart",
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


exports.removeWholeItem = async (req, res) => {
  try {
    const { cart_id } = req.body;

    if (!cart_id) return res.status(400).json({ message: "cart_id is required" });

    const item = await getCartItemById(cart_id);
    if (!item) return res.status(404).json({ message: "Cart item not found" });

    await deleteCartItem(cart_id);

    if (item.variant_id && !item.multipack_id) {
      // SINGLE PACK
      await db.query(
        `UPDATE product_variants SET stock_qty = stock_qty + ? WHERE id = ?`,
        [item.quantity, item.variant_id]
      );
    }

    if (item.multipack_id) {
      // MULTIPACK
      const [mp] = await db.query(
        `SELECT pack_quantity, variant_id FROM product_multipacks WHERE id = ?`,
        [item.multipack_id]
      );

      const totalReturnQty = mp[0].pack_quantity * item.quantity;

      await db.query(
        `UPDATE product_variants SET stock_qty = stock_qty + ? WHERE id = ?`,
        [totalReturnQty, mp[0].variant_id]
      );
    }

    return res.json({ success: true, message: "Item removed fully" });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


exports.removeSingleItem = async (req, res) => {
  try {
    const { user_id, product_id, variant_id, multipack_id } = req.body;

    if (!user_id || !product_id)
      return res.status(400).json({ message: "user_id and product_id are required" });

    const item = await findCartRowAnyDate(
      user_id,
      product_id,
      variant_id || null,
      multipack_id || null
    );

    if (!item)
      return res.status(404).json({ message: "No matching cart item found" });

    const { id: cart_id, quantity } = item;

    if (quantity > 1) {
      await decreaseQuantity(cart_id);

      if (item.variant_id && !item.multipack_id) {
        // SINGLE PACK
        await db.query(
          `UPDATE product_variants SET stock_qty = stock_qty + 1 WHERE id = ?`,
          [item.variant_id]
        );
      }

      if (item.multipack_id) {
        // MULTIPACK
        const [mp] = await db.query(
          `SELECT pack_quantity, variant_id FROM product_multipacks WHERE id = ?`,
          [item.multipack_id]
        );

        await db.query(
          `UPDATE product_variants SET stock_qty = stock_qty + ? WHERE id = ?`,
          [mp[0].pack_quantity, mp[0].variant_id]
        );
      }

      return res.json({ success: true, message: "1 quantity removed" });
    }

    // quantity == 1 → delete row
    await deleteCartItem(cart_id);

    if (item.variant_id && !item.multipack_id) {
      await db.query(
        `UPDATE product_variants SET stock_qty = stock_qty + 1 WHERE id = ?`,
        [item.variant_id]
      );
    }

    if (item.multipack_id) {
      const [mp] = await db.query(
        `SELECT pack_quantity, variant_id FROM product_multipacks WHERE id = ?`,
        [item.multipack_id]
      );

      await db.query(
        `UPDATE product_variants SET stock_qty = stock_qty + ? WHERE id = ?`,
        [mp[0].pack_quantity, mp[0].variant_id]
      );
    }

    return res.json({ success: true, message: "Item removed completely" });

  } catch (error) {
    console.error("Remove item error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};




