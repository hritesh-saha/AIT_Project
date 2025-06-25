import express from "express";
import { createSale, getAllSales } from "../Controllers/salesController.js"

const router = express.Router();

// POST: Record a new sale (multiple items in one sale)
router.post("/", createSale);

// GET: Fetch all sales records, sorted by newest first
router.get("/", getAllSales);

export default router;
