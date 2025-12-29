const { getProductsWithVariants } = require("../models/productModel");

const formatProducts = async ({ productIds = null }) => {
  const { variants, multipacks } = await getProductsWithVariants();

  //  NORMALIZE IDS (CRITICAL FIX)
  const normalizedIds = productIds
    ? productIds.map(id => Number(id))
    : null;

  //  Correct filtering
  const filteredVariants = normalizedIds
    ? variants.filter(v =>
        normalizedIds.includes(Number(v.product_id))
      )
    : variants;

  //  Build product structure
  const products = filteredVariants.reduce((acc, v) => {
    let product = acc.find(p => p.id === Number(v.product_id));

    if (!product) {
      product = {
        id: Number(v.product_id),
        product_name: v.product_name,
        category_id: v.category_id,
        category_name: v.category_name,
        product_description: v.product_description,
        brand: v.brand,
        sub_category: v.sub_category,
        child_category: v.child_category,
        product_type: v.product_type,
        product_img: v.product_img,
        mfg_date: v.mfg_date,
        exp_date: v.exp_date,
        rating: Number(v?.rating || 0),
        rating_count: Number(v?.rating_count || 0),
        total_sold: Number(v?.total_sold || 0),
        expiry_status: "No Expiry Info",
        single_packs: [],
        multi_packs: [],
      };
      acc.push(product);
    }

    if (v.variant_id) {
      product.single_packs.push({
        variant_id: v.variant_id,
        quantity_value: v.quantity_value,
        quantity_type: v.quantity_type,
        actual_price: v.actual_price,
        discount_percent: v.discount_percent,
        discounted_price: v.discounted_price,
        stock_qty: v.stock_qty,
      });
    }

    return acc;
  }, []);

  //  Add multipacks
  multipacks.forEach(mp => {
    const product = products.find(
      p => p.id === Number(mp.product_id)
    );

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

  //  Expiry status
  const currentDate = new Date();

  products.forEach(p => {
    if (!p.exp_date) return;

    const expDate = new Date(p.exp_date);
    const diffMonths =
      (expDate.getFullYear() - currentDate.getFullYear()) * 12 +
      (expDate.getMonth() - currentDate.getMonth());

    if (expDate < currentDate) p.expiry_status = "Expired";
    else if (diffMonths <= 3) p.expiry_status = "near_expiry";
    else if (diffMonths <= 8) p.expiry_status = "Moderate";
    else p.expiry_status = "up_to_date";
  });

  return products;
};

module.exports = { formatProducts };
