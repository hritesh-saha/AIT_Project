import React, { useState, useEffect } from "react";
import axios from "axios";
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
  LineChart,
  Line,
} from "recharts";
import OwnerNavbar from "./OwnerNavbar";

const COLORS = [
  "#4F46E5",
  "#6366F1",
  "#818CF8",
  "#A5B4FC",
  "#C7D2FE",
  "#E0E7FF",
];

const OwnerDashboard = () => {
  const [salesData, setSalesData] = useState(null);
  const [inventoryData, setInventoryData] = useState(null);
  const [correlationData, setCorrelationData] = useState([]);
  const [revenuePieData, setRevenuePieData] = useState([]);
  const [selectedTime, setSelectedTime] = useState("last_hour");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [monthlySale, setMonthlySale] = useState(null);
  const [timeRange, setTimeRange] = useState("month");
  const [totalProfit, setTotalProfit] = useState(0);
  const [avgBasketValue, setAvgBasketValue] = useState(0);
  const [topProfitMakers, setTopProfitMakers] = useState([]);
  const [topSellers, setTopSellers] = useState([]);
  const [turnaroundTimes, setTurnaroundTimes] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        const salesRes = await axios.get(
          "https://ait-project-backend.vercel.app/api/sales/analytics/realtime"
        );
        const inventoryRes = await axios.get(
          "https://ait-project-backend.vercel.app/api/inventory/summary"
        );
        const addonRes = await axios.get(
          "https://ait-project-backend.vercel.app/api/inventory/addon"
        );
        const correlationRes = await axios.get(
          "https://ait-project-backend.vercel.app/api/sales/correlation-analytics"
        );
        const revenueRes = await axios.get(
          "https://ait-project-backend.vercel.app/api/sales/analytics/revenue-distribution"
        );
        const MonthlySaleRes = await axios.get(
          "https://ait-project-backend.vercel.app/api/sales"
        );
        const profitRes = await axios.get(
          "https://ait-project-backend.vercel.app/api/sales/analytics/total-profit"
        );
        const basketRes = await axios.get(
          "https://ait-project-backend.vercel.app/api/sales/analytics/avg-basket-value"
        );
        const topProfitRes = await axios.get(
          "https://ait-project-backend.vercel.app/api/sales/analytics/top-profit-makers"
        );
        const topSellersRes = await axios.get(
          "https://ait-project-backend.vercel.app/api/sales/analytics/top-sellers"
        );
        const turnaroundRes = await axios.get(
          "https://ait-project-backend.vercel.app/api/inventory/turnaround-times"
        );

        const catMap = {
          Headphone: "headphone",
          Charger: "charger",
          "Power Bank": "powerbank",
          Mouse: "mouse",
          "Screen Guard": "screenguard",
        };
        const addons = {};
        if (Array.isArray(addonRes.data)) {
          addonRes.data.forEach((item) => {
            const key = catMap[item.category];
            if (key) addons[key] = item;
          });
        }

        const combinedInventory = {
          mobile: inventoryRes.data.mobile,
          laptop: inventoryRes.data.laptop,
          tablet: inventoryRes.data.tablet,
          ...addons,
        };

        // Monthly Sale Filtering
        const now = new Date();
        let filtered = [];

        if (timeRange === "today") {
          const startOfToday = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
          );
          filtered = MonthlySaleRes.data.filter(
            (sale) => new Date(sale.createdAt) >= startOfToday
          );
        } else if (timeRange === "week") {
          const startOfWeek = new Date(now);
          startOfWeek.setDate(now.getDate() - now.getDay());
          filtered = MonthlySaleRes.data.filter(
            (sale) => new Date(sale.createdAt) >= startOfWeek
          );
        } else {
          filtered = MonthlySaleRes.data.filter((sale) => {
            const date = new Date(sale.createdAt);
            return (
              date.getFullYear() === now.getFullYear() &&
              date.getMonth() === now.getMonth()
            );
          });
        }

        const dayMap = {};
        filtered.forEach((sale) => {
          const dateStr = new Date(sale.createdAt).toISOString().split("T")[0];
          dayMap[dateStr] = (dayMap[dateStr] || 0) + (sale.total_price || 0);
        });

        const monthlyFormatted = Object.entries(dayMap)
          .map(([date, revenue]) => ({ month: date, revenue }))
          .sort((a, b) => new Date(a.month) - new Date(b.month));

        setMonthlySale(monthlyFormatted);

        setSalesData(salesRes.data);
        setInventoryData(combinedInventory);
        setCorrelationData(correlationRes.data);
        setRevenuePieData(revenueRes.data);
        setTotalProfit(profitRes.data.total_profit);
        setAvgBasketValue(basketRes.data.avg_basket_value);
        setTopProfitMakers(topProfitRes.data.top || []);
        setTopSellers(topSellersRes.data.top || []);
        setTurnaroundTimes(turnaroundRes.data.turnaround || []);
        //setMonthlySale(monthlyFormatted);
        setError(null);
      } catch (err) {
        setError("Failed to load dashboard data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [timeRange]);

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <div className="w-16 h-16 border-4 border-indigo-500 border-dashed rounded-full animate-spin mb-4"></div>
        <p className="text-lg font-medium text-indigo-700 animate-pulse">
          Loading your dashboard...
        </p>
        <p className="text-sm text-gray-500 mt-1">Please wait a moment</p>
      </div>
    );

  if (error)
    return <div className="text-red-600 text-center mt-20">{error}</div>;

  const sales = salesData || {
    last_hour: { total_sales: 0, total_items_sold: 0, total_revenue: 0 },
    last_6_hours: { total_sales: 0, total_items_sold: 0, total_revenue: 0 },
    last_24_hours: { total_sales: 0, total_items_sold: 0, total_revenue: 0 },
  };

  const inv = inventoryData || {};
  const getSafeInventory = (key) => ({
    totalInventory: inv[key]?.totalInventory || 0,
    totalSold: inv[key]?.totalSold || 0,
    avgDiscount: inv[key]?.avgDiscount || 0,
    avgPrice: inv[key]?.avgPrice || 0,
    revenue: inv[key]?.revenue || 0,
  });

  const inventorySafe = {
    mobile: getSafeInventory("mobile"),
    laptop: getSafeInventory("laptop"),
    tablet: getSafeInventory("tablet"),
    headphone: getSafeInventory("headphone"),
    charger: getSafeInventory("charger"),
    powerbank: getSafeInventory("powerbank"),
    mouse: getSafeInventory("mouse"),
    screenguard: getSafeInventory("screenguard"),
  };

  const salesChartData = [
    { metric: "Total Sales", value: sales[selectedTime].total_sales },
    { metric: "Total Items Sold", value: sales[selectedTime].total_items_sold },
    { metric: "Total Revenue", value: sales[selectedTime].total_revenue },
  ];

  const inventoryPieData = Object.entries(inventorySafe).map(([key, val]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    value: val.totalInventory || 0,
  }));

  const deviceRankings = [
    { name: "Mobile", inventory: inventorySafe.mobile.totalInventory },
    { name: "Laptop", inventory: inventorySafe.laptop.totalInventory },
    { name: "Tablet", inventory: inventorySafe.tablet.totalInventory },
  ].sort((a, b) => b.inventory - a.inventory);

  const accessoryList = ["charger", "earphones", "mouse", "bag", "cover"];

  const formatCurrency = (num) =>
    num.toLocaleString("en-US", { style: "currency", currency: "USD" });

  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-100 to-purple-200 p-8">
      <OwnerNavbar />
      <h1 className="text-4xl font-bold mb-8 mt-6 text-center text-indigo-700">
        Owner Dashboard
      </h1>

      {/* Line Chart for Monthly Sales */}
      <section className="mb-12">
        <div className="flex flex-col justify-center items-center mb-4">
          <h2 className="text-2xl font-semibold text-indigo-800">
            Sales Trend
          </h2>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={monthlySale}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis tickFormatter={(val) => `$${(val / 1000).toFixed(1)}k`} />
            <Tooltip formatter={(value) => formatCurrency(value)} />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#4F46E5"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </section>

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
            <YAxis />
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

      <section className="mb-12">
  <h2 className="text-2xl font-semibold mb-4 text-indigo-800">
    Financial Highlights
  </h2>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-indigo-600">Total Profit</h3>
      <p className="text-2xl mt-2 font-bold text-green-600">
        {formatCurrency(totalProfit)}
      </p>
    </div>
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-indigo-600">
        Avg. Basket Value
      </h3>
      <p className="text-2xl mt-2 font-bold text-blue-600">
        {formatCurrency(avgBasketValue)}
      </p>
    </div>
  </div>
