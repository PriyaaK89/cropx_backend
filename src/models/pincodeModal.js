const db = require("../config/db");

exports.searchPincode = async (pincode) => {
  const [rows] = await db.query(
    "SELECT * FROM pincodes WHERE pincode = ?",
    [pincode]
  );
  return rows;
};

exports.searchByDistrict = async (district) => {
  const [rows] = await db.query(
    "SELECT * FROM pincodes WHERE district LIKE ? LIMIT 100",
    [`%${district}%`]
  );
  return rows;
};
