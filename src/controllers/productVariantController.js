const { createVariant } = require("../models/productVarientModel");
const { getProductbyId } = require("../models/productModel");
const {
  getVariantById,
  updateVariant,
} = require("../models/productVarientModel");

exports.addVariant = async (req, res) => {
  try {
    const {
      product_id,
      quantity_type,
      quantity_value,
      actual_price,
      discount_percent ,
    } = req.body;

    // fetch product type from product main table
    const product = await getProductbyId(product_id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const product_type = product.product_type; // inherited from main product

    // validation based on product_type
    if (product_type === "liquid" && !["liter", "ml"].includes(quantity_type)) {
      return res
        .status(400)
        .json({ message: "Liquid can only be liter or ml" });
    }

    if (product_type === "solid" && !["kg", "gm"].includes(quantity_type)) {
      return res.status(400).json({ message: "Solid can only be kg or gm" });
    }

    const result = await createVariant({
      product_id,
      product_type,
      quantity_type,
      quantity_value,
      actual_price,
      discount_percent,
    });

    return res.status(201).json({
      success: true,
      message: "Variant added successfully",
      variant_id: result.insertId,
      data: {
        product_id,
        product_type,
        quantity_type,
        quantity_value,
        actual_price,
        discount_percent,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.UpdateProductVariant = async (req, res) => {
  try {
    const { variant_id } = req.params;
    const {
      product_id,
      product_type,
      quantity_type,
      quantity_value,
      actual_price,
      discount_percent,
    } = req.body;

    //  Fetch variant to confirm it exists
    const variant = await getVariantById(variant_id);
    if (!variant) {
      return res.status(404).json({ message: "Variant not found!" });
    }

    //  Validate product_id and product_type if provided
    const product = await getProductbyId(product_id);
    if (!product) {
      return res.status(404).json({ message: "Product not found!" });
    }

    if (product.product_type !== product_type) {
      return res.status(400).json({ message: "Product type mismatch!" });
    }

    //  Type-based validation (same as addVariant)
    if (
      product_type === "liquid" &&
      !["liter", "ml"].includes(quantity_type)
    ) {
      return res
        .status(400)
        .json({ message: "Liquid can only be liter or ml" });
    }
    if (
      product_type === "solid" &&
      !["kg", "gm"].includes(quantity_type)
    ) {
      return res.status(400).json({ message: "Solid can only be kg or gm" });
    }

    //  Prepare updated data
    const updatedVariantData = {
      product_id,
      product_type,
      quantity_type: quantity_type || variant.quantity_type,
      quantity_value: quantity_value || variant.quantity_value,
      actual_price: actual_price || variant.actual_price,
      discount_percent: discount_percent || variant.discount_percent,
    };

    //  Update in DB
    await updateVariant(variant_id, updatedVariantData);

    //  Response
    return res.status(200).json({
      success: true,
      message: "Variant updated successfully",
      data: updatedVariantData,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Something went wrong!" });
  }
};
