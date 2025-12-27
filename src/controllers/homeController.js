const { getHomepageCollections, getProductsByCollectionId,} = require("../models/homeModel");
const { formatProducts } = require("../service/productFormatter");

exports.getHomepageData = async (req, res) => {
  try {
    const collections = await getHomepageCollections();

    console.log("HOME COLLECTIONS:", collections);

    for (let col of collections) {
      console.log("COLLECTION ID:", col.id);
      const products = await getProductsByCollectionId(col.id, 10);
      console.log( `PRODUCTS FOR COLLECTION ${col.id}:`, products);
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

exports.getHomepageCollectionsWithProducts = async (req, res) => {
  console.log(" FORMATTED HOMEPAGE API HIT ");

  try {
    const collections = await getHomepageCollections();
    const finalResponse = [];

    for (const collection of collections) {
      const productIds = await getProductsByCollectionId(collection.id, 10);
      console.log("PRODUCT IDS:", productIds);

      const products = productIds.length
        ? await formatProducts({ productIds })
        : [];

      console.log("FORMATTED PRODUCTS:", products);

      finalResponse.push({
        id: collection.id,
        title: collection.title,
        slug: collection.slug,
        image: collection.image,
        products,
      });
    }

    res.json({
      success: true,
      data: finalResponse,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

