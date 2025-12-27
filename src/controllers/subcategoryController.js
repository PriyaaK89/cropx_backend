const {createSubCategory, getSubCategory} = require("../models/subcategoryModel");

// exports.addSubCategory = async(req,res)=>{
//    try{
//  const { category_id, name } = req.body;
//   if (!category_id || !name) {
//     return res.status(400).json({ message: "Missing fields" });
//   }

//   const result = await createSubCategory(category_id, name);

//   res.status(201).json({
//     success: true,
//     id: result.insertId,
//     category_id,
//     name,
//   });
//    }catch(error){
//     console.log(error, "Sub-category creation failed");
//     return(res.status(500).json({
//         message: "Sub-category creation failed"
//     }))
//    }
// }


exports.addSubCategory = async (req, res) => {
  try {
    const { category_id, name, slug, menu_order } = req.body;

    if (!category_id || !name) {
      return res.status(400).json({ message: "category_id and name are required" });
    }

    const result = await createSubCategory(
      category_id,
      name,
      slug,
      menu_order
    );

    res.status(201).json({
      success: true,
      data: {
        id: result.insertId,
        category_id,
        name,
        slug,
        menu_order,
      },
    });
  } catch (error) {
    console.error("Sub-category creation failed:", error);
    res.status(500).json({
      success: false,
      message: "Sub-category creation failed",
    });
  }
};

exports.getSubCategories = async (req, res) => {
  try {
    const { category_id } = req.query;

    if (!category_id) {
      return res.status(400).json({ message: "category_id is required" });
    }

    const data = await getSubCategory(category_id);

    res.json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    console.error("Fetching sub-categories failed:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch sub-categories",
    });
  }
};


// exports.getSubCategories = async (req, res) => {
//   const { category_id } = req.query;
//   const data = await getSubCategory(category_id);

//   res.json({ success: true, data });
// };
