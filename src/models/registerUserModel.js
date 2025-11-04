const db = require("../config/db");

const createUser = async (name, email, password, distributor_status) => {
  try {
    const [result] = await db.query(
      "INSERT INTO users (name, email, password, distributor_status) VALUES (?, ?, ?, ?)",
      [name, email, password, distributor_status]
    );
    return result.insertId;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

const findUserByEmail = async (email) => {
  try {
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    return rows; 
  } catch (error) {
    console.error("Error finding user:", error);
    throw error;
  }
};

module.exports = { createUser, findUserByEmail };
