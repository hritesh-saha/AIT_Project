import express from "express";
import {
  addAddon,
  getAddonByUid,
  getAddons,
  deleteAddonByUid,
  updateAddonStock
} from "../Controllers/addOnController.js"


const router = express.Router();

// Create a new addon
router.post("/addOn", addAddon);

// Get list of addons with optional filtering & pagination
router.get("/addOns", getAddons);

// Get a single addon by UID
router.get("/:uid", getAddonByUid);

// Delete an addon by UID
router.delete("/:uid", deleteAddonByUid);

// Update stock quantity for an addon by UID
router.patch("/update-stock/:uid", updateAddonStock);

export default router;
