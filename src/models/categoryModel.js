const db = require("../config/db");

// exports.createCategory = async (cate_name, description, imageUrl) => {
//   const sql = "INSERT INTO categories (cate_name, description, image) VALUES (?, ?, ?)";
//   const [result] = await db.query(sql, [cate_name, description, imageUrl]);
//   return result;
// };

exports.createCategory = async ({
  cate_name,
  slug,
  description,
  image,
  show_in_menu,
  show_on_home,
  menu_order,
  home_order
}) => {
  const sql = `
    INSERT INTO categories
    (cate_name, slug, description, image, show_in_menu, show_on_home, menu_order, home_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const [result] = await db.query(sql, [
    cate_name,
    slug,
    description,
    image,
    show_in_menu,
    show_on_home,
    menu_order,
    home_order
  ]);

  return result;
};


exports.getAllCategories = async () => {
  const [rows] = await db.query("SELECT * FROM categories");
  return rows;
};

exports.deleteCategory = async (id) => {
  const sql = "DELETE FROM categories WHERE id =?";
  const [result] = await db.query(sql, [id]);
  return result;
}



