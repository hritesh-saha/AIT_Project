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