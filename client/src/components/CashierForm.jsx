import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // ✅ Navigation hook

const paymentMethods = ["Cash", "Card", "UPI", "Other"];

const CashierForm = () => {
  const navigate = useNavigate();
  const [devices, setDevices] = useState([]);
  const [loadingDevices, setLoadingDevices] = useState(true);
  const [error, setError] = useState(null);

  const [selectedItems, setSelectedItems] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState(paymentMethods[0]);
  const [location, setLocation] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [submitMessage, setSubmitMessage] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchDevices = async () => {
    try {
      setLoadingDevices(true);
      const response = await axios.get("https://ait-project-backend.vercel.app/api/devices");
      setDevices(response.data);
    } catch (err) {
      setError("Failed to fetch devices");
    } finally {
      setLoadingDevices(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const handleQuantityChange = (uid, quantity) => {
    if (quantity < 0) return;
    setSelectedItems((prev) => {
      const exists = prev.find((item) => item.uid === uid);
      if (exists) {
        if (quantity === 0) {
          return prev.filter((item) => item.uid !== uid);
        } else {
          return prev.map((item) =>
            item.uid === uid ? { ...item, quantity_sold: quantity } : item
          );
        }
      } else {
        if (quantity > 0) {
          return [...prev, { uid, quantity_sold: quantity }];
        }
      }
      return prev;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedItems.length === 0) {
      setSubmitMessage({ type: "error", text: "Select at least one item" });
      return;
    }

    setSubmitting(true);
    setSubmitMessage(null);

    try {
      const payload = {
        items: selectedItems.map((item) => ({
          uid: item.uid,
          quantity_sold: item.quantity_sold,
          device_type: devices.find((d) => d.uid === item.uid)?.device_type || "",
        })),
        payment_method: paymentMethod,
        location,
      };

      const response = await axios.post("https://ait-project-backend.vercel.app/api/sales", payload);
      setSubmitMessage({ type: "success", text: response.data.message });

      setSelectedItems([]);
      setPaymentMethod(paymentMethods[0]);
      setLocation("");

      await fetchDevices();
    } catch (err) {
      setSubmitMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to record sale",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(price);

  const filtered = searchTerm
    ? devices.filter((d) => d.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : [];

  const remaining = searchTerm
    ? devices.filter((d) => !filtered.includes(d))
    : devices;

  if (loadingDevices) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <div className="w-16 h-16 border-4 border-indigo-500 border-dashed rounded-full animate-spin mb-4"></div>
        <p className="text-lg font-medium text-indigo-700 animate-pulse">
          Loading devices...
        </p>
        <p className="text-sm text-gray-500 mt-1">Please wait a moment</p>
      </div>
    );
  }

  if (error) {
    return <p className="text-center text-red-600 p-6">{error}</p>;
  }

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white shadow rounded-xl relative">
      {/* Sign Out Button */}
      <button
        className="absolute top-4 right-4 flex items-center gap-2 text-sm bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-full shadow-md transition-all"
        onClick={() => navigate("/")}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1m0-10v1"
          />
        </svg>
        Sign Out
      </button>

      <h1 className="text-3xl font-bold text-indigo-700 mb-6">Cashier Sales Form</h1>

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search devices..."
        className="w-full mb-4 p-2 border rounded-md focus:ring focus:ring-indigo-300"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <form onSubmit={handleSubmit}>
        <div className="overflow-x-auto mb-6 rounded-lg border border-gray-200 shadow-sm">
          <table className="min-w-full text-sm text-center">
            <thead className="bg-indigo-600 text-white">
              <tr>
                <th className="px-4 py-3">Device Name</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Qty Sold</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {[...filtered, ...remaining].map(
                ({ uid, name, device_type, inventory_qty, final_price, price }) => {
                  const selectedItem = selectedItems.find((item) => item.uid === uid);
                  const quantity = selectedItem ? selectedItem.quantity_sold : 0;

                  return (
                    <tr key={uid} className="hover:bg-indigo-50 transition">
                      <td className="px-4 py-3 font-medium">{name}</td>
                      <td className="px-4 py-3 capitalize">{device_type}</td>
                      <td className="px-4 py-3">
                        {formatPrice(final_price ?? price)}
                      </td>
                      <td className="px-4 py-3">{inventory_qty}</td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min={0}
                          max={inventory_qty}
                          value={quantity}
                          onChange={(e) =>
                            handleQuantityChange(
                              uid,
                              Math.min(inventory_qty, Number(e.target.value))
                            )
                          }
                          className="w-20 p-1 border border-gray-300 rounded text-center"
                        />
                      </td>
                    </tr>
                  );
                }
              )}
            </tbody>
          </table>
        </div>

        {/* Payment & Location */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Payment Method
          </label>
          <select
            className="w-full p-2 border rounded focus:ring focus:ring-indigo-200"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
          >
            {paymentMethods.map((method) => (
              <option key={method} value={method}>
                {method}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Location <span className="text-gray-400">(optional)</span>
          </label>
          <input
            type="text"
            className="w-full p-2 border rounded focus:ring focus:ring-indigo-200"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Store location or note"
          />
        </div>

        {submitMessage && (
          <div
            className={`mb-4 text-sm font-medium ${
              submitMessage.type === "error" ? "text-red-600" : "text-green-600"
            }`}
          >
            {submitMessage.text}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
        >
          {submitting ? "Processing..." : "Record Sale"}
        </button>
      </form>
    </div>
  );
};

export default CashierForm;
