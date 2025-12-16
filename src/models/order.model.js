const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    food: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Food",
      required: true,
    },
    nameSnapshot: {
      type: String,
      required: true,
    },
    videoSnapshot: {
      type: String,
    },
    // Price is not implemented in Food yet; keep for future compatibility.
    priceCentsSnapshot: {
      type: Number,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    foodPartner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FoodPartner",
      required: true,
    },
    items: {
      type: [orderItemSchema],
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length > 0,
        message: "Order must have at least one item",
      },
    },
    status: {
      type: String,
      enum: [
        "PLACED",
        "ACCEPTED",
        "PREPARING",
        "READY",
        "OUT_FOR_DELIVERY",
        "DELIVERED",
        "CANCELLED",
      ],
      default: "PLACED",
    },
    subtotalCents: {
      type: Number,
      default: 0,
    },
    totalCents: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ foodPartner: 1, createdAt: -1 });

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
