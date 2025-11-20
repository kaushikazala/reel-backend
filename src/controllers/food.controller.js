const foodModel = require("../models/food.model");
const storageService = require("../services/storage.service");
const { v4: uuid } = require("uuid");
const likeModel = require("../models/likes.model");
const saveModel = require("../models/save.model");

async function createFoodItem(req, res) {
  const fileUploadResult = await storageService.uploadFile(
    req.file.buffer,
    uuid()
  ); //video data

  const foodItem = await foodModel.create({
    name: req.body.name,
    description: req.body.description,
    video: fileUploadResult.url,
    foodPartner: req.foodPartner._id,
  });

  res.status(201).json({
    message: "Food item created successfully",
    foodItem: foodItem,
  });
}

async function getFoodItems(req, res) {
  try {
    const user = req.user;

    const foodItems = await foodModel.find({});
    
    // Get user's likes and saves for all food items
    const userLikes = await likeModel.find({ user: user._id }).select('food');
    const userSaves = await saveModel.find({ user: user._id }).select('food');
    
    const likedFoodIds = new Set(userLikes.map(like => like.food.toString()));
    const savedFoodIds = new Set(userSaves.map(save => save.food.toString()));
    
    // Add isLiked and isSaved flags to each food item
    const enrichedFoodItems = foodItems.map(food => ({
      ...food.toObject(),
      isLiked: likedFoodIds.has(food._id.toString()),
      isSaved: savedFoodIds.has(food._id.toString())
    }));

    res.status(200).json({
      message: "Food items fetched successfully",
      foodItems: enrichedFoodItems,
    });
  } catch (err) {
    console.error('Error in getFoodItems:', err);
    res.status(500).json({
      message: "Error fetching food items",
      error: err.message
    });
  }
}

async function likeFood(req, res) {
  try {
    const { foodId } = req.body;
    const user = req.user;

    const isAlreadyLiked = await likeModel.findOne({
      user: user._id,
      food: foodId,
    });
    if (isAlreadyLiked) {
      await likeModel.deleteOne({ user: user._id, food: foodId });
      const updatedFood = await foodModel.findByIdAndUpdate(foodId, { $inc: { likesCount: -1 } }, { new: true });
      return res.status(200).json({
        message: "Food item unliked successfully",
        isLiked: false,
        likesCount: updatedFood.likesCount
      });
    }

    const like = await likeModel.create({
      user: user._id,
      food: foodId,
    });
    const updatedFood = await foodModel.findByIdAndUpdate(foodId, { $inc: { likesCount: 1 } }, { new: true });
    res.status(201).json({
      message: "Food item liked successfully",
      isLiked: true,
      likesCount: updatedFood.likesCount,
      like,
    });
  } catch (err) {
    console.error('Error in likeFood:', err);
    res.status(500).json({
      message: "Error liking food item",
      error: err.message
    });
  }
}

async function saveFood(req, res) {
  try {
    const { foodId } = req.body;
    const user = req.user;
    
    const isAlreadySaved = await saveModel.findOne({
        user: user._id,
        food: foodId,
    });

    if (isAlreadySaved) { 
        await saveModel.deleteOne({ user: user._id, food: foodId });
        const updatedFood = await foodModel.findByIdAndUpdate(foodId, { $inc: { savesCount: -1 } }, { new: true });
        return res.status(200).json({
            message: "Food item unsaved successfully",
            isSaved: false,
            savesCount: updatedFood.savesCount
        });
    }
    const save = await saveModel.create({
        user: user._id,
        food: foodId,   
    });
    const updatedFood = await foodModel.findByIdAndUpdate(foodId, { $inc: { savesCount: 1 } }, { new: true });
    res.status(201).json({
        message: "Food item saved successfully",
        isSaved: true,
        savesCount: updatedFood.savesCount,
        save,
    });
  } catch (err) {
    console.error('Error in saveFood:', err);
    res.status(500).json({
      message: "Error saving food item",
      error: err.message
    });
  }
}
async function getSavedFood(req, res) {
  try {
    const user = req.user;
    
    if (!user || !user._id) {
      return res.status(401).json({
        message: "User not authenticated",
        error: "Invalid user object"
      });
    }

    const savedFood = await saveModel.find({ user: user._id }).populate('food');

    if(!savedFood || savedFood.length === 0) {
      return res.status(200).json({
        message: "No saved food items found",
        savedFood: []
      });
    }

    res.status(200).json({
      message: "Saved food items fetched successfully",
      savedFood,
    });
  } catch (err) {
    console.error('Error in getSavedFood:', err);
    res.status(500).json({
      message: "Error fetching saved food items",
      error: err.message
    });
  }
}
module.exports = { createFoodItem, getFoodItems, likeFood, saveFood, getSavedFood };