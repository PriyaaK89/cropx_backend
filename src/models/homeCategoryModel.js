const db = require("../config/db");

exports.getHomeCategories = async () => {
  const sql = `
    SELECT
      id,
      title,
      slug,
      image
    FROM collections
    WHERE show_on_home = 1
    ORDER BY home_order ASC
  `;

  const [rows] = await db.query(sql);
  return rows;
};
