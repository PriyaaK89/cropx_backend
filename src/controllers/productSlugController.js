const {getProductsBySlugModel} = require("../models/productSlugModel");

exports.getProductsBySlug = async (req, res) => {
  try {
    const { level, slug } = req.params;

    const {
      page = 1,
      limit = 12,
      minPrice,
      maxPrice,
      rating,
      sort,
      stock
    } = req.query;

    const data = await getProductsBySlugModel({
      level,
      slug,
      page: Number(page),
      limit: Number(limit),
      minPrice,
      maxPrice,
      rating,
      sort,
      stock
    });

    return res.status(200).json({
      success: true,
      page: Number(page),
      limit: Number(limit),
      totalItems: data.length,
      data
    });
  } catch (error) {
    console.error("getProductsBySlug Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch products"
    });
  }
};
