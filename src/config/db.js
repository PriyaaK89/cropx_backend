const mysql = require("mysql2/promise");
const dotenv = require("dotenv");
dotenv.config();

const db = mysql.createPool({
  host: process.env.DB_HOST || "mysql",         
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "sqlroot1238",
  database: process.env.DB_NAME || "cropx_db",
  port: process.env.DB_PORT || 3306,   
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = db;
