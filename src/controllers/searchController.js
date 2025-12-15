const searchModel = require("../models/searchModel");

exports.search = async(req,res)=>{
     try{
          const {q} =  req.query;

          if(!q || q.length < 2 ){
            return res.json({success: true, data: []})
          }

          const result = await searchModel.searchProductsAndCategories(q)
          res.status(200).json({
            success: true,
            data: result,
          });

     }catch(error){
        console.log(error, 'Search error');
        res.status(500).json({
            success: false,
            message: "Search Failed",
        })
     }
}