const { getMenuData } = require("../models/menuModel");

exports.getMenu = async (req, res) => {
  try {
    const rows = await getMenuData();
    const menu = {};

    rows.forEach((row) => {
      const {
        category,
        category_slug,
        sub_category,
        sub_category_slug,
        child_category,
        child_category_slug
      } = row;

      // CATEGORY LEVEL
      if (!menu[category_slug]) {
        menu[category_slug] = {
          name: category,
          slug: category_slug,
          sub_categories: []
        };
      }

      // FIND OR CREATE SUB CATEGORY
      let subCat = menu[category_slug].sub_categories.find(
        (sc) => sc.slug === sub_category_slug
      );

      if (!subCat) {
        subCat = {
          name: sub_category,
          slug: sub_category_slug,
          children: []
        };
        menu[category_slug].sub_categories.push(subCat);
      }

      // CHILD CATEGORY
      if (child_category) {
        subCat.children.push({
          name: child_category,
          slug: child_category_slug
        });
      }
    });

    return res.status(200).json({
      success: true,
      data: Object.values(menu)
    });
  } catch (error) {
    console.error("Menu API Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch menu data"
    });
  }
};
