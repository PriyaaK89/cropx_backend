const fs = require("fs");
const path = require("path");
const imgbbService = require("../service/ImgbbService");
const {
  createProduct,
  deleteProduct,
  getProductbyId,
  updateProduct,
  getProductsWithVariants,
  getProductsByCategoryModel,
} = require("../models/productModel");
const { getVariantsByProduct } = require("../models/productVarientModel");

exports.addProduct = async (req, res) => {
  try {
    const {
      product_name,
      product_category,
      product_description,
      product_type,
      stock_qty,
      mfg_date,
      exp_date,
    } = req.body;

    if (!product_name || !product_category || !product_type) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (!req.file)
      return res.status(400).json({ message: "product image required" });

    // upload image to imgbb
    const filePath = path.resolve(req.file.path);
    const base64Img = fs.readFileSync(filePath, { encoding: "base64" });

    const imageUrl = await imgbbService.uploadToImgBB(
      base64Img,
      req.file.originalname
    );

    fs.unlinkSync(filePath); // remove local file temp

    const product = {
      product_name,
      product_category,
      product_description,
      product_type,
      product_img: imageUrl,
      stock_qty,
      mfg_date,
      exp_date,
    };

    const result = await createProduct(product);

    return res.status(201).json({
      success: true,
      message: "Product added successfully",
      id: result.insertId,
      data: product,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

exports.getProducts = async (req, res) => {
  try {
    let {
      page = 1,
      limit = 10,
      search = "",
      category = "",
      expiry_status = "",
    } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);
    const startIndex = (page - 1) * limit;

    // 1️⃣ Fetch all products with variants + multipacks
    const { variants, multipacks } = await getProductsWithVariants();

    // 2️⃣ Format products
    const finalData = variants.reduce((acc, variant) => {
      let product = acc.find((p) => p.id === variant.product_id);
      if (!product) {
        product = {
          id: variant.product_id,
          product_name: variant.product_name,
          product_category: variant.product_category,
          product_description: variant.product_description,
          product_type: variant.product_type,
          product_img: variant.product_img,
          stock_qty: variant.stock_qty,
          mfg_date: variant.mfg_date,
          exp_date: variant.exp_date,
          single_packs: [],
          multi_packs: [],
        };
        acc.push(product);
      }

      product.single_packs.push({
        variant_id: variant.variant_id,
        quantity_value: variant.quantity_value,
        quantity_type: variant.quantity_type,
        actual_price: variant.actual_price,
        discount_percent: variant.discount_percent,
        discounted_price: variant.discounted_price,
      });

      return acc;
    }, []);

    // 3️⃣ Add multipacks
    multipacks.forEach((mp) => {
      const product = finalData.find((p) => p.id === mp.product_id);
      if (product) {
        product.multi_packs.push({
          multipack_id: mp.multipack_id,
          variant_id: mp.variant_id,
          base_quantity_value: mp.base_quantity_value,
          base_quantity_type: mp.base_quantity_type,
          pack_quantity: mp.pack_quantity,
          total_quantity_value: mp.total_quantity_value,
          total_actual_price: mp.total_actual_price,
          total_discounted_price: mp.total_discounted_price,
        });
      }
    });

    // 4️⃣ Add expiry status
    const currentDate = new Date();

    finalData.forEach((product) => {
      if (product.exp_date) {
        const expDate = new Date(product.exp_date);
        const diffMonths =
          (expDate.getFullYear() - currentDate.getFullYear()) * 12 +
          (expDate.getMonth() - currentDate.getMonth());

        if (diffMonths > 8) {
          product.expiry_status = "Up to Date";
        } else if (diffMonths > 0 && diffMonths <= 3) {
          product.expiry_status = "Near Expiry";
        } else if (expDate < currentDate) {
          product.expiry_status = "Expired";
        } else {
          product.expiry_status = "Moderate";
        }
      } else {
        product.expiry_status = "No Expiry Info";
      }
    });

    // 5️⃣ Apply Filters
    let filteredData = finalData;

    // Search filter (product_name)
    if (search) {
      filteredData = filteredData.filter((p) => {
        const s = search.toLowerCase();
        return (
          p.product_name.toLowerCase().includes(s) ||
          p.product_category.toLowerCase().includes(s)
        );
      });
    }

    // Category filter
    if (category) {
      filteredData = filteredData.filter(
        (p) => p.product_category.toLowerCase() === category.toLowerCase()
      );
    }

    // Expiry status filter
    if (expiry_status) {
      filteredData = filteredData.filter(
        (p) => p.expiry_status.toLowerCase() === expiry_status.toLowerCase()
      );
    }

    // 6️⃣ Pagination
    const totalProducts = filteredData.length;

    const paginatedProducts = filteredData.slice(
      startIndex,
      startIndex + limit
    );

    res.status(200).json({
      success: true,
     page,
    itemsPerPage: limit,
    totalItems: totalProducts,
    totalPages: Math.ceil(totalProducts / limit),
    data: paginatedProducts,
    });
  } catch (error) {
    console.error("getProducts error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.UpdateProducts = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      product_name,
      product_category,
      product_description,
      product_type,
      stock_qty,
      mfg_date,
      exp_date,
      // quantity_type,
      // quantity_value,
      // actual_price,
      // discounted_price,
    } = req.body;

    const product = await getProductbyId(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found!" });
    }

    let imageUrl = product.product_img;

    if (req.file) {
      const filePath = path.resolve(req.file.path);
      const base64Img = fs.readFileSync(filePath, { encoding: "base64" });
      imageUrl = await imgbbService.uploadToImgBB(
        base64Img,
        req.file.originalname
      );
      fs.unlinkSync(filePath);
    }

    // if (product_type === "liquid" && !["liter", "ml"].includes(quantity_type)) {
    //   return res.status(400).json({ message: "Liquid can only be liter or ml" });
    // }
    // if (product_type === "solid" && !["kg", "gm"].includes(quantity_type)) {
    //   return res.status(400).json({ message: "Solid can only be kg or gm" });
    // }

    const updatedProductData = {
      product_name: product_name || product.product_name,
      product_category: product_category || product.product_category,
      product_description: product_description || product.product_description,
      product_type: product_type || product.product_type,
      stock_qty: stock_qty || product.stock_qty,
      mfg_date: mfg_date || product.mfg_date,
      exp_date: exp_date || product.exp_date,
      // quantity_type: quantity_type || product.quantity_type,
      // quantity_value: quantity_value || product.quantity_value,
      // actual_price: actual_price || product.actual_price,
      // discounted_price: discounted_price || product.discounted_price,
      product_img: imageUrl,
    };
    console.log("id =>", id, typeof id);
    console.log("updatedProductData =>", updatedProductData);
    console.log("UPDATED DATA => ", updatedProductData);

    await updateProduct(id, updatedProductData);

    return res.status(200).json({
      success: true,
      message: "Product Updated Successfully.",
      data: updatedProductData,
    });
  } catch (error) {
    console.log(error, "error");
    res.status(500).json({ message: "Something went wrong!" });
  }
};

exports.removeProducts = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id)
      return res.status(400).json({ message: "Product id is required!" });

    const result = await deleteProduct(id);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Product ID not found." });
    }

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully.",
      deletedID: id,
    });
  } catch (error) {
    console.log(error, "error");
    res.status(500).json({ message: "Something went wrong." });
  }
};

exports.getProductByID = async (req, res) => {
  try {
    const { product_id } = req.params;

    const product = await getProductbyId(product_id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const variants = await getVariantsByProduct(product_id);

    return res.json({
      success: true,
      product,
      variants,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    const products = await getProductsByCategoryModel(category);

    return res.status(200).json({
      success: true,
      total: products.length,
      data: products,
    });
  } catch (error) {
    console.log("Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
