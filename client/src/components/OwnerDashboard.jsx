import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = [
  "#4F46E5",
  "#6366F1",
  "#818CF8",
  "#A5B4FC",
  "#C7D2FE",
  "#E0E7FF",
];

const OwnerDashboard = () => {
  const dummySalesData = {
    last_hour: { total_sales: 10, total_items_sold: 35, total_revenue: 1500 },
    last_6_hours: {
      total_sales: 45,
      total_items_sold: 160,
      total_revenue: 7500,
    },
    last_24_hours: {
      total_sales: 120,
      total_items_sold: 420,
      total_revenue: 21000,
    },
  };

  const dummyInventoryData = {
    mobile: {
      totalInventory: 200,
      totalSold: 150,
      avgDiscount: 10.5,
      avgPrice: 350,
      revenue: 50000,
    },
    laptop: {
      totalInventory: 150,
      totalSold: 100,
      avgDiscount: 8.2,
      avgPrice: 850,
      revenue: 85000,
    },
    tablet: {
      totalInventory: 80,
      totalSold: 60,
      avgDiscount: 7.5,
      avgPrice: 400,
      revenue: 32000,
    },
    headphone: {
      totalInventory: 100,
      totalSold: 90,
      avgDiscount: 5.5,
      avgPrice: 50,
      revenue: 4500,
    },
    charger: {
      totalInventory: 120,
      totalSold: 110,
      avgDiscount: 6,
      avgPrice: 30,
      revenue: 3300,
    },
    powerbank: {
      totalInventory: 90,
      totalSold: 80,
      avgDiscount: 4.5,
      avgPrice: 70,
      revenue: 5600,
    },
    mouse: {
      totalInventory: 110,
      totalSold: 95,
      avgDiscount: 3.5,
      avgPrice: 40,
      revenue: 3800,
    },
    screenguard: {
      totalInventory: 130,
      totalSold: 120,
      avgDiscount: 2,
      avgPrice: 20,
      revenue: 2400,
    },
  };

  const [salesData] = useState(dummySalesData);
  const [inventoryData] = useState(dummyInventoryData);
  const [selectedTime, setSelectedTime] = useState("last_hour");

  // Correlation heatmap data: how often buyers of main devices also buy these accessories (in %)
  const correlationData = [
    {
      device: "Mobile",
      headphone: 75,
      charger: 90,
      powerbank: 80,
      mouse: 30,
      screenguard: 85,
    },
    {
      device: "Laptop",
      headphone: 40,
      charger: 70,
      powerbank: 50,
      mouse: 90,
      screenguard: 20,
    },
    {
      device: "Tablet",
      headphone: 60,
      charger: 80,
      powerbank: 40,
      mouse: 20,
      screenguard: 75,
    },
  ];

  const accessoryList = [
    "headphone",
    "charger",
    "powerbank",
    "mouse",
    "screenguard",
  ];

  // Helper: Format currency
  const formatCurrency = (num) =>
    num.toLocaleString("en-US", { style: "currency", currency: "USD" });

  // Sales Bar Chart data
  const salesChartData = [
    { metric: "Total Sales", value: salesData[selectedTime].total_sales },
    {
      metric: "Total Items Sold",
      value: salesData[selectedTime].total_items_sold,
    },
    { metric: "Total Revenue", value: salesData[selectedTime].total_revenue },
  ];

  // Pie chart data for revenue
  const revenuePieData = Object.entries(inventoryData).map(([key, val]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    value: val.revenue || 0,
  }));

  // Pie chart data for inventory
  const inventoryPieData = Object.entries(inventoryData).map(([key, val]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    value: val.totalInventory || 0,
  }));

  const deviceRankings = [
    { name: "Mobile", inventory: inventoryData.mobile.totalInventory },
    { name: "Laptop", inventory: inventoryData.laptop.totalInventory },
    { name: "Tablet", inventory: inventoryData.tablet.totalInventory },
  ].sort((a, b) => b.inventory - a.inventory);

  // Heatmap cell color based on value (0-100%)
  const getHeatmapColor = (value) => {
    // Map 0-100% to a blue intensity scale
    const intensity = Math.round((value / 100) * 255);
    return `rgba(79, 70, 229, ${value / 100})`; // Indigo with alpha
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-100 to-purple-200 p-8">
      <h1 className="text-4xl font-bold mb-8 text-center text-indigo-700">
        Owner Dashboard
      </h1>

      {/* Sales Analytics */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4 text-indigo-800">
          Real-Time Sales Analytics
        </h2>

        <div className="mb-6">
          <label className="mr-4 font-semibold text-indigo-700">
            Select Time Window:
          </label>
          <select
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
            className="p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <option value="last_hour">Last Hour</option>
            <option value="last_6_hours">Last 6 Hours</option>
            <option value="last_24_hours">Last 24 Hours</option>
          </select>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={salesChartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="metric" />
            <YAxis
              tickFormatter={(value) =>
                selectedTime === "last_24_hours" && value > 1000
                  ? `${(value / 1000).toFixed(1)}k`
                  : value
              }
            />
            <Tooltip
              formatter={(value, name) =>
                name === "Total Revenue"
                  ? formatCurrency(value)
                  : value.toLocaleString()
              }
            />
            <Legend />
            <Bar
              dataKey="value"
              fill="#4F46E5"
              barSize={60}
              radius={[5, 5, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </section>

      {/* Correlation Heatmap */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4 text-indigo-800">
          Correlation Heatmap: Accessories Bought Together
        </h2>
        <div className="overflow-x-auto">
          <div className="inline-block">
            {/* Header Row */}
            <div className="grid grid-cols-6 gap-1 text-center font-semibold text-indigo-700 mb-1">
              <div>Device</div>
              {accessoryList.map((acc) => (
                <div key={acc} className="capitalize">
                  {acc}
                </div>
              ))}
            </div>

            {/* Heatmap Grid */}
            {correlationData.map(({ device, ...accs }) => (
              <div
                key={device}
                className="grid grid-cols-6 gap-1 text-center items-center mb-1"
              >
                {/* Device label */}
                <div className="font-semibold bg-indigo-100 rounded px-2 py-1">
                  {device}
                </div>
                {/* Accessory correlation cells */}
                {accessoryList.map((acc) => {
                  const val = accs[acc];
                  const intensity = val / 100;
                  // Use tailwind bg-indigo-500 with opacity or inline rgba color
                  return (
                    <div
                      key={acc}
                      title={`${val}% customers who bought ${device} also bought ${acc}`}
                      className="rounded px-2 py-1 text-white font-semibold cursor-default select-none"
                      style={{
                        backgroundColor: `rgba(79, 70, 229, ${intensity})`,
                        color: intensity > 0.5 ? "white" : "black",
                      }}
                    >
                      {val}%
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Inventory Summary & Ranking */}
      <section>
        <h2 className="text-2xl font-semibold mb-4 text-indigo-800">
          Inventory Summary & Ranking
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {["mobile", "laptop", "tablet"].map((device) => (
            <div
              key={device}
              className="bg-white rounded-lg shadow-lg p-6 cursor-pointer hover:shadow-2xl transition"
            >
              <h3 className="text-xl font-semibold mb-2 capitalize text-indigo-600">
                {device}
              </h3>
              <p>
                Total Inventory:{" "}
                <span className="font-bold">
                  {inventoryData[device].totalInventory}
                </span>
              </p>
              <p>
                Total Sold:{" "}
                <span className="font-bold">
                  {inventoryData[device].totalSold}
                </span>
              </p>
              <p>
                Avg. Discount:{" "}
                <span className="font-bold">
                  {inventoryData[device].avgDiscount.toFixed(2)}%
                </span>
              </p>
              <p>
                Avg. Price:{" "}
                <span className="font-bold">
                  {formatCurrency(inventoryData[device].avgPrice)}
                </span>
              </p>
            </div>
          ))}

          <div className="bg-white rounded-lg shadow-lg p-6 col-span-1 md:col-span-1 cursor-default">
            <h3 className="text-xl font-semibold mb-4 text-indigo-600">
              Inventory Ranking
            </h3>
            <ol className="list-decimal list-inside space-y-2">
              {deviceRankings.map((device) => (
                <li key={device.name} className="text-lg">
                  {device.name}:{" "}
                  <span className="font-bold">{device.inventory}</span> items
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Pie charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4 text-indigo-600 text-center">
              Revenue Distribution by Product
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={revenuePieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#4F46E5"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {revenuePieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={formatCurrency} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4 text-indigo-600 text-center">
              Inventory Distribution by Product
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={inventoryPieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#6366F1"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {inventoryPieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => value.toLocaleString()} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>
    </div>
  );
};

export default OwnerDashboard;
