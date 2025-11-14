const db = require("../config/db");

exports.createProductDetails = async(data)=>{
  const sql = `
    INSERT INTO product_details
    (product_id, images, product_overview, key_features_and_benefits, expert_advice, additional_information)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  const [result] = await db.query(sql, [
    data.product_id,
    JSON.stringify(data.images),
    JSON.stringify(data.product_overview),
    JSON.stringify(data.key_features_and_benefits),
    JSON.stringify(data.expert_advice),
    JSON.stringify(data.additional_information)
  ]);

  return result;
};

exports.updateProductDetails = async(product_id, data)=>{
  let setParts = [];
  let values = [];

  for(let key in data){

    let value = data[key];

    // if value is array or object -> stringify
    if(typeof value === "object"){
      value = JSON.stringify(value);
    }

    setParts.push(`${key}=?`);
    values.push(value);
  }

  const sql = `UPDATE product_details SET ${setParts.join(", ")} WHERE product_id=?`;
  values.push(product_id);

  const [result] = await db.query(sql, values);
  return result;
}


exports.getDetailsByProductId = async(product_id) => {
  const sql = `SELECT * FROM product_details WHERE product_id = ? LIMIT 1`;
  const [rows] = await db.query(sql, [product_id]);
  return rows.length > 0 ? rows[0] : null;
};