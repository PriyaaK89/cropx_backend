const fs = require("fs");
const { createCategory, getAllCategories, deleteCategory,} = require("../models/categoryModel");


exports.addCategory = async (req, res) => {
  try {
    const {
      cate_name,
      slug,
      description = "",
      show_in_menu = 1,
      show_on_home = 0,
      menu_order = 0,
      home_order = 0
    } = req.body;

    if (!cate_name || !slug) {
      return res.status(400).json({
        success: false,
        message: "Category name and slug are required"
      });
    }

    let imageUrl = null; // default if no image
    

    //  If image is uploaded
       if (req.file) {
      imageUrl = req.file.location; 
    }

    const result = await createCategory({
      cate_name,
      slug,
      description,
      image: imageUrl, // null if no image
      show_in_menu: Number(show_in_menu),
      show_on_home: Number(show_on_home),
      menu_order: Number(menu_order),
      home_order: Number(home_order)
    });

    return res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: {
        id: result.insertId,
        cate_name,
        slug,
        image: imageUrl
      }
    });

  } catch (error) {
    console.error("Add Category Error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong"
    });
  }
};


exports.getCategories = async (req, res) => {
  try {
    const data = await getAllCategories();

    return res.status(200).json({
      success: true,
      count: data.length,
      categories: data,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

exports.removeCategory = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id)
      return res.status(400).json({ message: "Category ID is required." });

    const result = await deleteCategory(id);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Category not found." });
    }
    return res.status(200).json({
      success: true,
      message: "Category deleted Successfully.",
      deletedID: id,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong!" });
  }
};
