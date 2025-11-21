const jwt = require("jsonwebtoken");
const db = require("../config/db");

exports.login = (req, res) => {
    const { email, password } = req.body;

    if(!email || !password){
        return res?.status(400).json({
            success: false,
            message: "Email & Password are required."
        })
    }
    if (email === "admin@gmail.com") {
        if(password !== "admin123"){
            return res.status(400).json({
                success: false,
                message: "Incorrect password!"
            })
        }
        const token = jwt.sign(
            { userId: 1, email: email, role: "admin" },
            process.env.JWT_SECRET
        );

        return res.status(200).json({
            success: true,
            message: "Admin login successful",
            token,
            userId: 1,
            email: "admin@gmail.com",
            role: "admin"
        });
    }
}
