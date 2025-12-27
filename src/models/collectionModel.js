const db = require("../config/db");

exports.createCollection = async (data) => {
  const sql = `
    INSERT INTO collections
    (title, slug, description, image, show_in_menu, show_on_home, home_order)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  const [result] = await db.query(sql, [
    data.title,
    data.slug,
    data.description,
    data.image,
    data.show_in_menu,
    data.show_on_home,
    data.home_order,
  ]);
  return result;
};


exports.mapChildCategory = async (collection_id, child_category_id) => {
  const sql = `
    INSERT IGNORE INTO collection_category_map
    (collection_id, child_category_id)
    VALUES (?, ?)
  `;
  await db.query(sql, [collection_id, child_category_id]);
};
// Get all collections (admin)
exports.getAllCollections = async () => {
  const [rows] = await db.query(`SELECT * FROM collections ORDER BY home_order`);
  return rows;
};

exports.updateCollection = async (id, data) => {
  const fields = [];
  const values = [];

  if (data.title !== undefined) {
    fields.push("title = ?");
    values.push(data.title);
  }

  if (data.slug !== undefined) {
    fields.push("slug = ?");
    values.push(data.slug);
  }

  if (data.description !== undefined) {
    fields.push("description = ?");
    values.push(data.description);
  }

  if (data.image !== undefined) {
    fields.push("image = ?");
    values.push(data.image);
  }

  if (data.show_in_menu !== undefined) {
    fields.push("show_in_menu = ?");
    values.push(data.show_in_menu);
  }

  if (data.show_on_home !== undefined) {
    fields.push("show_on_home = ?");
    values.push(data.show_on_home);
  }

  if (data.home_order !== undefined) {
    fields.push("home_order = ?");
    values.push(data.home_order);
  }

  if (!fields.length) return false;

  const sql = `
    UPDATE collections
    SET ${fields.join(", ")}
    WHERE id = ?
  `;

  values.push(id);

  const [result] = await db.query(sql, values);
  return result;
};

exports.deleteCollectionById = async (id) => {
  const [result] = await db.query(
    `DELETE FROM collections WHERE id = ?`,
    [id]
  );
  return result;
};

// DELETE mapped child categories (optional but recommended)
exports.deleteCollectionCategoryMap = async (collection_id) => {
  await db.query(
    `DELETE FROM collection_category_map WHERE collection_id = ?`,
    [collection_id]
  );
};
