const db = require("../config/db");

exports.createProduct = async (data)=>{
  const sql = `INSERT INTO products 
  (product_name, product_category, product_description, product_type, quantity_type, quantity_value, product_img) 
  VALUES (?, ?, ?, ?, ?, ?, ?)`;

  const [result] = await db.query(sql, [
    data.product_name,
    data.product_category,
    data.product_description,
    data.product_type,
    data.quantity_type,
    data.quantity_value,
    data.product_img
  ]);

  return result;
};

exports.getAllProducts = async ()=>{
  const [rows] = await db.query("SELECT * FROM products");
  return rows;
};
