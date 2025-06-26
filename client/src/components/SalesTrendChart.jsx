import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import OwnerNavbar from "./OwnerNavbar";

const SalesTrendChart = ({ horizon = 7, title = "📈 Sales Forecast" }) => {
  const [rawSales, setRawSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [metric, setMetric] = useState("quantity");

  useEffect(() => {
    const fetchSales = async () => {
      try {
        setLoading(true);
        const res = await axios.get("https://ait-project-backend.vercel.app/api/sales");
        setRawSales(res.data);
        setError(null);
      } catch (err) {
        setError("Failed to load sales data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSales();
  }, []);

  const aggregatedData = useMemo(() => {
    if (!rawSales.length) return [];

    const salesByDay = {};

    rawSales.forEach((sale) => {
      const dateStr = sale.date || new Date(sale.createdAt).toISOString().split("T")[0];
      let value = 0;

      if (metric === "quantity") {
        value = sale.items.reduce((sum, item) => sum + (item.quantity_sold || 0), 0);
      } else {
        value = sale.items.reduce((sum, item) => sum + (item.total_price || 0), 0);
        if (value === 0 && sale.total_price) value = sale.total_price;
      }

      salesByDay[dateStr] = (salesByDay[dateStr] || 0) + value;
    });

    return Object.entries(salesByDay).map(([date, value]) => ({
      time: date,
      value,
    }));
  }, [rawSales, metric]);

  const processedData = useMemo(() => {
    if (!aggregatedData.length) return [];

    const rows = [...aggregatedData].sort((a, b) => new Date(a.time) - new Date(b.time));
    const t0 = new Date(rows[0].time).getTime();
    const x = rows.map((r) => (new Date(r.time).getTime() - t0) / 86400000);
    const y = rows.map((r) => r.value);

    if (x.length < 2) {
      return rows.map(({ time, value }) => ({
        date: time,
        actual: value,
        predicted: null,
      }));
    }

    const mean = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;
    const x̄ = mean(x), ȳ = mean(y);
    let cov = 0, varX = 0;
    for (let i = 0; i < x.length; i++) {
      const dx = x[i] - x̄;
      cov += dx * (y[i] - ȳ);
      varX += dx * dx;
    }

    const slope = cov / varX;
    const intercept = ȳ - slope * x̄;
    const predict = (xVal) => slope * xVal + intercept;

    const actualPredictedData = x.map((val, i) => ({
      date: new Date(t0 + val * 86400000).toISOString().split("T")[0],
      actual: y[i],
      predicted: predict(val),
    }));

    const xFuture = Array.from({ length: horizon }, (_, i) => x[x.length - 1] + i + 1);
    const futureData = xFuture.map((val) => ({
      date: new Date(t0 + val * 86400000).toISOString().split("T")[0],
      actual: null,
      predicted: predict(val),
    }));

    return [...actualPredictedData, ...futureData];
  }, [aggregatedData, horizon]);

  if (loading) return <div className="text-white">📊 Loading chart data...</div>;
  if (error) return <div className="text-red-500 font-semibold">{error}</div>;

  return (
    <div>
      <OwnerNavbar/>
      <div
      className="backdrop-blur-md bg-white/10 rounded-2xl p-6 shadow-lg"
      style={{
        width: "100%",
        height: "480px",
        background:
          "linear-gradient(135deg, rgba(31,41,55,0.9), rgba(55,65,81,0.85))",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <h3 className="text-white font-bold text-xl text-center mb-4 tracking-wide">{title}</h3>

      {/* Metric Selector */}
      <div className="mb-4 text-center">
        <label htmlFor="metric-select" className="mr-3 text-white font-medium">
          📌 Select Metric:
        </label>
        <select
          id="metric-select"
          value={metric}
          onChange={(e) => setMetric(e.target.value)}
          className="bg-white text-gray-800 font-medium px-3 py-1 rounded-md shadow focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
        >
          <option value="quantity">🛒 Quantity Sold</option>
          <option value="revenue">💰 Revenue (USD)</option>
        </select>
      </div>

      <ResponsiveContainer width="100%" height="85%">
        <LineChart data={processedData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#555" />
          <XAxis dataKey="date" stroke="#ccc" />
          <YAxis
            stroke="#ccc"
            tickFormatter={(value) =>
              metric === "revenue"
                ? `$${value.toLocaleString()}`
                : value.toLocaleString()
            }
          />
          <Tooltip
            contentStyle={{ backgroundColor: "#111", borderRadius: "8px", border: "none" }}
            labelStyle={{ color: "#ccc" }}
            formatter={(value) =>
              metric === "revenue" ? `$${value.toFixed(2)}` : value.toLocaleString()
            }
          />
          <Legend verticalAlign="top" iconType="circle" height={36} />
          <Line
            type="monotone"
            dataKey="actual"
            stroke="#60A5FA"
            strokeWidth={2.5}
            dot={{ r: 4 }}
            name="Actual"
          />
          <Line
            type="monotone"
            dataKey="predicted"
            stroke="#22C55E"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
            name="Predicted"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
    </div>
  );
};

export default SalesTrendChart;
