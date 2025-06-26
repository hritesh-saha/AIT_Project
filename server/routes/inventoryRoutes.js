import express from "express";
import {
  getMobileInventorySummary,
  getLaptopInventorySummary,
  getTabletInventorySummary,
  getAddonInventorySummary,
  getInventorySummary,
  getInventoryTurnaroundTimes,
} from "../Controllers/inventoryController.js"

const router = express.Router();

// GET summaries per device type
router.get("/mobile", getMobileInventorySummary);
router.get("/laptop", getLaptopInventorySummary);
router.get("/tablet", getTabletInventorySummary);
router.get("/addon", getAddonInventorySummary);

// GET overall inventory summary across devices (mobile, laptop, tablet)
router.get("/summary", getInventorySummary);
router.get("/turnaround-times", getInventoryTurnaroundTimes);

export default router;
