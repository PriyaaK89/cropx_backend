const express = require("express");
const router = express.Router();
const { loginUser } = require("../controllers/loginController");
const { login } = require("../controllers/adminLoginController");

router.post("/login", loginUser);
router.post("/admin/signin", login)

module.exports = router;
