const fs = require("fs");
const { createProductDetails } = require("../models/productDetailsModel");
const { getProductbyId } = require("../models/productModel");
const { getVariantsByProduct } = require("../models/productVarientModel");
const {
  updateProductDetails,
  getDetailsByProductId,
} = require("../models/productDetailsModel");
const imgbbService = require("../service/ImgbbService");

exports.addProductDetails = async (req, res) => {
  try {
    const { product_id } = req.params;

    if (!product_id) {
      return res.status(400).json({ message: "product_id required" });
    }

    const files = req.files || [];
    const imageUrls = [];

    // Upload each file to ImgBB
    for (const file of files) {
      const url = await imgbbService.uploadToImgBB(file.buffer, file.originalname);
      imageUrls.push({ src: url });
    }

    // Parse JSON fields from req.body
    const product_overview = safeJSON(req.body.product_overview || "[]");
    const key_features_and_benefits = safeJSON(req.body.key_features_and_benefits || "[]");
    const expert_advice = safeJSON(req.body.expert_advice || "[]");
    const additional_information = safeJSON(req.body.additional_information || "[]");

    const data = {
      images: imageUrls,
      product_overview,
      key_features_and_benefits,
      expert_advice,
      additional_information,
    };

    const result = await createProductDetails({
      product_id,
      ...data,
    });

    return res.status(201).json({
      success: true,
      message: "Product detail added",
      detail_id: result.insertId,
      data,
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
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const variants = await getVariantsByProduct(product_id);
    const detail = await getDetailsByProductId(product_id);

    const finalResponse = {
      id: product.id,
      product_name: product.product_name,
      product_description: product.product_description,
      product_type: product.product_type,
      product_img: product.product_img,

      brand: product.brand,

      category: {
        id: product.category_id,
        name: product.category_name,
      },

      sub_category: {
        id: product.sub_category_id,
        name: product.sub_category_name,
      },

      child_category: {
        id: product.child_category_id,
        name: product.child_category_name,
      },

      rating: {
        average: Number(product.avg_rating).toFixed(1),
        count: product.rating_count,
      },

      single_packs: variants.single_packs,
      multi_packs: variants.multi_packs,

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
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};




const parseField = (value) => {
  try {
    if (!value) return [];
    if (typeof value === "string") return JSON.parse(value);
    return value;
  } catch (err) {
    console.log("parseField failed =>", value);
    return [];
  }
};

exports.editProductDetails = async (req, res) => {
  try {
    const { product_id } = req.params;

    const existing = await getDetailsByProductId(product_id);
    if (!existing) {
      return res.status(404).json({ message: "Details not found" });
    }

    let updateData = {};
    const files = req.files || [];

    // Handle file uploads (using memoryStorage)
    if (files.length > 0) {
      const formattedImages = [];

      for (const file of files) {
        const base64Img = file.buffer.toString("base64");
        const url = await imgbbService.uploadToImgBB(base64Img, file.originalname);

        formattedImages.push({ src: url }); // FIX ✔
      }

      updateData.images = JSON.stringify(formattedImages); // FIX ✔
    }

    // Handle JSON body fields
    if (req.body?.product_overview) {
      updateData.product_overview = JSON.stringify(parseField(req.body.product_overview));
    }

    if (req.body?.key_features_and_benefits) {
      updateData.key_features_and_benefits = JSON.stringify(
        parseField(req.body.key_features_and_benefits)
      );
    }

    if (req.body?.expert_advice) {
      updateData.expert_advice = JSON.stringify(parseField(req.body.expert_advice));
    }

    if (req.body?.additional_information) {
      updateData.additional_information = JSON.stringify(
        parseField(req.body.additional_information)
      );
    }

    // Update DB
    await updateProductDetails(product_id, updateData);

    // Fetch updated record
    const updated = await getDetailsByProductId(product_id);

    // Prepare response
    const responseData = {
      product_id: updated.product_id,

      images: updated.images ? JSON.parse(updated.images) : [],  // FIX ✔ No more .map()
      product_overview: updated.product_overview ? JSON.parse(updated.product_overview) : [],
      key_features_and_benefits: updated.key_features_and_benefits
        ? JSON.parse(updated.key_features_and_benefits)
        : [],
      expert_advice: updated.expert_advice ? JSON.parse(updated.expert_advice) : [],
      additional_information: updated.additional_information
        ? JSON.parse(updated.additional_information)
        : [],
    };

    return res.status(200).json({
      success: true,
      message: "Product Details Updated Successfully",
      data: responseData,
    });
  } catch (err) {
    console.log("Edit Product Error => ", err);
    res.status(500).json({ message: "Internal server error" });
  }
};





