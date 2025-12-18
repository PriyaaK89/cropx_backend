// controllers/menuController.js
const { getMenuData } = require("../models/menuModel");

exports.getMenu = async (req, res) => {
  try {
    const rows = await getMenuData();

    const menu = {};

    rows.forEach(({ product_category, sub_category, child_category }) => {
      // Level 1: product_category
      if (!menu[product_category]) {
        menu[product_category] = {};
      }

      // Level 2: sub_category
      if (!menu[product_category][sub_category]) {
        menu[product_category][sub_category] = [];
      }

      // Level 3: child_category
      if (
        !menu[product_category][sub_category].includes(child_category)
      ) {
        menu[product_category][sub_category].push(child_category);
      }
    });

    return res.status(200).json({
      success: true,
      data: menu,
    });
  } catch (error) {
    console.error("Menu API Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch menu data",
    });
  }
};
