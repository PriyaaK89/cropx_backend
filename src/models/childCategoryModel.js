const db = require("../config/db");

exports.createChildCategory = async(sub_category_id, name)=>{
    const sql = `INSERT INTO child_categories (sub_category_id, name) VALUES (?, ?)`;
    const result = await db.query(sql, [sub_category_id, name]);
    return result;
}

exports.getChildCategory = async(sub_category_id)=>{
     const [rows] = await db.query(`SELECT * FROM child_categories WHERE sub_category_id = ?`,[sub_category_id]);
     return rows;
}