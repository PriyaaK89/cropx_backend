const {
  getHomepageCollections,
  getProductsByCollectionId,
} = require("../models/homeModel");

// exports.getHomepageData = async (req, res) => {
//   try {
//     const collections = await getHomepageCollections();

//     for (let col of collections) {
//       col.products = await getProductsByCollectionId(col.id, 10);
//     }

//     res.json({
//       success: true,
//       data: collections,
//     });
//   } catch (err) {
//     console.error("Homepage API Error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };
exports.getHomepageData = async (req, res) => {
  try {
    const collections = await getHomepageCollections();

    console.log("HOME COLLECTIONS:", collections);

    for (let col of collections) {
      console.log("COLLECTION ID:", col.id);

      const products = await getProductsByCollectionId(col.id, 10);

      console.log(
        `PRODUCTS FOR COLLECTION ${col.id}:`,
        products
      );

      col.products = products;
    }

    res.json({
      success: true,
      data: collections,
    });
  } catch (err) {
    console.error("Homepage API Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// exports.getHomepageSections = async (req, res) => {
//   const data = await getHomepageCollections();
//   res.json({
//     success: true,
//     data
//   });
// };
