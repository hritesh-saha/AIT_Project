import express from "express";
import {
  addDevice,
  getDeviceByUid,
  getDevices,
  deleteDeviceByUid,
  updateDeviceStock
} from "../Controllers/deviceController.js"

const router = express.Router();

// Add a new device
router.post("/", addDevice);

// Get devices list with optional filters & pagination
router.get("/", getDevices);

// Get a single device by UID
router.get("/:uid", getDeviceByUid);

// Delete device by UID
router.delete("/:uid", deleteDeviceByUid);

// Update stock quantity for a device by UID
router.patch("/:uid/stock", updateDeviceStock);

export default router;
