const express = require("express");
const router = express.Router();
const { submitDistributorDetails } = require("../controllers/IsDistributorController");

router.post("/distributorRequest", submitDistributorDetails);

module.exports = router;
