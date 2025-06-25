import Addon from "../models/AddOn.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import { authorize } from "../middlewares/authorize.js";

function getCurrentDate() {
  return new Date().toISOString().split("T")[0];
}
function getCurrentTime() {
  return new Date().toTimeString().split(" ")[0];
}

export const addAddon = async (req, res) => {
  try {
    const data = req.body;

    // Create addon instance; mongoose will fill uid, date, time automatically
    const addon = new Addon(data);

    await addon.save();

    res.status(201).json({
      message: "Addon added successfully",
      addon
    });
  } catch (err) {
    res.status(500).json({ message: "Error adding addon", error: err.message });
  }
};

export const getAddonByUid = async (req, res) => {
  try {
    const { uid } = req.params;

    const addon = await Addon.findOne({ uid });

    if (!addon) return res.status(404).json({ message: "Addon not found" });

    res.json(addon);
  } catch (err) {
    res.status(500).json({ message: "Error fetching addon", error: err.message });
  }
};

// GET /api/addons?category=Charger&page=1&limit=20
export const getAddons = async (req, res) => {
  try {
    const { category, page = 1, limit = 20 } = req.query;

    const filter = category ? { category } : {};

    const addons = await Addon.find(filter)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json(addons);
  } catch (err) {
    res.status(500).json({ message: "Error fetching addons", error: err.message });
  }
};

export const deleteAddonByUid = async (req, res) => {
  try {
    const { uid } = req.params;

    const deletedAddon = await Addon.findOneAndDelete({ uid });

    if (!deletedAddon) {
      return res.status(404).json({ message: "Addon not found or already deleted" });
    }

    res.json({
      message: "Addon deleted successfully",
      deletedAddon
    });
  } catch (err) {
    res.status(500).json({ message: "Error deleting addon", error: err.message });
  }
};

// PATCH: Update stock quantity for an addon
export const updateAddonStock = async (req, res) => {
  try {
    const { uid } = req.params;
    const { quantity, action } = req.body; // action: 'add' or 'subtract'

    if (!["add", "subtract"].includes(action)) {
      return res.status(400).json({ message: "Action must be 'add' or 'subtract'" });
    }

    const addon = await Addon.findOne({ uid });

    if (!addon) {
      return res.status(404).json({ message: "Addon not found" });
    }

    if (action === "subtract" && addon.inventory_qty < quantity) {
      return res.status(400).json({ message: "Insufficient stock to subtract" });
    }

    addon.inventory_qty = action === "add"
      ? addon.inventory_qty + quantity
      : addon.inventory_qty - quantity;

    addon.date = getCurrentDate();
    addon.time = getCurrentTime();

    await addon.save();

    res.json({
      message: `Stock ${action}ed successfully`,
      uid: addon.uid,
      new_inventory_qty: addon.inventory_qty
    });

  } catch (err) {
    res.status(500).json({ message: "Error updating stock", error: err.message });
  }
};
