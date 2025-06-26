import React from "react";
import { Link, useLocation } from "react-router-dom";

const OwnerNavbar = () => {
  const location = useLocation();

  const navItems = [
    { label: "Dashboard", path: "/owner-dashboard" },
    { label: "Device Manager", path: "/owner-device-manager" },
    { label: "Cashier Manager", path: "/owner-cashier-manager" },
  ];

  return (
    <nav className="bg-indigo-700 text-white px-6 py-4 shadow-md rounded-lg mx-4 my-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">📊 Owner Panel</h1>

        <ul className="flex space-x-6">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`hover:text-indigo-200 font-medium transition-all duration-200 ${
                  location.pathname === item.path ? "underline underline-offset-4" : ""
                }`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default OwnerNavbar;
