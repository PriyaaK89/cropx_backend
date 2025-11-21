const express = require("express");
const { signup, getUsers  } = require("../controllers/authController");

const router = express.Router();

// Signup route
router.post("/signup", signup);
router.get("/get-users", getUsers);

module.exports = router;
