const {
  createCollection,
  mapChildCategory,
  getAllCollections,updateCollection, deleteCollectionById,
  deleteCollectionCategoryMap
} = require("../models/collectionModel");
const fs = require("fs");

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

       const imageUrl = req.file.location; 

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
      image = req.file.location; 
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


exports.deleteCollection = async (req, res) => {
  try {
    const { id } = req.params;

    await deleteCollectionCategoryMap(id);

    const result = await deleteCollectionById(id);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Collection not found"
      });
    }

    res.json({
      success: true,
      message: "Collection deleted successfully"
    });
  } catch (err) {
    console.error("Delete Collection Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
