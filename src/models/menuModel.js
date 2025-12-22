const db = require("../config/db");

exports.getMenuData = async () => {
  const query = `
    SELECT
      c.cate_name AS category,
      c.slug AS category_slug,

      sc.name AS sub_category,
      sc.slug AS sub_category_slug,

      cc.name AS child_category,
      cc.slug AS child_category_slug
    FROM categories c
    JOIN sub_categories sc ON sc.category_id = c.id
    LEFT JOIN child_categories cc ON cc.sub_category_id = sc.id
    WHERE c.show_in_menu = 1
    ORDER BY c.menu_order ASC, sc.menu_order ASC, cc.menu_order ASC
  `;

  const [rows] = await db.query(query);
  return rows;
};
