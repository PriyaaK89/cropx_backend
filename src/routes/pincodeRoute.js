const express = require("express");
const router = express.Router();
const PincodeController = require("../controllers/pincodeController");

router.get("/getstatecity/:pincode", PincodeController.getByPincode);

router.get("/district", PincodeController.getByDistrict);

module.exports = router;
