import Sale from "../models/SalesSchema.js";
import Device from "../models/BaseDevice.js";

// POST: Record a new sale
export const createSale = async (req, res) => {
  try {
    const { items, payment_method, location } = req.body;

    if (!items || items.length === 0 || !payment_method) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const updatedItems = [];

    for (const item of items) {
      const { uid, quantity_sold, device_type } = item;

      const device = await Device.findOne({ uid });
      if (!device) {
        return res.status(404).json({ message: `Device with UID ${uid} not found` });
      }

      if (device.inventory_qty < quantity_sold) {
        return res.status(400).json({ message: `Insufficient stock for ${device.name}` });
      }

      // Update inventory and sold count
      device.inventory_qty -= quantity_sold;
      device.sold_qty += quantity_sold;
      await device.save();

      // Prepare enriched item data for Sale document
      updatedItems.push({
        uid,
        device_type,
        name: device.name,
        quantity_sold,
        final_price: device.final_price,
        total_price: device.final_price * quantity_sold,
        discount: device.discount,
        manufacturer: device.manufacturer
      });
    }

    const sale = new Sale({
      items: updatedItems,
      payment_method,
      location
    });

    await sale.save();

    res.status(201).json({ message: "🧾 Sale recorded successfully", sale });
  } catch (err) {
    res.status(500).json({ message: "❌ Error recording sale", error: err.message });
  }
};

// GET: Fetch all sales
export const getAllSales = async (req, res) => {
  try {
    const sales = await Sale.find().sort({ createdAt: -1 }); // Most recent first
    res.json(sales);
  } catch (err) {
    res.status(500).json({ message: "❌ Error fetching sales", error: err.message });
  }
};

export const getRealTimeSalesAnalytics = async (req, res) => {
  try {
    const now = new Date();

    const oneHourAgo = new Date(now.getTime() - 1 * 60 * 60 * 1000);
    const sixHoursAgo = new Date(now.getTime() - 6 * 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const getStats = async (fromTime) => {
      const pipeline = [
        {
          $match: {
            createdAt: { $gte: fromTime }
          }
        },
        { $unwind: "$items" },
        {
          $group: {
            _id: null,
            total_sales: { $sum: 1 },
            total_items_sold: { $sum: "$items.quantity_sold" },
            total_revenue: { $sum: "$items.total_price" }
          }
        }
      ];

      const result = await Sale.aggregate(pipeline);
      return result[0] || { total_sales: 0, total_items_sold: 0, total_revenue: 0 };
    };

    const lastHourStats = await getStats(oneHourAgo);
    const last6HoursStats = await getStats(sixHoursAgo);
    const lastDayStats = await getStats(oneDayAgo);

    res.json({
      last_hour: lastHourStats,
      last_6_hours: last6HoursStats,
      last_24_hours: lastDayStats
    });

  } catch (err) {
    res.status(500).json({ message: "❌ Error fetching real-time analytics", error: err.message });
  }
};