const contactModel = require("../models/contactModel");

exports.createContact = async(req, res)=>{
   try{
        const {name, email, contact_no, subject, message} = req.body;

        if(!name || !email || !message){
            return res.status(400).json({
                msg: "Name, Email and Address are required."
            })
        };
        const result = await contactModel.saveContact({
            name, email, contact_no, subject, message
        });
        res.status(200).json({
            msg: "Contact form submitted successfully.",
            contact_id: result?.insertId,
            data: {
                id: result?.insertId,
                name, email, contact_no, subject, message
            }
        })
   }catch(error){
    console.error(error);
    res.status(500).json({msg: "Internal Server Error."})
   }
}