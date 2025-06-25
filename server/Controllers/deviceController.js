import Mobile from "../models/Mobile.js";
import Laptop from "../models/Laptop.js";
import Tablet from "../models/Tablet.js";
import Device from "../models/BaseDevice.js";

const deviceMap = {
  mobile: Mobile,
  laptop: Laptop,
  tablet: Tablet,
};

export const addDevice = async (req, res) => {
  try {
    const { device_type, ...data } = req.body;

    if (!device_type || !deviceMap[device_type.toLowerCase()]) {
      return res.status(400).json({ message: "Invalid or missing device_type" });
    }

    // Select the model to use
    const DeviceModel = deviceMap[device_type.toLowerCase()];

    // Create device instance; mongoose will fill uid, date, time automatically
    const device = new DeviceModel(data);

    // Save to DB
    await device.save();

    return res.status(201).json({
      message: `${device_type} added successfully`,
      device
    });
  } catch (err) {
    return res.status(500).json({ message: "Error adding device", error: err.message });
  }
};

export const getDeviceByUid = async (req, res) => {
  try {
    const { uid } = req.params;

    // Search in base collection (all devices)
    const device = await Device.findOne({ uid });

    if (!device) return res.status(404).json({ message: "Device not found" });

    res.json(device);
  } catch (err) {
    res.status(500).json({ message: "Error fetching device", error: err.message });
  }
};

// GET /api/devices?device_type=mobile&manufacturer=Samsung&page=1&limit=20
export const getDevices = async (req, res) => {
  try {
    const { device_type, manufacturer, page = 1, limit = 20 } = req.query;

    let devices = [];

    if (device_type) {

      const DeviceModel = deviceMap[device_type.toLowerCase()];
      if (!DeviceModel) return res.status(400).json({ message: "Invalid device_type" });

      const filter = manufacturer ? { manufacturer } : {};

      devices = await DeviceModel.find(filter)
        .skip((page - 1) * limit)
        .limit(parseInt(limit));
    } else {
      // If no device_type, get all devices of all types (limited)
      const mobiles = await Mobile.find(manufacturer ? { manufacturer } : {})
        .limit(parseInt(limit));
      const laptops = await Laptop.find(manufacturer ? { manufacturer } : {})
        .limit(parseInt(limit));
      const tablets = await Tablet.find(manufacturer ? { manufacturer } : {})
        .limit(parseInt(limit));
      devices = [...mobiles, ...laptops, ...tablets];
    }

    res.json(devices);
  } catch (err) {
    res.status(500).json({ message: "Error fetching devices", error: err.message });
  }
};


export const deleteDeviceByUid = async (req, res) => {
  try {
    const { uid } = req.params;

    // Find and delete the device by UID
    const deletedDevice = await Device.findOneAndDelete({ uid });

    if (!deletedDevice) {
      return res.status(404).json({ message: "Device not found or already deleted" });
    }

    res.json({
      message: "Device deleted successfully",
      deletedDevice
    });
  } catch (err) {
    res.status(500).json({ message: "Error deleting device", error: err.message });
  }
};


function getCurrentDate() {
  return new Date().toISOString().split("T")[0];
}
function getCurrentTime() {
  return new Date().toTimeString().split(" ")[0];
}

// PATCH: Update stock quantity for a device
export const updateDeviceStock = async (req, res) => {
  try {
    const { uid } = req.params;
    const { quantity, action } = req.body; // action: 'add' or 'subtract'

    if (!["add", "subtract"].includes(action)) {
      return res.status(400).json({ message: "Action must be 'add' or 'subtract'" });
    }

    const device = await Device.findOne({ uid });

    if (!device) {
      return res.status(404).json({ message: "Device not found" });
    }

    if (action === "subtract" && device.inventory_qty < quantity) {
      return res.status(400).json({ message: "Insufficient stock to subtract" });
    }

    // Perform stock update
    device.inventory_qty = action === "add"
      ? device.inventory_qty + quantity
      : device.inventory_qty - quantity;

    // Update timestamp
    device.date = getCurrentDate();
    device.time = getCurrentTime();

    await device.save();

    res.json({
      message: `Stock ${action}ed successfully`,
      uid: device.uid,
      new_inventory_qty: device.inventory_qty
    });

  } catch (err) {
    res.status(500).json({ message: "Error updating stock", error: err.message });
  }
};