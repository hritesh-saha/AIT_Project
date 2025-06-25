import React, { useState, useEffect } from "react";

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

  const fetchDevices = () => {
    // Simulate fetching dummy data
    const dummyDevices = [
      {
        uid: "DEV001",
        name: "Galaxy A12",
        manufacturer: "Samsung",
        device_type: "mobile",
        final_price: 12999,
        inventory_qty: 12,
        date: "2025-06-25",
        time: "12:34:56",
      },
      {
        uid: "DEV002",
        name: "MacBook Air",
        manufacturer: "Apple",
        device_type: "laptop",
        final_price: 99999,
        inventory_qty: 5,
        date: "2025-06-24",
        time: "10:20:30",
      },
    ];
    setDevices(dummyDevices);
  };

  const handleAddDevice = (e) => {
    e.preventDefault();

    const newDevice = {
      uid: "DEV" + String(devices.length + 1).padStart(3, "0"),
      ...formData,
      date: new Date().toISOString().split("T")[0],
      time: new Date().toTimeString().split(" ")[0],
    };

    setDevices([...devices, newDevice]);
    setMessage("Device added (dummy)");
  };

  const handleStockUpdate = (e) => {
    e.preventDefault();

    const index = devices.findIndex((d) => d.uid === actionUid);
    if (index === -1) {
      setMessage("UID not found");
      return;
    }

    const updatedDevices = [...devices];
    const device = updatedDevices[index];

    if (
      stockUpdate.action === "subtract" &&
      device.inventory_qty < stockUpdate.quantity
    ) {
      setMessage("Insufficient stock to subtract");
      return;
    }

    device.inventory_qty =
      stockUpdate.action === "add"
        ? device.inventory_qty + stockUpdate.quantity
        : device.inventory_qty - stockUpdate.quantity;

    device.date = new Date().toISOString().split("T")[0];
    device.time = new Date().toTimeString().split(" ")[0];

    setDevices(updatedDevices);
    setMessage(`Stock ${stockUpdate.action}ed (dummy)`);
  };

  const handleDeleteDevice = (uid) => {
    const filtered = devices.filter((d) => d.uid !== uid);
    setDevices(filtered);
    setMessage("Device deleted (dummy)");
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Owner Device Management</h2>

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
              className="p-2 border rounded w-full"
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
              className="p-2 border rounded w-full"
              value={formData.inventory_qty}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  inventory_qty: parseInt(e.target.value),
                })
              }
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Price (₹)</label>
            <input
              type="number"
              className="p-2 border rounded w-full"
              value={formData.final_price}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  final_price: parseFloat(e.target.value),
                })
              }
              required
            />
          </div>
        </div>

        <button
          type="submit"
          className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded"
        >
          Add Device
        </button>
      </form>

      <form
        onSubmit={handleStockUpdate}
        className="bg-white shadow p-4 rounded mb-6"
      >
        <h3 className="text-xl font-semibold mb-2">Update Stock</h3>
        <div className="flex gap-4 flex-wrap">
          <div>
            <label className="block mb-1 text-sm font-medium">Device UID</label>
            <input
              type="text"
              className="p-2 border rounded w-full"
              value={actionUid}
              onChange={(e) => setActionUid(e.target.value)}
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Action</label>
            <select
              value={stockUpdate.action}
              onChange={(e) =>
                setStockUpdate({ ...stockUpdate, action: e.target.value })
              }
              className="p-2 border rounded w-full"
            >
              <option value="add">Add</option>
              <option value="subtract">Subtract</option>
            </select>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Quantity</label>
            <input
              type="number"
              className="p-2 border rounded w-full"
              value={stockUpdate.quantity}
              onChange={(e) =>
                setStockUpdate({
                  ...stockUpdate,
                  quantity: parseInt(e.target.value),
                })
              }
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              Update Stock
            </button>
          </div>
        </div>
      </form>

      <div className="bg-white shadow rounded p-4">
        <h3 className="text-xl font-semibold mb-4">Device List</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-center">
            <thead className="bg-indigo-100">
              <tr>
                <th className="px-2 py-1">UID</th>
                <th>Name</th>
                <th>Manufacturer</th>
                <th>Type</th>
                <th>Price</th>
                <th>Qty</th>
                <th>Date</th>
                <th>Time</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {devices.map((dev) => (
                <tr key={dev.uid} className="border-t">
                  <td>{dev.uid}</td>
                  <td>{dev.name}</td>
                  <td>{dev.manufacturer}</td>
                  <td>{dev.device_type}</td>
                  <td>₹{dev.final_price.toFixed(2)}</td>
                  <td>{dev.inventory_qty}</td>
                  <td>{dev.date}</td>
                  <td>{dev.time}</td>
                  <td>
                    <button
                      onClick={() => handleDeleteDevice(dev.uid)}
                      className="bg-red-500 text-white px-3 py-1 rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {devices.length === 0 && (
                <tr>
                  <td colSpan="9" className="py-4 text-gray-500">
                    No devices found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OwnerDeviceManager;
