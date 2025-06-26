import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { BrowserRouter as Router, Routes, Route, Link} from "react-router-dom";
import AuthForm from './components/AuthForm';
import OwnerDashboard from './components/OwnerDashboard';
import CashierForm from './components/CashierForm';
import OwnerDeviceManager from './components/OwnerDeviceManager';
import OwnerCashierManager from './components/OwnerCashierManager';
import SalesTrendChart from './components/SalesTrendChart';
import ProtectedRoute from './ProtectedRoutes';
function App() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <Router>
      <Routes>
        <Route path='/' element={<AuthForm />} />

        {/* Owner Routes */}
        <Route
          path='/owner-dashboard'
          element={
            <ProtectedRoute requiredRole="owner">
              <OwnerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path='/owner-device-manager'
          element={
            <ProtectedRoute requiredRole="owner">
              <OwnerDeviceManager />
            </ProtectedRoute>
          }
        />
        <Route
          path='/owner-cashier-manager'
          element={
            <ProtectedRoute requiredRole="owner">
              <OwnerCashierManager />
            </ProtectedRoute>
          }
        />
        <Route
          path='/owner-regression'
          element={
            <ProtectedRoute requiredRole="owner">
              <SalesTrendChart />
            </ProtectedRoute>
          }
        />

        {/* Cashier Route */}
        <Route
          path='/cashier-form'
          element={
            <ProtectedRoute requiredRole="cashier">
              <CashierForm />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
    </div>
  )
}

export default App
