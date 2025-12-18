const fs = require("fs");
const path = require("path");
const { createCategory, getAllCategories, deleteCategory,} = require("../models/categoryModel");
const imgbbService = require("../service/ImgbbService");

exports.addCategory = async (req, res) => {
  try {
    const { cate_name, description } = req.body;

    if (!cate_name)
      return res.status(400).json({ message: "Category name is required" });
    if (!req.file)
      return res.status(400).json({ message: "Image is required" });

    const filePath = path.resolve(req.file.path);
    const base64 = fs.readFileSync(filePath, { encoding: "base64" });

    const imageUrl = await imgbbService.uploadToImgBB(
      base64,
      req.file.originalname
    );

    fs.unlinkSync(filePath);

    const result = await createCategory(cate_name, description || "", imageUrl);

    return res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: {
        id: result.insertId,
        cate_name,
        description: description || "",
        image: imageUrl,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
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
