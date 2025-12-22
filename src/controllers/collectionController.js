const {
  createCollection,
  mapChildCategory,
  getAllCollections,updateCollection
} = require("../models/collectionModel");
const fs = require("fs");
const path = require("path");
const imgbbService = require("../service/ImgbbService");

// CREATE COLLECTION
exports.addCollection = async (req, res) => {
  try {
    const {
      title,
      slug,
      description,
      show_in_menu = 0,
      show_on_home = 0,
      home_order = 0
    } = req.body;

    if (!title || !slug) {
      return res.status(400).json({ message: "Title and slug required" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Collection image required" });
    }

    // Upload image to ImgBB (same as product)
    const filePath = path.resolve(req.file.path);
    const base64Img = fs.readFileSync(filePath, { encoding: "base64" });

    const imageUrl = await imgbbService.uploadToImgBB(
      base64Img,
      req.file.originalname
    );

    fs.unlinkSync(filePath); // remove temp file

    const result = await createCollection({
      title,
      slug,
      description,
      image: imageUrl,
      show_in_menu,
      show_on_home,
      home_order
    });

    res.status(201).json({
      success: true,
      message: "Collection created successfully",
      id: result.insertId
    });
  } catch (err) {
    console.error("Create Collection Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.mapCategory = async (req, res) => {
  const { collection_id, child_category_id } = req.body;

  await mapChildCategory(collection_id, child_category_id);

  res.json({
    success: true,
    message: "Child category mapped"
  });
};


// GET COLLECTIONS (ADMIN)
exports.getCollections = async (req, res) => {
  const data = await getAllCollections();
  res.json({ success: true, data });
};


exports.updateCollection = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      slug,
      description,
      show_in_menu,
      show_on_home,
      home_order
    } = req.body;

    let image; // only set if new image uploaded

    if (req.file) {
      const filePath = path.resolve(req.file.path);
      const base64Img = fs.readFileSync(filePath, { encoding: "base64" });

      image = await imgbbService.uploadToImgBB(
        base64Img,
        req.file.originalname
      );

      fs.unlinkSync(filePath); // remove temp file
    }

    const result = await updateCollection(id, {
      title,
      slug,
      description,
      image, // undefined = keep old image
      show_in_menu,
      show_on_home,
      home_order
    });

    if (!result || result.affectedRows === 0) {
      return res.status(404).json({ message: "Collection not found" });
    }

    res.json({
      success: true,
      message: "Collection updated successfully"
    });
  } catch (err) {
    console.error("Update Collection Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
