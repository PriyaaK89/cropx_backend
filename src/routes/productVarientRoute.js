const express = require("express");
const router = express.Router();
const { addVariant } = require("../controllers/productVariantController");
const { UpdateProductVariant, deleteVariant  } = require("../controllers/productVariantController");
const { addMultipack,  updateMultipack, deleteMultipack, } = require("../controllers/multipackController");

router.post("/add-variant", addVariant);
router.put("/update/:variant_id", UpdateProductVariant);
router.post("/add-multipack", addMultipack);
router.put("/update-multipack/:id", updateMultipack);
router.delete("/delete-multipack/:id", deleteMultipack);
router.delete("/variant/:variant_id", deleteVariant);

module.exports = router;
