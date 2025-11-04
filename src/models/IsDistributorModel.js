const db = require("../config/db");

const createDistributorRequest = async (userId, gst_number, seed_license, fertilizer_license, pesticide_license) => {
  const query = `
    INSERT INTO distributor_requests (
      user_id, gst_number, seed_license, fertilizer_license, pesticide_license, status
    )
    VALUES (?, ?, ?, ?, ?, 'pending')
  `;

  const values = [userId, gst_number, seed_license, fertilizer_license, pesticide_license];
  const [result] = await db.query(query, values);
  return result.insertId;
};

module.exports = { createDistributorRequest };
