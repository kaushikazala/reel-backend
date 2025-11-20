const userModel = require('../models/user.model')
const foodPartnerModel = require('../models/foodpartner.model') 
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

// Common cookie options for all
const cookieOptions = {
    httpOnly: true,
    secure: true,          // <--- REQUIRED FOR VERCEL + RENDER
    sameSite: "none",      // <--- REQUIRED FOR CROSS-DOMAIN
    path: "/",             // <--- SEND COOKIE FOR ALL ROUTES
};

async function registerUser(req,res) {
    const {fullName,email,password} = req.body;

    const isUserAllreadyExists = await userModel.findOne({ email });

    if(isUserAllreadyExists){
        return res.status(400).json({ message:"user already exists" });
    }
    
    const hashedPassword = await bcrypt.hash(password,10);
    
    const user = await userModel.create({
        fullName,
        email,
        password: hashedPassword
    });

    const token = jwt.sign({ id:user._id }, process.env.JWT_SECRET);

    res.cookie("token", token, cookieOptions);

    res.status(201).json({
        message:"user registered successfully",
        user:{
            _id:user._id,
            email:user.email,
            fullName:user.fullName    
        }
    });
}

async function loginUser(req,res) {
    const {email,password} = req.body;

    const user = await userModel.findOne({ email });

    if(!user){
        return res.status(404).json({ message:"user not found" });
    }

    const isPasswordValid = await bcrypt.compare(password,user.password);

    if(!isPasswordValid){
        return res.status(401).json({ message:"invalid password" });
    }

    const token = jwt.sign({ id:user._id }, process.env.JWT_SECRET);

    res.cookie("token", token, cookieOptions);

    res.status(200).json({
        message:"user logged in successfully",
        user:{
            _id:user._id,
            email:user.email,
            fullName:user.fullName    
        }
    });
}

async function logoutUser(req,res) {
    res.clearCookie("token", { ...cookieOptions, maxAge: 0 });

    res.status(200).json({
        message:"user logged out successfully"
    });
}

async function registerFoodPartner(req,res) {
    const { businessName, ownerName, businessType, email, phone, address, password, agreeToTerms } = req.body;

    const isFoodPartnerAllreadyExists = await foodPartnerModel.findOne({ email });

    if(isFoodPartnerAllreadyExists){
        return res.status(400).json({ message:"food partner already exists" });
    }

    const hashedPassword = await bcrypt.hash(password,10);

    const foodPartner = await foodPartnerModel.create({
        businessName,
        ownerName,
        businessType,
        email,
        phone,
        address,
        password: hashedPassword,
        agreeToTerms
    });

    const token = jwt.sign({ id:foodPartner._id }, process.env.JWT_SECRET);

    res.cookie("token", token, cookieOptions);

    res.status(201).json({
        message:"food partner registered successfully",
        foodPartner
    });
}

async function loginFoodPartner(req,res) {
    const { email, password } = req.body;

    const foodPartner = await foodPartnerModel.findOne({ email });

    if(!foodPartner){
        return res.status(404).json({ message:"food partner not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, foodPartner.password);

    if(!isPasswordValid){
        return res.status(401).json({ message:"invalid password" });
    }

    const token = jwt.sign({ id:foodPartner._id }, process.env.JWT_SECRET);

    res.cookie("token", token, cookieOptions);

    res.status(200).json({
        message:"food partner logged in successfully",
        foodPartner
    });
}

async function logoutFoodPartner(req,res) {
    res.clearCookie("token", { ...cookieOptions, maxAge: 0 });

    res.status(200).json({
        message:"food partner logged out successfully"
    });
}

module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    registerFoodPartner,
    loginFoodPartner,
    logoutFoodPartner
}
