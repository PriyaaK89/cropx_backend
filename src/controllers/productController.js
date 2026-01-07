const fs = require("fs");
const { createProduct, deleteProduct, getProductbyId, updateProduct, getProductsWithVariants, } = require("../models/productModel");
const { getVariantsByProduct } = require("../models/productVarientModel");

exports.addProduct = async (req, res) => {
  try {
    const { product_name, category_id, product_description, brand, sub_category_id, child_category_id, product_type, mfg_date, exp_date, } = req.body;

    if (!product_name || !category_id || !product_type || !brand ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (!req.file)
      return res.status(400).json({ message: "product image required" });
  console.log("S3 FILE:", req.file);
    const imageUrl = req.file.location; 

    const product = {
      product_name,
      category_id,
      product_description,
      sub_category_id, child_category_id,
      brand,
      product_type,
      product_img: imageUrl,
      // stock_qty,
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
      brand = "",
      sub_category = "",
      child_category = "",
    } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);
    const startIndex = (page - 1) * limit;

    // Fetch all products with variants + multipacks
    const { variants, multipacks } = await getProductsWithVariants();

    // Format products
    const finalData = variants.reduce((acc, variant) => {
      let product = acc.find((p) => p.id === variant.product_id);
      if (!product) {
        product = {
          id: variant.product_id,
          product_name: variant.product_name,
          category_id: variant.category_id,
          category_name: variant.category_name,
          product_description: variant.product_description,
          brand: variant.brand,
          sub_category: variant.sub_category,
          child_category: variant.child_category,
          product_type: variant.product_type,
          product_img: variant.product_img,
          // stock_qty: variant.stock_qty,
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
        stock_qty: variant.stock_qty,
      });

      return acc;
    }, []);

    //  Add multipacks
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
          actual_price: mp.actual_price,
          discounted_price: mp.discounted_price,
        });
      }
    });

    //  Add expiry status
    const currentDate = new Date();

    finalData.forEach((product) => {
      if (product.exp_date) {
        const expDate = new Date(product.exp_date);
        const diffMonths =
          (expDate.getFullYear() - currentDate.getFullYear()) * 12 +
          (expDate.getMonth() - currentDate.getMonth());

        if (diffMonths > 8) {
          product.expiry_status = "up_to_date";
        } else if (diffMonths > 0 && diffMonths <= 3) {
          product.expiry_status = "near_expiry";
        } else if (expDate < currentDate) {
          product.expiry_status = "Expired";
        } else {
          product.expiry_status = "Moderate";
        }
      } else {
        product.expiry_status = "No Expiry Info";
      }
    });

    let filteredData = finalData;

    if (search) {
      filteredData = filteredData.filter((p) => {
        const s = search.toLowerCase();
        return (
          p.product_name.toLowerCase().includes(s) ||
          p.category_name.toLowerCase().includes(s)
        );
      });
    }

    if (category) {
      filteredData = filteredData.filter(
        (p) => p.category_id.toLowerCase() === category.toLowerCase()
      );
    }
    if (brand) {
      filteredData = filteredData.filter(
        (p) => p.brand?.toLowerCase() === brand.toLowerCase()
      );
    }
    // Expiry status filter
    if (expiry_status) {
      filteredData = filteredData.filter(
        (p) => p.expiry_status.toLowerCase() === expiry_status.toLowerCase()
      );
    }

    //  Pagination
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
      category_id,
      product_description,
      brand, sub_category, child_category,
      product_type,
      mfg_date,
      exp_date,
    } = req.body;

    const product = await getProductbyId(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found!" });
    }

    let imageUrl = product.product_img;

   if (req.file) {
      imageUrl = req.file.location; 
    }

    const updatedProductData = {
      product_name: product_name || product.product_name,
      category_id: category_id || product.category_id,
      product_description: product_description || product.product_description,
      brand: brand || product.brand,
      sub_category: sub_category || product.sub_category,
      child_category: child_category || product.child_category,
      product_type: product_type || product.product_type,
      mfg_date: mfg_date || product.mfg_date,
      exp_date: exp_date || product.exp_date,
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
    const { type, value } = req.params; // category | sub-category | child-category
    const { brand } = req.query;

    const { variants, multipacks } = await getProductsWithVariants();

    // Build product structure
    const finalData = variants.reduce((acc, variant) => {
      let product = acc.find((p) => p.id === variant.product_id);

      if (!product) {
        product = {
          id: variant.product_id,
          product_name: variant.product_name,
          category_id: variant.category_id,
          sub_category_id: variant.sub_category_id,
          sub_category: variant.sub_category,
          child_category_id: variant.child_category_id,
          child_category: variant.child_category,
          product_description: variant.product_description,
          brand: variant.brand,
          product_type: variant.product_type,
          product_img: variant.product_img,
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
        stock_qty: variant.stock_qty,
      });

      return acc;
    }, []);

    // Add multipacks
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
          actual_price: mp.actual_price,
          discounted_price: mp.discounted_price,
        });
      }
    });

    // Expiry status
    const currentDate = new Date();
    finalData.forEach((product) => {
      if (!product.exp_date) {
        product.expiry_status = "No Expiry Info";
        return;
      }

      const expDate = new Date(product.exp_date);
      const diffMonths =
        (expDate.getFullYear() - currentDate.getFullYear()) * 12 +
        (expDate.getMonth() - currentDate.getMonth());

      if (diffMonths > 8) product.expiry_status = "up_to_date";
      else if (diffMonths <= 3 && diffMonths > 0)
        product.expiry_status = "near_expiry";
      else if (expDate < currentDate) product.expiry_status = "Expired";
      else product.expiry_status = "Moderate";
    });

    //  DYNAMIC FILTER
    const filteredProducts = finalData.filter((p) => {
      let levelMatch = false;

      
      if (type === "category") {
  levelMatch = Number(p.category_id) === Number(value);
}

      if (type === "sub-category") {
        levelMatch =
          // p.sub_category?.toLowerCase() === value.toLowerCase();
          Number(p.sub_category_id) === Number(value)
      }

      if (type === "child-category") {
        levelMatch =
          // p.child_category?.toLowerCase() === value.toLowerCase();
          Number(p.child_category_id) === Number(value)
      }

      const brandMatch = brand
        ? p.brand?.toLowerCase() === brand.toLowerCase()
        : true;

      return levelMatch && brandMatch;
    });

    return res.status(200).json({
      success: true,
      totalItems: filteredProducts.length,
      data: filteredProducts,
    });
  } catch (error) {
    console.error("Get Products By Category Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

