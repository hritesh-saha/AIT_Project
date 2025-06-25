import express from "express";
import { createSale, getAllSales, getRealTimeSalesAnalytics } from "../Controllers/salesController.js"

const router = express.Router();

// POST: Record a new sale (multiple items in one sale)
router.post("/", createSale);

// GET: Fetch all sales records, sorted by newest first
router.get("/", getAllSales);

// GET: Fetch all sales records for last 1 hour, 6 hours and 24 hours
router.get("/sales/analytics/realtime", getRealTimeSalesAnalytics);

export default router;
