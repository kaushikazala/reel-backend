const express = require("express");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/auth.routes");
const foodRoutes = require("./routes/food.routes"); 
const foodPartnerRoutes = require("./routes/food-partner.routes");
const cors = require("cors");

const app = express();

// Allowed origins for CORS (add other deployment domains here)
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://zomato-reel-delta.vercel.app',
  'https://reel-zom-project.vercel.app'
];

// Middleware to echo allowed origin and explicitly set credentials header.
// This ensures the browser receives Access-Control-Allow-Credentials: true
// so cookies are included on cross-site requests.
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (!origin) return next();

  const isAllowed = allowedOrigins.includes(origin) || /\.vercel\.app$/.test(origin);
  if (isAllowed) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  }

  if (req.method === 'OPTIONS') {
    // Short-circuit preflight
    return res.sendStatus(204);
  }

  next();
});

// Use cors middleware as well (keeps compatibility and sets additional headers)
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || /\.vercel\.app$/.test(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

app.use(cookieParser());
app.use(express.json());


app.get("/", (req, res) => {
    res.send("Welcome to the Food Delivery App API");
});

app.use("/api/auth", authRoutes);
app.use("/api/food", foodRoutes);
app.use("/api/food-partner", foodPartnerRoutes);

module.exports = app;
