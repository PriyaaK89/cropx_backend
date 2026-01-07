const db = require("../config/db");

exports.createProductDetails = async ({ product_id, images, product_overview, key_features_and_benefits, expert_advice, additional_information }) => {
  try {
    const sql = `
      INSERT INTO product_details 
      (product_id, images, product_overview, key_features_and_benefits, expert_advice, additional_information)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const params = [
      product_id,
      JSON.stringify(images),
      JSON.stringify(product_overview),
      JSON.stringify(key_features_and_benefits),
      JSON.stringify(expert_advice),
      JSON.stringify(additional_information)
    ];

    const [result] = await db.query(sql, params);
    return result;

  } catch (err) {
    console.log("DB Error:", err);
    throw err;
  }
};

exports.updateProductDetails = async (product_id, updateData) => {
  const fields = Object.keys(updateData)
    .map((key) => `${key} = ?`)
    .join(", ");

  const values = Object.values(updateData);

  const sql = `UPDATE product_details SET ${fields} WHERE product_id = ?`;
  const [result] = await db.query(sql, [...values, product_id]);

  return result;
};



exports.getDetailsByProductId = async(product_id) => {
  const sql = `SELECT * FROM product_details WHERE product_id = ? LIMIT 1`;
  const [rows] = await db.query(sql, [product_id]);
  return rows.length > 0 ? rows[0] : null;
};