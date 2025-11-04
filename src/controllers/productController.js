const fs = require("fs");
const path = require("path");
const imgbbService = require("../service/ImgbbService");
const { createProduct, getAllProducts } = require("../models/productModel");

exports.addProduct = async(req,res)=>{
  try{
    const { product_name, product_category, product_description, product_type, quantity_type, quantity_value } = req.body;
    
    if(!product_name || !product_category || !product_type || !quantity_type || !quantity_value){
      return res.status(400).json({message:"Missing required fields"});
    }

    if(!req.file) return res.status(400).json({message:"product image required"});

    // upload image to imgbb
    const filePath = path.resolve(req.file.path);
    const base64Img = fs.readFileSync(filePath,{encoding:"base64"});

    const imageUrl = await imgbbService.uploadToImgBB(base64Img, req.file.originalname);

    fs.unlinkSync(filePath); // remove local file temp

    // backend validation for type
    if(product_type === "liquid" && !["liter","ml"].includes(quantity_type)){
      return res.status(400).json({message:"Liquid can only be liter or ml"});
    }
    if(product_type === "solid" && !["kg","gm"].includes(quantity_type)){
      return res.status(400).json({message:"Solid can only be kg or gm"});
    }

    const product = {
      product_name,
      product_category,
      product_description,
      product_type,
      quantity_type,
      quantity_value,
      product_img: imageUrl
    };

    const result = await createProduct(product);

    return res.status(201).json({
      success:true,
      message:"Product added successfully",
      id: result.insertId,
      data: product
    });

  }catch(error){
    console.log(error);
    return res.status(500).json({message:"Something went wrong"});
  }
};

exports.getProducts = async(req,res)=>{
  try{
    const products = await getAllProducts();
    return res.status(200).json({success:true, data:products})
  }catch(error){
    return res.status(500).json({message:"Something went wrong"});
  }
}
