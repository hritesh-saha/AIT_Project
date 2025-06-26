import Mobile from "../models/Mobile.js";
import Laptop from "../models/Laptop.js";
import Tablet from "../models/Tablet.js";
import Addon from "../models/AddOn.js";
import Device from "../models/BaseDevice.js";

const aggregateInventory = async (Model) => {
  const result = await Model.aggregate([
    {
      $group: {
        _id: null,
        totalInventory: { $sum: "$inventory_qty" },
        totalSold: { $sum: "$sold_qty" },
        avgDiscount: { $avg: "$discount" },
        avgPrice: { $avg: "$final_price" }
      }
    }
  ]);
  return result[0] || { totalInventory: 0, totalSold: 0, avgDiscount: 0, avgPrice: 0 };
};

// Mobile inventory summary
export const getMobileInventorySummary = async (req, res) => {
  try {
    const data = await aggregateInventory(Mobile);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Error fetching mobile inventory", error: err.message });
  }
};

// Laptop inventory summary
export const getLaptopInventorySummary = async (req, res) => {
  try {
    const data = await aggregateInventory(Laptop);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Error fetching laptop inventory", error: err.message });
  }
};

// Tablet inventory summary
export const getTabletInventorySummary = async (req, res) => {
  try {
    const data = await aggregateInventory(Tablet);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Error fetching tablet inventory", error: err.message });
  }
};

// Addon inventory summary
export const getAddonInventorySummary = async (req, res) => {
  try {
    const data = await aggregateInventory(Addon);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Error fetching addon inventory", error: err.message });
  }
};

export const getInventorySummary = async (req, res) => {
  try {
    // Aggregate data across all device types
    const aggregateData = async (Model) => {
      const result = await Model.aggregate([
        {
          $group: {
            _id: null,
            totalInventory: { $sum: "$inventory_qty" },
            totalSold: { $sum: "$sold_qty" },
            avgDiscount: { $avg: "$discount" },
            avgPrice: { $avg: "$final_price" }
          }
        }
      ]);
      return result[0] || { totalInventory: 0, totalSold: 0, avgDiscount: 0, avgPrice: 0 };
    };

    const mobileData = await aggregateData(Mobile);
    const laptopData = await aggregateData(Laptop);
    const tabletData = await aggregateData(Tablet);

    res.json({
      mobile: mobileData,
      laptop: laptopData,
      tablet: tabletData,
      totalInventory: mobileData.totalInventory + laptopData.totalInventory + tabletData.totalInventory,
      totalSold: mobileData.totalSold + laptopData.totalSold + tabletData.totalSold
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching inventory summary", error: err.message });
  }
};

export const getInventoryTurnaroundTimes = async (req, res) => {
  try {
    const devices = await Device.find();

    const turnaroundList = devices
      .map((device) => {
        const sold = device.sold_qty || 0;
        const inventory = device.inventory_qty || 0;

        // Avoid division by zero
        const ratio = sold > 0 ? inventory / sold : Infinity;

        return {
          name: device.name,
          turnaround_ratio: ratio,
          sold_qty: sold,
          inventory_qty: inventory,
        };
      })
      .filter((d) => isFinite(d.turnaround_ratio)) // Remove unsold items
      .sort((a, b) => a.turnaround_ratio - b.turnaround_ratio)
      .slice(0, 5);

    res.json({ turnaround: turnaroundList });
  } catch (err) {
    res.status(500).json({
      message: "Failed to get inventory turnaround times",
      error: err.message,
    });
  }
};
