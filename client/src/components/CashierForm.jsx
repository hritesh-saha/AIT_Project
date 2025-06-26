import React, { useEffect, useState } from "react";
import axios from "axios";  // uncomment axios import

const paymentMethods = ["Cash", "Card", "UPI", "Other"];

const CashierForm = () => {
  const [devices, setDevices] = useState([]);
  const [loadingDevices, setLoadingDevices] = useState(true);
  const [error, setError] = useState(null);

  const [selectedItems, setSelectedItems] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState(paymentMethods[0]);
  const [location, setLocation] = useState("");

  const [submitMessage, setSubmitMessage] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        setLoadingDevices(true);
        const response = await axios.get("http://localhost:5000/api/devices"); // Fetch real devices from backend
        setDevices(response.data);
      } catch (err) {
        setError("Failed to fetch devices");
      } finally {
        setLoadingDevices(false);
      }
    };
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
    // Send sale data to backend
    const payload = {
      items: selectedItems.map(item => ({
        uid: item.uid,
        quantity_sold: item.quantity_sold,
        device_type: devices.find(d => d.uid === item.uid)?.device_type || ""
      })),
      payment_method: paymentMethod,
      location,
    };

    const response = await axios.post("http://localhost:5000/api/sales", payload);
    setSubmitMessage({ type: "success", text: response.data.message });

    setSelectedItems([]);
    setPaymentMethod(paymentMethods[0]);
    setLocation("");
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

  if (loadingDevices) {
    return <p className="text-center p-6">Loading devices...</p>;
  }

  if (error) {
    return <p className="text-center text-red-600 p-6">{error}</p>;
  }

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white shadow rounded-xl">
      <h1 className="text-3xl font-bold text-indigo-700 mb-6">Cashier Sales Form</h1>

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
              {devices.map(({ uid, name, device_type, inventory_qty, final_price }) => {
                const selectedItem = selectedItems.find((item) => item.uid === uid);
                const quantity = selectedItem ? selectedItem.quantity_sold : 0;

                return (
                  <tr key={uid} className="hover:bg-indigo-50 transition">
                    <td className="px-4 py-3 font-medium">{name}</td>
                    <td className="px-4 py-3 capitalize">{device_type}</td>
                    <td className="px-4 py-3">{formatPrice(final_price)}</td>
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
              })}
            </tbody>
          </table>
        </div>

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
