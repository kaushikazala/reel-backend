const mongoose = require("mongoose");

const Order = require("../models/order.model");
const foodModel = require("../models/food.model");

function normalizeItems(items) {
  const map = new Map();

  for (const it of items) {
    const foodId = it?.foodId;
    const qtyRaw = it?.quantity;

    if (!foodId || !mongoose.isValidObjectId(foodId)) {
      return { error: "Invalid foodId in items" };
    }

    const quantity = Number(qtyRaw);
    if (!Number.isInteger(quantity) || quantity < 1) {
      return { error: "Quantity must be an integer >= 1" };
    }

    map.set(foodId, (map.get(foodId) || 0) + quantity);
  }

  return {
    items: Array.from(map.entries()).map(([foodId, quantity]) => ({ foodId, quantity })),
  };
}

async function createOrder(req, res) {
  try {
    const user = req.user;
    const { foodPartnerId, items } = req.body;

    if (!foodPartnerId || !mongoose.isValidObjectId(foodPartnerId)) {
      return res.status(400).json({ message: "Invalid foodPartnerId" });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Order items are required" });
    }

    const normalized = normalizeItems(items);
    if (normalized.error) {
      return res.status(400).json({ message: normalized.error });
    }

    const foodIds = normalized.items.map((it) => it.foodId);

    const foods = await foodModel.find({ _id: { $in: foodIds } });
    if (foods.length !== foodIds.length) {
      return res.status(400).json({ message: "One or more food items were not found" });
    }

    // Ensure all items belong to the selected food partner.
    for (const f of foods) {
      if (String(f.foodPartner) !== String(foodPartnerId)) {
        return res
          .status(400)
          .json({ message: "All items must belong to the same food partner" });
      }
    }

    const qtyById = new Map(normalized.items.map((it) => [String(it.foodId), it.quantity]));

    const orderItems = foods.map((f) => ({
      food: f._id,
      nameSnapshot: f.name,
      videoSnapshot: f.video,
      priceCentsSnapshot: typeof f.priceCents === "number" ? f.priceCents : undefined,
      quantity: qtyById.get(String(f._id)) || 1,
    }));

    // Price not implemented yet -> totals will be 0 for now.
    const subtotalCents = orderItems.reduce(
      (sum, it) => sum + (Number(it.priceCentsSnapshot) || 0) * it.quantity,
      0
    );

    const order = await Order.create({
      user: user._id,
      foodPartner: foodPartnerId,
      items: orderItems,
      subtotalCents,
      totalCents: subtotalCents,
      status: "PLACED",
    });

    return res.status(201).json({ message: "Order placed", order });
  } catch (err) {
    console.error("Error creating order:", err);
    return res.status(500).json({ message: "Error placing order", error: err.message });
  }
}

async function getOrderById(req, res) {
  try {
    const user = req.user;
    const { orderId } = req.params;

    if (!orderId || !mongoose.isValidObjectId(orderId)) {
      return res.status(400).json({ message: "Invalid orderId" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (String(order.user) !== String(user._id)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    return res.status(200).json({ message: "Order fetched", order });
  } catch (err) {
    console.error("Error fetching order:", err);
    return res.status(500).json({ message: "Error fetching order", error: err.message });
  }
}

async function listMyOrders(req, res) {
  try {
    const user = req.user;
    const orders = await Order.find({ user: user._id }).sort({ createdAt: -1 });
    return res.status(200).json({ message: "Orders fetched", orders });
  } catch (err) {
    console.error("Error listing orders:", err);
    return res.status(500).json({ message: "Error fetching orders", error: err.message });
  }
}

module.exports = {
  createOrder,
  getOrderById,
  listMyOrders,
};
