const { createChildCategory, getChildCategory, deleteChildCategory } = require("../models/childCategoryModel");

exports.addChildCategory = async (req, res) => {
  try {
    const { sub_category_id, name, slug, menu_order = 0 } = req.body;

    if (!sub_category_id || !name) {
      return res.status(400).json({
        success: false,
        message: "sub_category_id and name are required",
      });
    }

    const result = await createChildCategory(
      sub_category_id,
      name,
      slug,
      menu_order
    );

    return res.status(201).json({
      success: true,
      message: "Child category created successfully",
      data: {
        id: result.insertId,
        sub_category_id,
        name,
        slug,
        menu_order,
      },
    });
  } catch (error) {
    console.error("Add Child Category Error:", error);
    return res.status(500).json({
      success: false,
      message: "Child category creation failed",
    });
  }
};

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
      message: "Failed to fetch child categories",
    });
  }
};

exports.deleteChildCategories = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id)
      return res
        .status(400)
        .json({ message: "Child Category ID is required." });

        const result = await deleteChildCategory(id);
         if(result.affectedRows === 0){
          return res.status(404).json({
            message: "Category not found."
          })
         }
          return res.status(200).json({
          success: true,
          message: "Child Category deleted successfully.",
          deletedId: id
         })
  } catch (error) {
    console.log(error, "Error in deleting child category.");
    return res.status(500).json({
      message: "Something went wrong!",
    });
  }
};
