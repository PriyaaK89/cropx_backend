const {createSubCategory, getSubCategory, deleteSubCategory} = require("../models/subcategoryModel");

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

exports.deleteSubCategory = async( req,res )=>{
    try{
         const {id} = req.params;

         if(!id){
          return res.status(400).json({
            message: "Category ID is required."
          })
         }

         const result = await deleteSubCategory(id);

         if(result.affectedRows === 0){
          return res.status(404).json({
            message: "Category not found."
          })
         }

         return res.status(200).json({
          success: true,
          message: "SubCategory deleted successfully.",
          deletedId: id
         })
    }catch(error){
      console.log(error, "Error in deleting SubCategory!")
      return res.status(500).json({message: "Something Went wrong."})
    }
}