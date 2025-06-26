import React, { useState, useEffect } from "react";
import axios from "axios";
import OwnerNavbar from "./OwnerNavbar";

const OwnerCashierManager = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
  });

  const [editFormData, setEditFormData] = useState({
    username: "",
    password: "",
    role: "cashier",
  });

  const [editingUsername, setEditingUsername] = useState(null);
  const [cashiers, setCashiers] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchCashiers();
  }, []);

  const fetchCashiers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/users?role=cashier");
      setCashiers(res.data);
    } catch (err) {
      console.error("Failed to fetch cashiers", err);
    }
  };

  const handleAddCashier = async (e) => {
    e.preventDefault();
    const { username, password, confirmPassword } = formData;

    if (password !== confirmPassword) {
      return setMessage("❌ Passwords do not match");
    }

    try {
      const res = await axios.post("http://localhost:5000/api/users/signup", {
        username,
        password,
        role: "cashier",
      });
      setMessage(res.data.message || "✅ Cashier added");
      setFormData({ username: "", password: "", confirmPassword: "" });
      fetchCashiers();
    } catch (err) {
      setMessage(err.response?.data?.message || "❌ Error adding cashier");
    }
  };

  const handleDeleteCashier = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/users/${id}`);
      setMessage("🗑️ Cashier deleted");
      fetchCashiers();
    } catch (err) {
      setMessage("❌ Error deleting cashier");
      console.error(err);
    }
  };

  const handleStartEdit = (user) => {
    setEditingUsername(user.username);
    setEditFormData({ username: user.username, password: "", role: user.role });
  };

  const handleUpdateCashier = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.patch(`http://localhost:5000/api/users/${editingUsername}`, {
        password: editFormData.password,
        role: editFormData.role,
      });

      setMessage(res.data.message || "✅ Cashier updated");
      setEditingUsername(null);
      setEditFormData({ username: "", password: "", role: "cashier" });
      fetchCashiers();
    } catch (err) {
      setMessage(err.response?.data?.message || "❌ Error updating cashier");
    }
  };

  return (
    <div className="max-w-full mx-auto p-6">
      <OwnerNavbar/>
      <h2 className="text-3xl font-bold mb-6 text-center">🧑‍💼 Cashier Management</h2>

      {message && (
        <p className="mb-4 text-center text-blue-700 font-semibold bg-blue-50 py-2 rounded shadow">
          {message}
        </p>
      )}

      {/* Add Cashier Form */}
      <form
        onSubmit={handleAddCashier}
        className="bg-white shadow-md p-6 rounded-lg mb-8"
      >
        <h3 className="text-xl font-semibold mb-4">➕ Add New Cashier</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Username"
            className="border p-2 rounded-md shadow-sm"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="border p-2 rounded-md shadow-sm"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="Confirm Password"
            className="border p-2 rounded-md shadow-sm"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            required
          />
        </div>
        <button
          type="submit"
          className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg shadow-md transition-all duration-200"
        >
          Add Cashier
        </button>
      </form>

      {/* Edit Cashier */}
      {editingUsername && (
        <form
          onSubmit={handleUpdateCashier}
          className="bg-yellow-50 shadow-md p-6 rounded-lg mb-8"
        >
          <h3 className="text-xl font-semibold mb-4">✏️ Edit Cashier: {editingUsername}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="password"
              placeholder="New Password (optional)"
              className="border p-2 rounded-md shadow-sm"
              value={editFormData.password}
              onChange={(e) =>
                setEditFormData({ ...editFormData, password: e.target.value })
              }
            />
            <select
              className="border p-2 rounded-md shadow-sm"
              value={editFormData.role}
              onChange={(e) =>
                setEditFormData({ ...editFormData, role: e.target.value })
              }
            >
              <option value="cashier">Cashier</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="mt-4 space-x-3">
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg shadow-md transition-all duration-200"
            >
              💾 Save
            </button>
            <button
              type="button"
              className="bg-gray-500 hover:bg-gray-600 text-white px-5 py-2 rounded-lg shadow-md transition-all duration-200"
              onClick={() => setEditingUsername(null)}
            >
              ❌ Cancel
            </button>
          </div>
        </form>
      )}

      {/* Cashier Table */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4">📋 Cashier List</h3>
        <table className="w-full text-sm text-center border-collapse">
          <thead className="bg-indigo-100">
            <tr>
              <th className="border px-4 py-2">Username</th>
              <th className="border px-4 py-2">Role</th>
              <th className="border px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {cashiers.length > 0 ? (
              cashiers.map((user) => (
                <tr key={user._id} className="border-t">
                  <td className="border px-4 py-2">{user.username}</td>
                  <td className="border px-4 py-2 capitalize">{user.role}</td>
                  <td className="border px-4 py-2 space-x-2">
                    <button
                      onClick={() => handleStartEdit(user)}
                      className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-4 py-1 rounded-lg shadow-md transition-all duration-200"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDeleteCashier(user._id)}
                      className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-1 rounded-lg shadow-md transition-all duration-200"
                    >
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="py-4 text-gray-500">
                  No cashiers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OwnerCashierManager;