</section>
<section className="mb-12">
  <h2 className="text-2xl font-semibold mb-4 text-indigo-800">
    Top Profit Makers
  </h2>
  <ResponsiveContainer width="100%" height={300}>
    <BarChart
      data={topProfitMakers}
      layout="vertical"
      margin={{ top: 5, right: 20, left: 40, bottom: 5 }}
    >
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis type="number" />
      <YAxis dataKey="name" type="category" width={150} />
      <Tooltip formatter={(val) => formatCurrency(val)} />
      <Bar dataKey="profit" fill="#10B981" />
    </BarChart>
  </ResponsiveContainer>
</section>


<section className="mb-12">
  <h2 className="text-2xl font-semibold mb-6 text-indigo-800 text-center">
    🔥 Top Sellers Leaderboard
  </h2>
  <div className="bg-white shadow-lg rounded-xl overflow-hidden">
    <ul className="divide-y divide-gray-200">
      {topSellers.map((item, index) => (
        <li
          key={item.name}
          className="flex items-center justify-between p-4 hover:bg-indigo-50 transition-all duration-200"
        >
          <div className="flex items-center space-x-4">
            <div className="bg-indigo-100 text-indigo-800 rounded-full h-10 w-10 flex items-center justify-center font-bold text-lg">
              {index + 1}
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-800">
                {item.name}
              </p>
              <p className="text-sm text-gray-500">Bestselling product</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold text-green-600">
              {item.units_sold} 
              <span className="text-sm font-medium text-gray-500 ml-1">
                units
              </span>
            </p>
          </div>
        </li>
      ))}
    </ul>
  </div>
