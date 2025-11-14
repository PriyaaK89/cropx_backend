const { createProductDetails } = require("../models/productDetailsModel");
const { getProductbyId } = require("../models/productModel");
const { getVariantsByProduct } = require("../models/productVarientModel");
const {
  updateProductDetails,
  getDetailsByProductId,
} = require("../models/productDetailsModel");

exports.addProductDetails = async (req, res) => {
  try {
    const { product_id } = req.params;
    const {
      images,
      product_overview,
      key_features_and_benefits,
      expert_advice,
      additional_information,
    } = req.body;

    if (!product_id) {
      return res.status(400).json({ message: "product_id required" });
    }

    const result = await createProductDetails({
      product_id,
      images,
      product_overview,
      key_features_and_benefits,
      expert_advice,
      additional_information,
    });

    return res.status(201).json({
      success: true,
      message: "Product detail added",
      detail_id: result.insertId,
      data: {
        images,
        product_overview,
        key_features_and_benefits,
        expert_advice,
        additional_information,
      },
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const safeJSON = (val) => {
  try {
    return val ? JSON.parse(val) : [];
  } catch (err) {
    console.log("JSON parse failed value => ", val);
    return [];
  }
};

exports.getProductDetails = async (req, res) => {
  try {
    const { product_id } = req.params;

    const product = await getProductbyId(product_id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const variants = await getVariantsByProduct(product_id);
    const detail = await getDetailsByProductId(product_id);

    const finalResponse = {
      id: product.id,
      product_name: product.product_name,
      product_category: product.product_category,
      product_description: product.product_description,
      product_type: product.product_type,
      product_img: product.product_img,
      single_packs: variants.filter(v => !v.multipack_id),
multi_packs: variants.filter(v => v.multipack_id),
      details: detail
        ? {
      images: safeJSON(detail.images),
      product_overview: safeJSON(detail.product_overview),
      key_features_and_benefits: safeJSON(detail.key_features_and_benefits),
      expert_advice: safeJSON(detail.expert_advice),
      additional_information: safeJSON(detail.additional_information),
    }
        : null,
    };

    return res.status(200).json({ success: true, data: finalResponse });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.updateProductDetails = async (req, res) => {
  try {
    const { product_id } = req.params;
    const existing = await getDetailsByProductId(product_id);

    if (!existing)
      return res.status(404).json({ message: "Product detail not found" });

    const data = req.body;

    // convert json fields to string if provided in req
    if (data.images) data.images = JSON.stringify(data.images);
    if (data.product_overview)
      data.product_overview = JSON.stringify(data.product_overview);
    if (data.key_features_and_benefits)
      data.key_features_and_benefits = JSON.stringify(
        data.key_features_and_benefits
      );
    if (data.expert_advice)
      data.expert_advice = JSON.stringify(data.expert_advice);
    if (data.additional_information)
      data.additional_information = JSON.stringify(data.additional_information);

    // update details
    await updateProductDetails(product_id, data);

    // fetch updated details
    const updatedDetails = await getDetailsByProductId(product_id);

    // parse JSON fields before sending
    const responseData = {
      images: updatedDetails.images ? JSON.parse(updatedDetails.images) : [],
      product_overview: updatedDetails.product_overview
        ? JSON.parse(updatedDetails.product_overview)
        : [],
      key_features_and_benefits: updatedDetails.key_features_and_benefits
        ? JSON.parse(updatedDetails.key_features_and_benefits)
        : [],
      expert_advice: updatedDetails.expert_advice
        ? JSON.parse(updatedDetails.expert_advice)
        : [],
      additional_information: updatedDetails.additional_information
        ? JSON.parse(updatedDetails.additional_information)
        : [],
    };

    return res.status(200).json({
      success: true,
      message: "Product Details updated",
      data: responseData,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

