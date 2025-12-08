const { getProductbyId } = require("../models/productModel");
const { getVariantById } = require("../models/productVarientModel");
const { createMultipack } = require("../models/multipackModel");
const { updateMultipack, deleteMultipack } = require("../models/multipackModel");

exports.addMultipack = async (req, res) => {
  try {
    const {
      product_id,
      variant_id,
      pack_quantity,
      unit_price,              //  renamed from actual_price
      discount_percentage,
    } = req.body;

    if (
      !product_id ||
      !variant_id ||
      !pack_quantity ||
      !unit_price ||          //  updated check
      discount_percentage === undefined
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // ensure product exists
    const product = await getProductbyId(product_id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // ensure variant exists
    const variant = await getVariantById(variant_id);
    if (!variant) return res.status(404).json({ message: "Variant not found" });

    const base_pack = variant.quantity_value;
    const total_quantity_value = base_pack * pack_quantity;

    //  updated to use unit_price
    const actual_price = unit_price * pack_quantity;

    const discounted_price =
      actual_price - (actual_price * discount_percentage) / 100;

    const data = {
      product_id,
      variant_id,
      unit_price,                 //  added
      pack_quantity,
      base_pack,
      total_quantity_value,
      quantity_type: variant.quantity_type,
      actual_price,
      discount_percentage,
      discounted_price,
    };

    const result = await createMultipack(data);

    return res.status(201).json({
      success: true,
      message: "Multipack added successfully",
      multipack_id: result.insertId,
      data,
    });
  } catch (error) {
    console.error("Add Multipack Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.updateMultipack = async (req, res) => {
  try {
    const { id } = req.params;
    const {product_id, variant_id, pack_quantity, unit_price, discount_percentage } = req.body; 

    if (!id|| !product_id || !variant_id || !pack_quantity || !unit_price || discount_percentage === undefined) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const variant = await getVariantById(variant_id);
    if (!variant) return res.status(404).json({ message: "Variant not found" });

    const total_quantity_value = variant.quantity_value * pack_quantity;

    // use unit_price for total calculation
    const actual_price = unit_price * pack_quantity;
    const discounted_price =
      actual_price - (actual_price * discount_percentage) / 100;

    const data = {
      product_id,
      unit_price,             
      pack_quantity,
      base_pack: variant.quantity_value,
      total_quantity_value,
      quantity_type: variant.quantity_type,
      actual_price,
      discount_percentage,
      discounted_price,
    };

    const result = await updateMultipack(id, data);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Multipack not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Multipack updated successfully",
      data,
    });
  } catch (error) {
    console.error("Update Multipack Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.deleteMultipack = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await deleteMultipack(id);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Multipack not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Multipack deleted successfully",
    });
  } catch (error) {
    console.error("Delete Multipack Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
