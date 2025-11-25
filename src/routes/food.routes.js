const express = require("express");
const foodController = require("../controllers/food.controller");
const authMiddleware = require("../middlewares/auth.middlewares");
const router = express.Router();
const multer = require("multer");


const upload = multer({
  storage: multer.memoryStorage()
});  

//POST /api/food/  only for food partners to add new food items
router.post(
  "/",
  authMiddleware.authFoodPartnerMiddleware,
  upload.single("video"), // both file name and field name should be same("video")
  foodController.createFoodItem
);
 
//GET /api/food/  public feed (optional auth handled in controller)
router.get(
  "/",
  foodController.getFoodItems
);

router.post("/like",
  authMiddleware.authUserMiddleware,
  foodController.likeFood
);

router.post("/save",
  authMiddleware.authUserMiddleware,
  foodController.saveFood
);

// Support RESTful endpoints used by frontend: POST /api/food/:id/like and /api/food/:id/bookmark
router.post('/:id/like',
  authMiddleware.authUserMiddleware,
  foodController.likeFood
);

router.post('/:id/bookmark',
  authMiddleware.authUserMiddleware,
  foodController.saveFood
);

router.get("/save",
  authMiddleware.authUserMiddleware,
  foodController.getSavedFood
);

module.exports = router;
