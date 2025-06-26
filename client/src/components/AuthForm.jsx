import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AuthForm = () => {
  const [form, setForm] = useState({
    username: "",
    password: "",
    role: "cashier", // default role selected
  });

  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Send role along with credentials
      const { data } = await axios.post("https://ait-project-backend.vercel.app/api/users/login", form);

      setMessage(data.message);
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", form.role); // 🔒 Save role for access control

      // Navigate based on role
      switch (form.role) {
        case "owner":
          navigate("/owner-dashboard");
          break;
        case "cashier":
          navigate("/cashier-form");
          break;
        default:
          setMessage("Unknown role");
      }
    } catch (err) {
      setMessage(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gradient-to-r from-indigo-200 to-purple-300">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-xl rounded-xl p-8 w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-indigo-700">
          Login
        </h2>

        <label className="block mb-2 text-gray-700">Username</label>
        <input
          name="username"
          value={form.username}
          onChange={handleChange}
          required
          className="w-full p-2 mb-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400"
        />

        <label className="block mb-2 text-gray-700">Password</label>
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          required
          className="w-full p-2 mb-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400"
        />

        <label className="block mb-2 text-gray-700">Role</label>
        <select
          name="role"
          value={form.role}
          onChange={handleChange}
          className="w-full p-2 mb-6 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 cursor-pointer"
        >
          <option value="cashier">Cashier</option>
          <option value="owner">Owner</option>
        </select>

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition cursor-pointer"
        >
          Login
        </button>

        {message && (
          <p className="mt-4 text-center text-sm text-red-600">{message}</p>
        )}
      </form>
    </div>
  );
};

export default AuthForm;
