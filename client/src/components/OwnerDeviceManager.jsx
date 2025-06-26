import React, { useState, useEffect } from "react";
import axios from "axios";
import OwnerNavbar from "./OwnerNavbar";

const deviceTypes = ["mobile", "laptop", "tablet"];

const OwnerDeviceManager = () => {
  const [formData, setFormData] = useState({
    device_type: "mobile",
    name: "",
    manufacturer: "",
    inventory_qty: 0,
    final_price: 0,
  });

  const [devices, setDevices] = useState([]);
  const [actionUid, setActionUid] = useState("");
  const [stockUpdate, setStockUpdate] = useState({
    quantity: 1,
    action: "add",
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/devices");
      setDevices(res.data);
      setMessage("");
    } catch (err) {
      setMessage("Failed to fetch devices");
      console.error(err);
    }
  };

  const handleAddDevice = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://localhost:5000/api/devices",
        formData
      );
      setMessage(res.data.message || "Device added successfully");
      setFormData({
        device_type: "mobile",
        name: "",
        manufacturer: "",
        inventory_qty: 0,
        final_price: 0,
      });
      fetchDevices();
    } catch (err) {
      setMessage("Failed to add device");
      console.error(err);
    }
  };

  const handleStockUpdate = async (e) => {
    e.preventDefault();

    if (!actionUid) {
      setMessage("Please enter Device UID");
      return;
    }

    try {
      const res = await axios.patch(
        `http://localhost:5000/api/devices/${actionUid}/stock`,
        stockUpdate
      );
      setMessage(res.data.message || "Stock updated successfully");
      setActionUid("");
      setStockUpdate({ quantity: 1, action: "add" });
      fetchDevices();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to update stock");
      console.error(err);
    }
  };

  const handleDeleteDevice = async (uid) => {
    if (!window.confirm("Are you sure you want to delete this device?")) return;

    try {
      const res = await axios.delete(
        `http://localhost:5000/api/devices/${uid}`
      );
      setMessage(res.data.message || "Device deleted successfully");
      fetchDevices();
    } catch (err) {
      setMessage("Failed to delete device");
      console.error(err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <OwnerNavbar />
      <h2 className="text-2xl font-bold mb-4 mt-6">Owner Device Management</h2>

      {message && <p className="mb-4 text-blue-700 font-semibold">{message}</p>}

      <form
        onSubmit={handleAddDevice}
        className="bg-white shadow p-4 rounded mb-6"
      >
        <h3 className="text-xl font-semibold mb-2">Add New Device</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 text-sm font-medium">
              Device Type
            </label>
            <select
              value={formData.device_type}
              onChange={(e) =>
                setFormData({ ...formData, device_type: e.target.value })
              }
              className="p-2 border rounded w-full cursor-pointer"
            >
              {deviceTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">
              Device Name
            </label>
            <input
              type="text"
              className="p-2 border rounded w-full"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">
              Manufacturer
            </label>
            <input
              type="text"
              className="p-2 border rounded w-full"
              value={formData.manufacturer}
              onChange={(e) =>
                setFormData({ ...formData, manufacturer: e.target.value })
              }
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Quantity</label>
            <input
              type="number"
              min="0"
              className="p-2 border rounded w-full"
              value={formData.inventory_qty}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  inventory_qty: parseInt(e.target.value, 10) || 0,
                })
              }
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Price (₹)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              className="p-2 border rounded w-full"
              value={formData.final_price}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  final_price: parseFloat(e.target.value) || 0,
                })
              }
              required
            />
          </div>
        </div>

        <button
          type="submit"
          className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded cursor-pointer"
        >
          Add Device
        </button>
      </form>

      <form
        onSubmit={handleStockUpdate}
        className="bg-white shadow p-4 rounded mb-6"
      >
        <h3 className="text-xl font-semibold pb-2">Update Stock</h3>
        <div className="flex gap-4 flex-wrap">
          <div>
            <label className="block mb-1 text-sm font-medium">Device UID</label>
            <input
              type="text"
              className="p-2 border rounded w-full"
              value={actionUid}
              onChange={(e) => setActionUid(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Action</label>
            <select
              value={stockUpdate.action}
              onChange={(e) =>
                setStockUpdate({ ...stockUpdate, action: e.target.value })
              }
              className="p-2 border rounded w-full cursor-pointer"
            >
              <option value="add">Add</option>
              <option value="subtract">Subtract</option>
            </select>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Quantity</label>
            <input
              type="number"
              min="1"
              className="p-2 border rounded w-full"
              value={stockUpdate.quantity}
              onChange={(e) =>
                setStockUpdate({
                  ...stockUpdate,
                  quantity: parseInt(e.target.value, 10) || 1,
                })
              }
              required
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded cursor-pointer"
            >
              Update Stock
            </button>
          </div>
        </div>
      </form>

      <div className="bg-white shadow rounded p-4">
        <h3 className="text-xl font-semibold mb-4">Device List</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-indigo-100">
              <tr>
                <th className="px-4 py-2">UID</th>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Manufacturer</th>
                <th className="px-4 py-2">Type</th>
                <th className="px-4 py-2">Price</th>
                <th className="px-4 py-2">Qty</th>
                <th className="px-8 py-2">Date</th>
                <th className="px-4 py-2">Time</th>
                <th className="px-4 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {devices.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-4 text-center text-gray-500">
                    No devices found.
                  </td>
                </tr>
              ) : (
                devices.map((dev) => (
                  <tr key={dev.uid} className="border-t">
                    <td className="px-4 py-2 flex items-center gap-2">
                      <span>{dev.uid}</span>
                      <button
                        title="Use this UID to update stock"
                        onClick={() => setActionUid(dev.uid)}
                        className="text-indigo-600 hover:text-indigo-900 focus:outline-none cursor-pointer"
                      >
                        📋
                      </button>
                    </td>
                    <td className="px-4 py-2">{dev.name}</td>
                    <td className="px-4 py-2">{dev.manufacturer}</td>
                    <td className="px-4 py-2">{dev.device_type}</td>
                    <td className="px-4 py-2">
                      ₹{parseFloat(dev.final_price).toFixed(2)}
                    </td>
                    <td className="px-4 py-2">{dev.inventory_qty}</td>
                    <td className="px-2 py-2">
                      {dev.date?.split("T")[0] || dev.date}
                    </td>
                    <td className="px-4 py-2">{dev.time || "—"}</td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => handleDeleteDevice(dev.uid)}
                        className="bg-red-500 text-white px-3 py-1 rounded"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OwnerDeviceManager;
