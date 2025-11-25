const express = require("express");
const cookieParser = require("cookie-parser");
const passport = require('passport');
require('./passport/google');
const authRoutes = require("./routes/auth.routes");
const foodRoutes = require("./routes/food.routes"); 
const foodPartnerRoutes = require("./routes/food-partner.routes");
const cors = require("cors");

const app = express();

app.use(cors({
    origin: [
        'http://localhost:5173',
        'https://zomato-reel-delta.vercel.app',
        'https://reel-zom-project.vercel.app',
        /\.vercel\.app$/  // Allow all Vercel deployments
    ]
    
}));

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like curl or postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || /\.vercel\.app$/.test(origin)) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.use(cookieParser());
app.use(express.json());
app.use(passport.initialize());


app.get("/", (req, res) => {
    res.send("Welcome to the Food Delivery App API");
});

app.use("/api/auth", authRoutes);
app.use("/api/food", foodRoutes);
app.use("/api/food-partner", foodPartnerRoutes);

module.exports = app;
