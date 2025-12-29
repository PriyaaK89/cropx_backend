const {
  getProductsBySlugModel,
  getProductsWithVariantsByProductIds,
} = require("../models/productSlugModel");

exports.getProductsBySlug = async (req, res) => {
  try {
    const { level, slug } = req.params;

    const {
      page = 1,
      limit = 12,
      sort,
      minPrice,
      maxPrice,
      rating,
      stock,
    } = req.query;

    /* =========================
       FETCH BASE PRODUCTS (SORTED & FILTERED)
    ========================== */

    const result = await getProductsBySlugModel({
      level,
      slug,
      page: Number(page),
      limit: Number(limit),
      sort,
      minPrice,
      maxPrice,
      rating,
      stock,
    });

    const baseProducts = result?.rows || [];
    const totalItems = result?.totalItems || 0;

    if (!baseProducts.length) {
      return res.status(200).json({
        success: true,
        page: Number(page),
        limit: Number(limit),
        totalItems,
        data: [],
      });
    }

    /* =========================
       FETCH VARIANTS FOR ONLY THESE PRODUCTS
    ========================== */

    const productIds = baseProducts.map((p) => p.id);

    const { variants, multipacks } =
      await getProductsWithVariantsByProductIds(productIds);

    /* =========================
       CREATE PRODUCT MAP
    ========================== */

    const productsMap = {};

    /* =========================
       SINGLE PACKS
    ========================== */

    variants.forEach((v) => {
      if (!productsMap[v.product_id]) {
        const base = baseProducts.find(
          (p) => p.id === v.product_id
        );

        productsMap[v.product_id] = {
          id: v.product_id,
          product_name: v.product_name,
          product_description: v.product_description,
          brand: v.brand,
          product_type: v.product_type,
          product_img: v.product_img,
          rating: Number(base?.rating || 0),
          rating_count: Number(base?.rating_count || 0),
          total_sold: Number(base?.total_sold || 0),
          starting_price: Number(base?.starting_price || 0),
          total_stock: Number(base?.total_stock || 0),
          mfg_date: v.mfg_date,
          exp_date: v.exp_date,
          expiry_status: "",
          single_packs: [],
          multi_packs: [],
        };
      }

      productsMap[v.product_id].single_packs.push({
        variant_id: v.variant_id,
        quantity_value: v.quantity_value,
        quantity_type: v.quantity_type,
        actual_price: Number(v.actual_price),
        discount_percent: Number(v.discount_percent),
        discounted_price: Number(v.discounted_price),
        stock_qty: Number(v.stock_qty),
      });
    });

    /* =========================
       MULTI PACKS
    ========================== */

    multipacks.forEach((mp) => {
      if (productsMap[mp.product_id]) {
        productsMap[mp.product_id].multi_packs.push({
          multipack_id: mp.multipack_id,
          variant_id: mp.variant_id,
          pack_quantity: mp.pack_quantity,
          total_quantity_value: mp.total_quantity_value,
          actual_price: Number(mp.actual_price),
          discounted_price: Number(mp.discounted_price),
        });
      }
    });

    /* =========================
       EXPIRY STATUS
    ========================== */

    const currentDate = new Date();

    Object.values(productsMap).forEach((product) => {
      if (!product.exp_date) {
        product.expiry_status = "No Expiry Info";
        return;
      }

      const expDate = new Date(product.exp_date);
      const diffMonths =
        (expDate.getFullYear() - currentDate.getFullYear()) * 12 +
        (expDate.getMonth() - currentDate.getMonth());

      if (expDate < currentDate) product.expiry_status = "Expired";
      else if (diffMonths <= 3) product.expiry_status = "near_expiry";
      else if (diffMonths > 8) product.expiry_status = "up_to_date";
      else product.expiry_status = "Moderate";
    });

    /* =========================
        PRESERVE SQL SORT ORDER
    ========================== */

    const orderedProducts = baseProducts.map(
      (p) => productsMap[p.id]
    );

    return res.status(200).json({
      success: true,
      page: Number(page),
      limit: Number(limit),
      totalItems,
      data: orderedProducts,
    });
  } catch (error) {
    console.error("getProductsBySlug Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch products",
    });
  }
};
