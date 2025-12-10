const db = require("../config/db");

exports.createMultipack = async (data) => {
  const [variantRows] = await db.query(
    `SELECT actual_price FROM product_variants WHERE id = ? LIMIT 1`,
    [data.variant_id]
  );

  if (variantRows.length === 0) throw new Error("Variant not found");

  const variant = variantRows[0];
  const pack_quantity = Number(data.pack_quantity) || 1;
  const discount_percentage = Number(data.discount_percentage) || 0;

  //  Price per unit (can come from user or variant)
  const unit_price = Number(data.unit_price) || Number(variant.actual_price);

  //  Total = unit_price * pack_quantity
  const actual_price = unit_price * pack_quantity;

  const discounted_price =
    actual_price - (actual_price * discount_percentage) / 100;

  const sql = `
    INSERT INTO product_multipacks 
    (product_id, variant_id, unit_price, base_pack, pack_quantity, total_quantity_value, quantity_type, actual_price, discount_percentage, discounted_price)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const [result] = await db.query(sql, [
    data.product_id,
    data.variant_id,
    unit_price,                        
    data.base_pack || "1",
    pack_quantity,
    data.total_quantity_value || pack_quantity,
    data.quantity_type || "unit",
    actual_price,
    discount_percentage,
    discounted_price,
  ]);

  return {
    success: true,
    message: "Multipack added successfully",
    multipack_id: result.insertId,
    data: {
      product_id: data.product_id,
      variant_id: data.variant_id,
      pack_quantity,
      base_pack: data.base_pack || "1",
      total_quantity_value: data.total_quantity_value || pack_quantity,
      quantity_type: data.quantity_type || "unit",
      unit_price,                   
      actual_price,
      discount_percentage,
      discounted_price,
    },
  };
};


// exports.getMultipacksByVariant = async (variant_id) => {
//   const sql = `
//     SELECT 
//       id AS multipack_id,
//       pack_quantity,
//       unit_price,
//       total_quantity_value,
//       quantity_type,
//       actual_price,
//       discount_percentage,
//       (actual_price - (actual_price * discount_percentage / 100)) AS discounted_price,
//     FROM product_multipacks
//     WHERE variant_id = ?
//   `;
//   const [rows] = await db.query(sql, [variant_id]);
//   return rows;
// };

exports.getMultipacksByVariant = async (variant_id) => {
  const sql = `
    SELECT 
      m.id AS multipack_id,
      m.pack_quantity,
      m.unit_price,
      m.total_quantity_value,
      m.quantity_type,
      m.actual_price,
      m.discount_percentage,
      (m.actual_price - (m.actual_price * m.discount_percentage / 100)) AS discounted_price,
      v.stock_qty AS stock_qty        
    FROM product_multipacks m
    JOIN product_variants v ON m.variant_id = v.id
    WHERE m.variant_id = ?
  `;

  const [rows] = await db.query(sql, [variant_id]);
  return rows;
};

exports.updateMultipack = async (id, data) => {
  const pack_quantity = Number(data.pack_quantity) || 1;
  const unit_price = Number(data.unit_price) || 0; // fixed: use unit_price, not actual_price
  const discount_percentage = Number(data.discount_percentage) || 0;

  //  Recalculate total price based on unit price and quantity
  const actual_price = unit_price * pack_quantity;
  const discounted_price =
    actual_price - (actual_price * discount_percentage) / 100;

  const sql = `
    UPDATE product_multipacks 
    SET 
      unit_price = ?,               --  new field
      base_pack = ?, 
      pack_quantity = ?, 
      total_quantity_value = ?, 
      quantity_type = ?, 
      actual_price = ?, 
      discount_percentage = ?, 
      discounted_price = ?
    WHERE id = ?
  `;

  const [result] = await db.query(sql, [
    unit_price,                              //  added
    data.base_pack || "1",
    pack_quantity,
    data.total_quantity_value || pack_quantity,
    data.quantity_type || "unit",
    actual_price,
    discount_percentage,
    discounted_price,
    id,
  ]);

  return {
    success: true,
    message: "Multipack updated successfully",
    updated_id: id,
    data: {
      unit_price,
      pack_quantity,
      actual_price,
      discount_percentage,
      discounted_price,
    },
  };
};


exports.deleteMultipack = async (id) => {
  const sql = `DELETE FROM product_multipacks WHERE id = ?`;
  const [result] = await db.query(sql, [id]);
  return result;
};

