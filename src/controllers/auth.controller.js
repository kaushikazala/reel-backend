const userModel = require('../models/user.model')
const foodPartnerModel = require('../models/foodpartner.model') 
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Common cookie options for all
const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: "none",
        path: "/",
};

// Setup nodemailer transporter (uses env vars)
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

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

    const token = jwt.sign({ id:user._id, role: 'user' }, process.env.JWT_SECRET);

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

    const token = jwt.sign({ id:user._id, role: 'user' }, process.env.JWT_SECRET);

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

    const token = jwt.sign({ id:foodPartner._id, role: 'food-partner' }, process.env.JWT_SECRET);

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

    const token = jwt.sign({ id:foodPartner._id, role: 'food-partner' }, process.env.JWT_SECRET);

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

async function forgotPassword(req, res) {
    const { email, role = 'user' } = req.body;
    const Model = role === 'food-partner' ? foodPartnerModel : userModel;

    try {
        const account = await Model.findOne({ email });
        if (!account) return res.status(404).json({ message: 'Account not found' });

        const token = crypto.randomBytes(32).toString('hex');
        account.resetPasswordToken = token;
        account.resetPasswordExpires = Date.now() + 1000 * 60 * 60; // 1 hour
        await account.save();

        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}&role=${role}`;

        // Validate email config
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.error('Email credentials not configured');
            return res.status(500).json({ message: 'Email service not configured' });
        }

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Reset your password',
            html: `<p>Click <a href="${resetUrl}">here</a> to reset your password. This link expires in 1 hour.</p>`
        });

        return res.json({ message: 'Password reset email sent' });
    } catch (err) {
        console.error('Forgot password error:', err);
        return res.status(500).json({ message: 'Error sending reset email', error: err.message });
    }
}

async function resetPassword(req, res) {
    const { token, newPassword, role = 'user' } = req.body;
    const Model = role === 'food-partner' ? foodPartnerModel : userModel;

    const account = await Model.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() }
    });

    if (!account) return res.status(400).json({ message: 'Invalid or expired token' });

    const hashed = await bcrypt.hash(newPassword, 10);
    account.password = hashed;
    account.resetPasswordToken = undefined;
    account.resetPasswordExpires = undefined;
    await account.save();

    return res.json({ message: 'Password reset successful' });
}


 
module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    registerFoodPartner,
    loginFoodPartner,
    logoutFoodPartner,
    forgotPassword,
    resetPassword,

};



