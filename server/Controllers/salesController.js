import Device from '../models/BaseDevice.js';
import Sale from '../models/SalesSchema.js';

// Helper function to update also_bought_together field
async function updateAlsoBoughtTogether(items) {
  // Group items by device_type
  const devicesByType = items.reduce((acc, item) => {
    if (!acc[item.device_type]) acc[item.device_type] = new Set();
    acc[item.device_type].add(item.name);
    return acc;
  }, {});

  const mainDevices = ["Mobile", "Laptop", "Tablet"];
  const accessories = [...(devicesByType["Addon"] || [])];

  // Update main devices with accessories in also_bought_together
  for (const devType of mainDevices) {
    if (!devicesByType[devType]) continue;

    for (const deviceName of devicesByType[devType]) {
      await Device.updateOne(
        { name: deviceName },
        { $addToSet: { also_bought_together: { $each: accessories } } }
      );
    }
  }

  // Optionally, update accessories with main devices they were bought with
  for (const accName of accessories) {
    const allMainDevices = mainDevices.flatMap(t => [...(devicesByType[t] || [])]);
    await Device.updateOne(
      { name: accName },
      { $addToSet: { also_bought_together: { $each: allMainDevices } } }
    );
  }
}

export const createSale = async (req, res) => {
  try {
    const { items, payment_method, location } = req.body;

    if (!items || items.length === 0 || !payment_method) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const updatedItems = [];
    let totalPrice = 0;

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

      if (device.sold_standalone && items.length === 1) {
        device.sold_standalone += 1;
      } else if (device.sold_standalone && items.length > 1) {
        device.sold_with_device += 1;
      }

      const unitPrice = device.price ?? device.cost_price;
      const itemTotal = unitPrice * quantity_sold;
      totalPrice += itemTotal;

      await device.save();

      // Prepare enriched item data for Sale document
      updatedItems.push({
        uid,
        device_type,
        name: device.name,
        quantity_sold,
        final_price: unitPrice,
        total_price: itemTotal,
        discount: device.discount,
        manufacturer: device.manufacturer,
      });
    }

    const sale = new Sale({
      items: updatedItems,
      total_price: totalPrice,
      payment_method,
      location,
    });

    await sale.save();

    // Update also_bought_together arrays based on the sale items
    await updateAlsoBoughtTogether(updatedItems);

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

export const accessoryCorrelation = async (req, res) => {
  try {
    const sales = await Sale.find();

    const deviceTypes = ["Mobile", "Laptop", "Tablet"];
    const accessories = ["charger", "earphones", "mouse", "cover", "powerbank"];

    // Map accessory product names to their categories
    const accessoryMap = {
      "Boat Rockerz 450": "earphones",
      "Samsung 25W USB-C": "charger",
      "Mi Power Bank 3i 10000mAh": "powerbank",
      "Logitech M221 Silent": "mouse",
      "iPhone 13 Pro Max Tempered Glass": "cover",
    };

    // Initialize correlation matrix
    const correlationMap = {};
    deviceTypes.forEach((device) => {
      correlationMap[device] = {};
      accessories.forEach((acc) => {
        correlationMap[device][acc] = { count: 0, total: 0 };
      });
    });

    for (const sale of sales) {
      const items = sale.items;

      // Filter out the main devices sold
      const devices = items.filter((i) => deviceTypes.includes(i.device_type));

      // Extract accessory categories based on product name using the map
      const boughtAccessories = items
        .filter((i) => i.device_type === "Addon")
        .map((i) => accessoryMap[i.name])
        .filter(Boolean); // remove undefined if accessoryMap doesn't match

      // Count accessory purchase occurrences per device
      devices.forEach((device) => {
        accessories.forEach((acc) => {
          if (boughtAccessories.includes(acc)) {
            correlationMap[device.device_type][acc].count += 1;
          }
          correlationMap[device.device_type][acc].total += 1;
        });
      });
    }

    // Convert counts to percentages
    const result = Object.entries(correlationMap).map(([device, accs]) => {
      const row = { device };
      Object.entries(accs).forEach(([acc, { count, total }]) => {
        row[acc] = total > 0 ? Math.round((count / total) * 100) : 0;
      });
      return row;
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({
      error: "Failed to compute correlation",
      details: err.message,
    });
  }
};

export const getRevenueDistribution = async (req, res) => {
  try {
    const result = await Sale.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.name",
          totalRevenue: { $sum: "$items.total_price" }
        }
      },
      { $sort: { totalRevenue: -1 } }
    ]);

    const formatted = result.map(item => ({
      name: item._id,
      value: item.totalRevenue
    }));

    res.json(formatted);
  } catch (err) {
    console.error("Error in revenue distribution:", err);
    res.status(500).json({ message: "Failed to get revenue distribution", error: err.message });
  }
};

export const getTotalProfit = async (req, res) => {
  try {
    const sales = await Sale.find();

    let total_profit = 0;

    for (const sale of sales) {
      for (const item of sale.items) {
        const device = await Device.findOne({ uid: item.uid });

        if (device) {
          const profit_per_unit = (item.final_price || 0) - (device.cost_price || 0);
          total_profit += profit_per_unit * item.quantity_sold;
        }
      }
    }

    res.json({ total_profit });
  } catch (err) {
    res.status(500).json({
      message: "Failed to calculate total profit",
      error: err.message,
    });
  }
};

export const getAvgBasketValue = async (req, res) => {
  try {
    const sales = await Sale.find({}, { total_price: 1 });

    const total = sales.reduce((acc, sale) => acc + (sale.total_price || 0), 0);
    const avg_basket_value = sales.length > 0 ? total / sales.length : 0;

    res.json({ avg_basket_value });
  } catch (err) {
    res.status(500).json({
      message: "Failed to calculate average basket value",
      error: err.message,
    });
  }
};

export const getTopProfitMakers = async (req, res) => {
  try {
    const sales = await Sale.find();

    const profitMap = {};

    for (const sale of sales) {
      for (const item of sale.items) {
        const device = await Device.findOne({ uid: item.uid });
        if (!device) continue;

        const profit_per_unit = (item.final_price || 0) - (device.cost_price || 0);
        const total_profit = profit_per_unit * item.quantity_sold;

        profitMap[item.name] = (profitMap[item.name] || 0) + total_profit;
      }
    }

    const top = Object.entries(profitMap)
      .map(([name, profit]) => ({ name, profit }))
      .sort((a, b) => b.profit - a.profit)
      .slice(0, 10);

    res.json({ top });
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch top profit makers",
      error: err.message,
    });
  }
};

export const getTopSellers = async (req, res) => {
  try {
    const sales = await Sale.find();

    const sellCountMap = {};

    for (const sale of sales) {
      for (const item of sale.items) {
        sellCountMap[item.name] =
          (sellCountMap[item.name] || 0) + item.quantity_sold;
      }
    }

    const top = Object.entries(sellCountMap)
      .map(([name, units_sold]) => ({ name, units_sold }))
      .sort((a, b) => b.units_sold - a.units_sold)
      .slice(0, 10);

    res.json({ top });
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch top sellers",
      error: err.message,
    });
  }
};