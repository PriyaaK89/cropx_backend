const mysql = require("mysql2/promise");
// const dotenv = require("dotenv");
// dotenv.config();
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const db = mysql.createPool({
  host: process.env.MYSQL_HOST,      // Railway MySQL host
  user: process.env.MYSQL_USER,      // Railway MySQL user
  password: process.env.MYSQL_PASSWORD, // Railway MySQL password
  database: process.env.MYSQL_DATABASE, // Railway MySQL database name
  port: process.env.MYSQL_PORT,      // Railway MySQL port (usually 3306)
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = db;

// const db = mysql.createPool({
//   host: process.env.DB_HOST,         
//   user: process.env.DB_USER ,
//   password: process.env.DB_PASS,
//   database: process.env.DB_NAME,
//   port: Number(process.env.DB_PORT || 3306),   
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0,
// });

// module.exports = db;
