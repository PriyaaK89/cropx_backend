const express = require("express");
const router = express.Router();
const {addToCart, getCartItems, removeSingleItem, removeWholeItem} = require("../controllers/cartController");

router.post("/add-item", addToCart);
router.get("/:user_id", getCartItems);
router.post("/remove-item",removeSingleItem);
router.post("/remove-all-items", removeWholeItem);


module.exports = router;
