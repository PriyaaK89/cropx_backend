const db = require("../config/db");

exports.createProduct = async (data) => {
  const sql = `INSERT INTO products 
  (product_name, product_category, product_description,brand,sub_category,child_category, product_type, product_img, mfg_date, exp_date) 
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  const [result] = await db.query(sql, [
    data.product_name,
    data.product_category,
    data.product_description,
    data.brand,
    data.sub_category,
    data.child_category,
    data.product_type,
    data.product_img,
    // data.stock_qty,
    data.mfg_date,
    data.exp_date,
  ]);

  return result;
};

exports.getAllProducts = async () => {
  const [rows] = await db.query("SELECT * FROM products");
  return rows;
};


exports.getProductbyId = async (id) => {
  try {
    const [rows] = await db.query("SELECT * FROM products WHERE id = ?", [id]);
    return rows[0];  
  } catch (error) {
    console.error("Error in getProductById:", error);
    throw error;
  }
};

exports.getProductsWithVariants = async () => {
  //  Fetch all variants (single packs)
  const [variants] = await db.query(`
    SELECT
      p.id as product_id,
      p.product_name,
      p.product_category,
      p.product_description,
      p.brand,
      p.sub_category,
      p.child_category,
      p.product_type,
      p.product_img,
                 
      p.mfg_date,            
      p.exp_date,
      v.id as variant_id,
      v.quantity_type,
      v.quantity_value,
      v.actual_price,
      v.discount_percent,
      v.discounted_price,
      v.stock_qty AS stock_qty
    FROM products p
    LEFT JOIN product_variants v ON p.id = v.product_id
  `);

  //  Fetch all multipacks (linked to variants)
  const [multipacks] = await db.query(`
    SELECT
      p.id as product_id,
      v.id as variant_id,
      m.id as multipack_id,
      v.quantity_value AS base_quantity_value,
      v.quantity_type AS base_quantity_type,
       v.stock_qty AS stock_qty,  
      m.pack_quantity,
      (v.quantity_value * m.pack_quantity) AS total_quantity_value,
      m.actual_price,
      m.discounted_price
    FROM products p
    LEFT JOIN product_variants v ON p.id = v.product_id
    LEFT JOIN product_multipacks m ON v.id = m.variant_id
    WHERE m.id IS NOT NULL
  `);

  return { variants, multipacks };
};

// exports.getVariantsByProduct = async (product_id) => {
//   const [rows] = await db.query(`
//     SELECT
//       v.id as variant_id,
//       v.quantity_type,
//       v.quantity_value,
//       v.actual_price,
//       v.discount_percent,
//       v.discounted_price,

//       m.id AS multipack_id,
//       m.pack_quantity,
//       (v.quantity_value * m.pack_quantity) AS total_quantity_value,
//       CONCAT(
//         (v.quantity_value * m.pack_quantity), ' ', v.quantity_type,
//         ' (pack of ', v.quantity_value, ' ', v.quantity_type, ' × ', m.pack_quantity, ')'
//       ) AS display_name,
//       m.actual_price,
//       m.discounted_price
//     FROM product_variants v
//     LEFT JOIN product_multipacks m ON v.id = m.variant_id
//     WHERE v.product_id = ?
//   `, [product_id]);

//   return rows;
// };

exports.deleteProduct = async (id) => {
  const [result] = await db.query("DELETE FROM products WHERE id =?", [id]);
  return result;
};

exports.updateProduct = async (id, data) => {
  const sql = `
    UPDATE products 
    SET product_name=?, product_category=?, product_description=?, brand = ?, sub_category = ?, child_category = ?, product_type=?, product_img=?, mfg_date = ?, exp_date = ?
    WHERE id=?
  `;
  const params = [
    data.product_name,
    data.product_category,
    data.product_description,
    data.brand,
    data.sub_category,
    data.child_category,   
    data.product_type,
    // data.quantity_type,
    // data.quantity_value,
    data.product_img,
    // data.stock_qty,
    data.mfg_date,
    data.exp_date,
    // data.actual_price,
    // data.discounted_price,
    id,
  ];

  const [result] = await db.query(sql, params);
  return result;
};

exports.getProductsByCategoryModel = async (category, brand = null) => {
  let query = `SELECT * FROM products WHERE product_category = ?`;
  const params = [category];

  if (brand) {
    query += ` AND brand = ?`;
    params.push(brand);
  }

  const [rows] = await db.query(query, params);
  return rows;
};


