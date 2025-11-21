const db = require("../config/db");

// Create variant
exports.createVariant = async (data) => {
  // Calculate discounted price
  const discounted_price = data.actual_price - (data.actual_price * data.discount_percent / 100);

  const sql = `
    INSERT INTO product_variants 
    (product_id, product_type, quantity_type, quantity_value, actual_price, discount_percent, discounted_price)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  const [result] = await db.query(sql, [
    data.product_id,
    data.product_type,
    data.quantity_type,
    data.quantity_value,
    data.actual_price,
    data.discount_percent,
    discounted_price
  ]);

  return result;
};

exports.getVariantsByProduct = async (product_id) => {
  //  1. Fetch all single (base) variants
  const [singlePacks] = await db.query(`
    SELECT 
      v.id AS variant_id,
      v.product_id,
      v.quantity_value AS base_quantity_value,
      v.quantity_type AS base_quantity_type,
      v.actual_price AS total_actual_price,
      v.discounted_price AS total_discounted_price,
      v.discount_percent
    FROM product_variants v
    WHERE v.product_id = ?
  `, [product_id]);

  //  2. Fetch all multipacks linked to those variants
  const [multiPacks] = await db.query(`
    SELECT 
      m.id AS multipack_id,
      m.variant_id,
      v.quantity_value AS base_quantity_value,
      v.quantity_type AS base_quantity_type,
      m.pack_quantity,
      m.total_quantity_value,
      m.total_actual_price,
      m.total_discounted_price,
      m.discount_percentage
    FROM product_multipacks m
    JOIN product_variants v ON m.variant_id = v.id
    WHERE v.product_id = ?
  `, [product_id]);

  //  3. Return both separately
  return {
    single_packs: singlePacks,
    multi_packs: multiPacks
  };
};


// Get single variant by ID
exports.getVariantById = async (id) => {
  const [rows] = await db.query("SELECT * FROM product_variants WHERE id = ?", [id]);
  return rows.length > 0 ? rows[0] : null;
};

// Update variant
exports.updateVariant = async (id, data) => {
  // Recalculate discounted price
  const discounted_price =
    data.actual_price - (data.actual_price * data.discount_percent) / 100;

  const sql = `
    UPDATE product_variants 
    SET 
      product_id = ?, 
      product_type = ?, 
      quantity_type = ?, 
      quantity_value = ?, 
      actual_price = ?, 
      discount_percent = ?, 
      discounted_price = ?
    WHERE id = ?
  `;

  const params = [
    data.product_id,
    data.product_type,
    data.quantity_type,
    data.quantity_value,
    data.actual_price,
    data.discount_percent,
    discounted_price,
    id,
  ];

  const [result] = await db.query(sql, params);
  return result;
};

// Delete variant by ID
exports.deleteVariantById = async (variant_id) => {
  const sql = `DELETE FROM product_variants WHERE id = ?`;
  const [result] = await db.query(sql, [variant_id]);
  return result;
};


