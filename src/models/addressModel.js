const db = require("../config/db");

exports.userAddress = async(data)=>{
     const sql = `INSERT INTO delivery_address 
(user_id, name,country_code, phone_number, flat_no, street_name, pincode, city, district, state, landmark, country)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  const [result] = await db.query(sql, [
    data.userId,
    data.name,
    data.country_code,
    data.phone_number,
    data.flat_no,
    data.street_name,
    data.pincode,
    data.city,
    data.district,
    data.state,
    data.landmark,
    data.country
  ]);
    return result;
}

exports.getAddressByUser = async(userId)=>{
     const [result] = await db.query(
        "SELECT * FROM delivery_address WHERE user_id = ?",
        [userId]
     );
     return result;
}

exports.updateAddress = async(id, data)=>{
     const sql = `UPDATE delivery_address SET 
     name = ?, country_code= ?, phone_number = ?, flat_no = ?, street_name = ?, pincode = ?, city = ?, district = ?, state = ?, landmark = ?, country = ?
     WHERE id =? `;

     const [result] = await db.query(sql , [
        data.name,
        data.country_code,
        data.phone_number,
        data.flat_no,
        data.street_name,
        data.pincode,
        data.city,
        data.district,
        data.state,
        data.landmark,
        data.country,
        id
     ]);
     // return result;
     if(result.affectedRows === 0){
          return {success: false}
     }
     return {success: true}
}

exports.deleteAddress = async (id) => {
    const [result] = await db.query(
        "DELETE FROM delivery_address WHERE id = ?", 
        [id]
    );

  
    if (result.affectedRows === 0) {
        return { success: false };
    }

    return { success: true };
};

exports.getLatestAddressForOrder = async(user_id)=>{
    const [result] = await db.query(
     `SELECT * FROM delivery_address WHERE user_id = ?
     ORDER BY id DESC
     LIMIT 1`,
     [user_id]
    );
    return result[0];
}