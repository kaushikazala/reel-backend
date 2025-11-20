const foodPartnerModel = require('../models/foodpartner.model') 
const userModel = require('../models/user.model')
const jwt = require('jsonwebtoken')


async function authFoodPartnerMiddleware(req,res,next) {
     const token = req.cookies.token;
 
     if(!token){
            return res.status(401).json({
                message: "Unauthorized access"
            });
     }
        try {   
            const decoded = jwt.verify(token,process.env.JWT_SECRET);  // object format

            const foodPartner = await foodPartnerModel.findById(decoded.id);
            if(!foodPartner){
                return res.status(401).json({
                    message: "food partner not found"
                });
            }   
            req.foodPartner = foodPartner;  // create new property on req object
            next();
        }   catch (err) {   
            return res.status(401).json({
                message: "Unauthorized access"
            });
        }
}

async function authUserMiddleware(req,res,next) {
    const token = req.cookies.token;
    // console.log("Auth User Middleware Token:", token);
    if(!token){
           return res.status(401).json({
               message: "Unauthorized access"
           });
    }   try {
           const decoded = jwt.verify(token, process.env.JWT_SECRET);
           const user = await userModel.findById(decoded.id);
           if(!user){
               return res.status(401).json({
                   message: "user not found"
               });
           }
           req.user = user;
           next();
       } catch (err) {
           return res.status(401).json({
               message: "Unauthorized access"
           });
       }    
}

module.exports = { authFoodPartnerMiddleware ,
    authUserMiddleware
 };
