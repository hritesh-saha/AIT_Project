import express from "express";
import { accessoryCorrelation, createSale, getAllSales, getAvgBasketValue, getRealTimeSalesAnalytics, getRevenueDistribution, getTopProfitMakers, getTopSellers, getTotalProfit } from "../Controllers/salesController.js"

const router = express.Router();

// POST: Record a new sale (multiple items in one sale)
router.post("/", createSale);

// GET: Fetch all sales records, sorted by newest first
router.get("/", getAllSales);

// GET: Fetch all sales records for last 1 hour, 6 hours and 24 hours
router.get("/analytics/realtime", getRealTimeSalesAnalytics);

router.get("/correlation-analytics", accessoryCorrelation);

router.get("/analytics/revenue-distribution", getRevenueDistribution);

router.get("/analytics/total-profit", getTotalProfit);
router.get("/analytics/avg-basket-value", getAvgBasketValue);
router.get("/analytics/top-profit-makers", getTopProfitMakers);
router.get("/analytics/top-sellers", getTopSellers);

export default router;
