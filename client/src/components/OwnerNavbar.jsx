import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";

const OwnerNavbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { label: "Dashboard", path: "/owner-dashboard" },
    { label: "Device Manager", path: "/owner-device-manager" },
    { label: "Cashier Manager", path: "/owner-cashier-manager" },
    { label: "Regression Model", path: "/owner-regression" },
  ];

  const toggleMenu = () => setMenuOpen((prev) => !prev);

  return (
    <nav className="bg-indigo-700 text-white px-6 py-4 shadow-md rounded-lg mx-4 my-4">
      <div className="flex justify-between items-center">
        {/* Logo */}
        <h1 className="text-xl sm:text-2xl font-bold">📊 Owner Panel</h1>

        {/* Desktop Navigation */}
        <ul className="hidden md:flex space-x-6 items-center">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`hover:text-indigo-200 font-medium transition-all duration-200 ${
                  location.pathname === item.path
                    ? "underline underline-offset-4"
                    : ""
                }`}
              >
                {item.label}
              </Link>
            </li>
          ))}
          <li>
            <button
              onClick={() => navigate("/")}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full text-sm shadow transition cursor-pointer"
            >
              Sign Out
            </button>
          </li>
        </ul>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button onClick={toggleMenu}>
            {menuOpen ? (
              <X size={28} className="text-white" />
            ) : (
              <Menu size={28} className="text-white" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div className="md:hidden mt-4 flex flex-col space-y-3 border-t pt-4 border-indigo-500">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMenuOpen(false)}
              className={`block text-sm font-medium hover:text-indigo-200 ${
                location.pathname === item.path
                  ? "underline underline-offset-4"
                  : ""
              }`}
            >
              {item.label}
            </Link>
          ))}
          <button
            onClick={() => {
              setMenuOpen(false);
              navigate("/login");
            }}
            className="mt-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm transition"
          >
            Sign Out
          </button>
        </div>
      )}
    </nav>
  );
};

export default OwnerNavbar;
