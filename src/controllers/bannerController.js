const fs = require("fs");
const path = require("path");
const imgbbService = require("../service/ImgbbService");
const { UploadBanner, getBanner, deleteBanner } = require("../models/bannerModel");

exports.uploadBanner = async(req, res)=>{
  try{
    if(!req.file) return res.status(400).json({message:"Banner image is required"});

    const filePath = path.resolve(req.file.path);
    const base64 = fs.readFileSync(filePath, {encoding:"base64"});

    const imageUrl = await imgbbService.uploadToImgBB(base64, req.file.originalname);

    fs.unlinkSync(filePath);

    const result = await UploadBanner(imageUrl);

    return res.status(201).json({
      success:true,
      message:"Banner uploaded successfully",
      id: result.insertId,
      banner_image: imageUrl
    });

  }catch(error){
    console.log(error);
    return res.status(500).json({message:"Something went wrong"});
  }
};

exports.fetchBanners = async(req, res)=>{
  try{
    const banners = await getBanner();

    return res.status(200).json({
      success:true,
      banners
    });

  }catch(error){
    console.log(error);
    return res.status(500).json({message:"Something went wrong"});
  }
}

exports.deleteBanners = async(req, res)=>{
   try{
       const {id} = req.params;

       if(!id)
        return res.status(400).json({message: "Banner Id is required!"});

        const result =  await deleteBanner(id)

        if(result.affectedRows === 0){
            return res.status(404).json({message: "Banner not found!"});
        };

        return res.status(200).json({
            success: true,
            message: "Banner deleted successfully.",
            bannerID: id
        })
   }catch(error){
    console.log(error, "error");
    return res.status(500).json({message: "Something went wrong!"})
   }
}
