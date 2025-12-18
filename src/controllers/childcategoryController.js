const {
  createChildCategory,
  getChildCategory,
} = require("../models/childCategoryModel");

exports.addChildCategory = async (req, res) => {
  try {
    const { sub_category_id, name } = req.body;

    if (!sub_category_id || !name) {
      return res.status(400).json({
        success: false,
        message: "sub_category_id and name are required",
      });
    }

    const result = await createChildCategory(sub_category_id, name);

    return res.status(201).json({
      success: true,
      message: "Child category created successfully",
      data: {
        id: result.insertId,
        sub_category_id,
        name,
      },
    });
  } catch (error) {
    console.error("Add Child Category Error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

/**
 * Get Child Categories by Sub Category
 * GET /api/child-categories?sub_category_id=ID
 */
exports.getChildCategories = async (req, res) => {
  try {
    const { sub_category_id } = req.query;

    if (!sub_category_id) {
      return res.status(400).json({
        success: false,
        message: "sub_category_id is required",
      });
    }

    const data = await getChildCategory(sub_category_id);

    return res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    console.error("Get Child Categories Error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};
