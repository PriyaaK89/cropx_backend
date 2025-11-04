const mysql = require("mysql2/promise");
const dotenv = require("dotenv");
dotenv.config();

const db = mysql.createPool({
  host: process.env.DB_Host || "localhost",
  user: process.env.DB_User || "root",
  password: process.env.DB_Password || "sqlroot1238",
  database: process.env.DB_Database || "cropx_db",
});

module.exports = db;
