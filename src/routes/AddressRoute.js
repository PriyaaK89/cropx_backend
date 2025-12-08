const express = require("express");
const router = express.Router();
const addressController = require("../controllers/addressController");

router.post("/saveDeliveryAddress", addressController.saveAddress);
router.get("/getAddress/:userId", addressController.getAddressByuser);
router.put("/updateAddress/:id", addressController.UpdateUserAddress);
router.delete("/deleteAddress/:id", addressController.deleteAddress)

module.exports = router;