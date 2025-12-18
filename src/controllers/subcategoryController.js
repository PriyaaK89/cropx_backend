const {createSubCategory, getSubCategory} = require("../models/subcategoryModel");

exports.addSubCategory = async(req,res)=>{
   try{
 const { category_id, name } = req.body;
  if (!category_id || !name) {
    return res.status(400).json({ message: "Missing fields" });
  }

  const result = await createSubCategory(category_id, name);

  res.status(201).json({
    success: true,
    id: result.insertId,
    category_id,
    name,
  });
   }catch(error){
    console.log(error, "Sub-category creation failed");
    return(res.status(500).json({
        message: "Sub-category creation failed"
    }))
   }
}

exports.getSubCategories = async (req, res) => {
  const { category_id } = req.query;
  const data = await getSubCategory(category_id);

  res.json({ success: true, data });
};