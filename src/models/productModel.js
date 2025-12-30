const db = require("../config/db");

exports.createProduct = async (data) => {
  const sql = `INSERT INTO products 
  (product_name, category_id, product_description,brand,sub_category_id,child_category_id, product_type, product_img, mfg_date, exp_date) 
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  const [result] = await db.query(sql, [
    data.product_name,
    data.category_id,
    data.product_description,
    data.brand,
    data.sub_category_id,
    data.child_category_id,
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

// exports.getProductbyId = async (id) => {
//   try {
//     const [rows] = await db.query(`
//       SELECT 
//         p.*,
//         c.cate_name AS category_name,
//         sc.name AS sub_category,
//         cc.name AS child_category
//       FROM products p
//       LEFT JOIN categories c ON p.category_id = c.id
//       LEFT JOIN sub_categories sc ON p.sub_category_id = sc.id
//       LEFT JOIN child_categories cc ON p.child_category_id = cc.id
//       WHERE p.id = ?
//     `, [id]);

//     return rows[0];  
//   } catch (error) {
//     console.error("Error in getProductById:", error);
//     throw error;
//   }
// };

exports.getProductbyId = async (id) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        p.id,
        p.product_name,
        p.product_description,
        p.product_type,
        p.product_img,
        p.brand,

        c.id AS category_id,
        c.cate_name AS category_name,

        sc.id AS sub_category_id,
        sc.name AS sub_category_name,

        cc.id AS child_category_id,
        cc.name AS child_category_name,

        -- rating aggregation
        COALESCE(AVG(r.rating), 0) AS avg_rating,
        COUNT(r.id) AS rating_count

      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN sub_categories sc ON p.sub_category_id = sc.id
      LEFT JOIN child_categories cc ON p.child_category_id = cc.id
      LEFT JOIN product_ratings r ON r.product_id = p.id

      WHERE p.id = ?
      GROUP BY p.id
    `, [id]);

    return rows[0];
  } catch (error) {
    console.error("Error in getProductById:", error);
    throw error;
  }
};



exports.getProductsWithVariants = async () => {
  // Fetch all variants (single packs)
  const [variants] = await db.query(`
    SELECT
      p.id AS product_id,
      p.product_name,
      p.category_id,
      c.cate_name AS category_name,     
      p.product_description,
      p.brand,

      sc.name AS sub_category,
      cc.name AS child_category,

      p.sub_category_id,
      p.child_category_id,
      p.product_type,
      p.product_img,
      p.mfg_date,
      p.exp_date,
       p.rating,
        p.rating_count,
        p.total_sold,
 

      v.id AS variant_id,
      v.quantity_type,
      v.quantity_value,
      v.actual_price,
      v.discount_percent,
      v.discounted_price,
      v.stock_qty
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id   
    LEFT JOIN sub_categories sc ON p.sub_category_id = sc.id
    LEFT JOIN child_categories cc ON p.child_category_id = cc.id
    LEFT JOIN product_variants v ON p.id = v.product_id
  `);

  // Fetch all multipacks
  const [multipacks] = await db.query(`
    SELECT
      p.id AS product_id,
      v.id AS variant_id,
      m.id AS multipack_id,
      v.quantity_value AS base_quantity_value,
      v.quantity_type AS base_quantity_type,
      v.stock_qty,
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


exports.deleteProduct = async (id) => {
  const [result] = await db.query("DELETE FROM products WHERE id =?", [id]);
  return result;
};

exports.updateProduct = async (id, data) => {
  const sql = `
    UPDATE products 
    SET product_name=?, category_id=?, product_description=?, brand = ?, sub_category_id = ?, child_category_id = ?, product_type=?, product_img=?, mfg_date = ?, exp_date = ?
    WHERE id=?
  `;
  const params = [
    data.product_name,
    data.category_id,
    data.product_description,
    data.brand,
    data.sub_category_id,
    data.child_category_id,   
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