</section>


<section className="mb-12">
  <h2 className="text-3xl font-semibold mb-6 text-center text-indigo-800">
    📦 Inventory Turnaround Times
  </h2>
  <div className="overflow-x-auto shadow-lg rounded-xl bg-white">
    <table className="min-w-full divide-y divide-gray-200 text-sm">
      <thead className="bg-indigo-600 text-white uppercase tracking-wider text-xs">
        <tr>
          <th className="px-6 py-3 text-left">Device</th>
          <th className="px-6 py-3 text-left">Sold Qty</th>
          <th className="px-6 py-3 text-left">Inventory Qty</th>
          <th className="px-6 py-3 text-left">Turnaround Ratio</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {turnaroundTimes.map((item, idx) => (
          <tr
            key={idx}
            className="hover:bg-indigo-50 transition duration-200"
          >
            <td className="px-6 py-4 font-medium text-gray-800">
              {item.name}
            </td>
            <td className="px-6 py-4 text-gray-700">{item.sold_qty}</td>
            <td className="px-6 py-4 text-gray-700">{item.inventory_qty}</td>
            <td
              className={`px-6 py-4 font-semibold ${
                item.turnaround_ratio > 1
                  ? "text-green-600"
                  : item.turnaround_ratio > 0.5
                  ? "text-yellow-600"
                  : "text-red-600"
              }`}
            >
              {item.turnaround_ratio.toFixed(2)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</section>



      {/* Correlation Heatmap */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4 text-indigo-800">
          Correlation Heatmap: Accessories Bought Together
        </h2>
        <div className="overflow-x-auto">
          <div className="inline-block">
            <div className="grid grid-cols-6 gap-1 text-center font-semibold text-indigo-700 mb-1">
              <div>Device</div>
              {accessoryList.map((acc) => (
                <div key={acc} className="capitalize">
                  {acc}
                </div>
              ))}
            </div>

            {correlationData.map(({ device, ...accs }) => (
              <div
                key={device}
                className="grid grid-cols-6 gap-1 text-center items-center mb-1"
              >
                <div className="font-semibold bg-indigo-100 rounded px-2 py-1">
                  {device}
                </div>
                {accessoryList.map((acc) => {
                  const val = accs[acc] ?? 0;
                  const intensity = val / 100;
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
                  {inventorySafe[device].totalInventory}
                </span>
              </p>
              <p>
                Total Sold:{" "}
                <span className="font-bold">
                  {inventorySafe[device].totalSold}
                </span>
              </p>
              <p>
                Avg. Discount:{" "}
                <span className="font-bold">
                  {inventorySafe[device].avgDiscount.toFixed(2)}%
                </span>
              </p>
              <p>
                Avg. Price:{" "}
                <span className="font-bold">
                  {formatCurrency(inventorySafe[device].avgPrice)}
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

        {/* Pie Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4 text-indigo-600 text-center">
              Revenue Distribution by Product
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={revenuePieData.filter((entry) => entry.value > 0)}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#4F46E5"
                  labelLine={false}
                  isAnimationActive={true}
                >
                  {revenuePieData
                    .filter((entry) => entry.value > 0)
                    .map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                </Pie>
                <Tooltip
                  formatter={(value, name, props) => [
                    formatCurrency(value),
                    revenuePieData[props.payload.index]?.name,
                  ]}
                />
                <Legend
                  layout="vertical"
                  align="right"
                  verticalAlign="middle"
                />
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
                  data={inventoryPieData.filter((entry) => entry.value > 0)}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#6366F1"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {inventoryPieData
                    .filter((entry) => entry.value > 0)
                    .map((entry, index) => (
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
