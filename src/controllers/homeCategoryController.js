const { getHomeCategories } = require("../models/homeCategoryModel");

exports.getHomeCategoryList = async (req, res) => {
  try {
    const categories = await getHomeCategories();

    res.json({
      success: true,
      data: categories
    });
  } catch (err) {
    console.error("Home Category API Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
