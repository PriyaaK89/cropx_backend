// middleware/verifyToken.js
const jwt = require("jsonwebtoken");
require("dotenv").config();

const { findToken } = require("../models/tokenModel");
const SECRET_KEY = process.env.JWT_SECRET || "your_secret_key_here";

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Access denied. No token provided." });
    }

    const token = authHeader.split(" ")[1];

    // Check token exists in DB
    const saved = await findToken(token);
    if (!saved) {
      return res.status(401).json({ message: "Invalid or logged out token." });
    }

    // Verify signature
    try {
      const decoded = jwt.verify(token, SECRET_KEY);
      req.user = decoded; // attach payload
      req.token = token; // attach token if needed
      next();
    } catch (err) {
      return res.status(403).json({ message: "Invalid token signature." });
    }
  } catch (error) {
    console.error("Token Verify Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = verifyToken;
