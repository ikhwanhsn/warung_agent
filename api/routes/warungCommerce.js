import express from "express";
import {
  findItems,
  createOrder,
  executePayment,
} from "../services/warungMockCommerce.js";

const router = express.Router();

/** POST /warung/find-items — body: { query, category?, location? } */
router.post("/find-items", (req, res) => {
  try {
    const { query = "", category = null, location = null } = req.body || {};
    const items = findItems({ query, category, location });
    res.json({ success: true, data: items });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message || "find_items failed" });
  }
});

/** POST /warung/create-order — body: { item_id, quantity, total_price, provider } */
router.post("/create-order", (req, res) => {
  try {
    const body = req.body || {};
    const out = createOrder({
      item_id: String(body.item_id ?? ""),
      quantity: Number(body.quantity) || 0,
      total_price: Number(body.total_price) || 0,
      provider: String(body.provider ?? ""),
    });
    res.json({ success: true, data: out });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message || "create_order failed" });
  }
});

/** POST /warung/execute-payment — body: { amount } */
router.post("/execute-payment", async (req, res) => {
  try {
    const amount = Number((req.body || {}).amount);
    if (!Number.isFinite(amount) || amount < 0) {
      return res.status(400).json({ success: false, error: "amount must be a non-negative number" });
    }
    const out = await executePayment({ amount });
    res.json({ success: true, data: out });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message || "execute_payment failed" });
  }
});

export function createWarungCommerceRouter() {
  return router;
}
