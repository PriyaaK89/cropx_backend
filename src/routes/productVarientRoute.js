const express = require("express");
const router = express.Router();
const { addVariant } = require("../controllers/productVariantController");
const { UpdateProductVariant } = require("../controllers/productVariantController");
const { addMultipack,  updateMultipack, deleteMultipack, } = require("../controllers/multipackController");

router.post("/add-variant", addVariant);
router.put("/update/:variant_id", UpdateProductVariant);
router.post("/add-multipack", addMultipack);
router.put("/update-multipack/:id", updateMultipack);
router.delete("/delete-multipack/:id", deleteMultipack);

module.exports = router;
