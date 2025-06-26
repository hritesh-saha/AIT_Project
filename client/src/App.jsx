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
function App() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <Router>
        <Routes>
          <Route path='/' exact element={<AuthForm/>}/>
          <Route path="/owner-dashboard" exact element={<OwnerDashboard/>}/>
          <Route path='/cashier-form' exact element={<CashierForm/>}/>
          <Route path="/owner-device-manager" exact element={<OwnerDeviceManager/>}/>
          <Route path='/owner-cashier-manager' exact element={<OwnerCashierManager/>}/>
        </Routes>
      </Router>
    </div>
  )
}

export default App
