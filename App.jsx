import { useState } from 'react';
import './App.css';
import { Routes, Route, NavLink } from 'react-router-dom';

import Sales from './pages/Sales';
import SalesAgents from './pages/SalesAgents';
import Agents from './pages/Agents';
import MonthlyRecord from './pages/MonthlyRecord';
import RawMaterials from './pages/RawMaterials';
import Reports from './pages/Reports';
import PrivateRoute from './PrivateRoute';
import Login from './pages/Login'; // also import login
import { useLocation } from "react-router-dom";
import dayjs from 'dayjs';




function App() {
  const location = useLocation(); // ✅ Required to detect current route
  const isLoginPage = location.pathname === "/login";
const isSalesAgentPage = location.pathname === "/sales-agents";
const isSalesPage = location.pathname === "/sales";
const isAgentsPage = location.pathname === "/agents";
const isRawMaterialPage = location.pathname === "/raw-materials";



  const [selectedRange, setSelectedRange] = useState('today');
  function getFilterLabel(range) {
  switch (range) {
    case 'today':
      return 'Today';
    case 'yesterday':
      return 'Yesterday';
    case 'last7':
      return 'Last 7 Days';
    case 'thisMonth':
      return 'This Month';
    case 'all':
      return 'All Time';
    case 'custom':
      return 'Selected Custom Range';
    default:
      return 'Unknown';
  }
}


return (
  <div className="app">
    {/* Hide Sidebar if on /login */}
    {!isLoginPage && (
      <aside className="sidebar">
  <h2>Global Trading Co.</h2>
  <ul>
    <li>
      <NavLink 
        to="/" 
        end
        className={({ isActive }) => isActive ? 'sidebar-item active' : 'sidebar-item'}
      >
        Dashboard
      </NavLink>
    </li>
    <li>
      <NavLink 
        to="/sales"
        className={({ isActive }) => isActive ? 'sidebar-item active' : 'sidebar-item'}
      >
        Sales
      </NavLink>
    </li>
    <li>
      <NavLink 
        to="/sales-agents"
        className={({ isActive }) => isActive ? 'sidebar-item active' : 'sidebar-item'}
      >
        Sales Agents
      </NavLink>
    </li>
    <li>
  <NavLink 
  to="/agents"
  className={({ isActive }) => isActive ? 'sidebar-item active' : 'sidebar-item'}
>
  Agents
</NavLink>

</li>

<li>
  <NavLink
    to="/monthly-record"
    className={({ isActive }) => isActive ? 'sidebar-item active' : 'sidebar-item'}
  >
    Monthly Record
  </NavLink>
</li>


    
    <li>
      <NavLink 
        to="/raw-materials"
        className={({ isActive }) => isActive ? 'sidebar-item active' : 'sidebar-item'}
      >
        Raw Materials
      </NavLink>
    </li>

<li>
  <NavLink
    to="/reports"
    className={({ isActive }) => isActive ? 'sidebar-item active' : 'sidebar-item'}
  >
    Reports
  </NavLink>
</li>


  </ul>
</aside>

    )}

    <main className="content">
      {/* Show top bar only if not login */}
      {!isLoginPage && (
        <div className="top-bar">
          

          



        </div>
      )}

      {/* Only show dashboard content if NOT on login */}
      {!isLoginPage && !isSalesAgentPage && selectedRange === 'custom' && (
  <div className="custom-date-range">

          <label>
            Start Date:
            <input type="date" />
          </label>
          <label>
            End Date:
            <input type="date" />
          </label>
        </div>
      )}

      <Routes>
        {/* Public login route */}
        <Route path="/login" element={<Login />} />

        {/* Protected routes */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <>
                <h1>Dashboard Overview</h1>
                <p>Showing data for: <strong>{getFilterLabel(selectedRange)}</strong></p>

                <div className="dashboard-cards">
                  <div className="card production-card">
                    <div className="card-heading">Production Summary</div>
                    <div className="card-content">
                      <p>✅ 24 Batches Today</p>
                      <p>🍞 3200 Products Made</p>
                    </div>
                  </div>

                  <div className="card sales-card">
                    <div className="card-heading">💰 Sales Summary</div>
                    <div className="card-content">
                      <p>🧾 Rs. 45,000 Today</p>
                      <p>🏆 Top Seller: Ayesha</p>
                    </div>
                  </div>

                  <div className="card raw-material-card">
                    <div className="card-heading">🚨 Raw Material Alert</div>
                    <div className="card-content">
                      <p>🧂 Salt: Low Stock (12kg)</p>
                      <p>🍯 Sugar: Reorder Needed</p>
                    </div>
                  </div>

                  <div className="card commission-card">
                    <div className="card-heading">Commission Tracker</div>
                    <div className="card-content">
                      <p>🧍 Ali: Rs. 3,000</p>
                      <p>🧍 Ayesha: Rs. 4,200</p>
                    </div>
                  </div>
                </div>

                <div className="quick-actions">
                  <h3>🚀 Quick Actions</h3>
                  <div className="action-buttons">
                    <button>Add New Batch</button>
                    <button>Add New Sale</button>
                    <button>Add Raw Material</button>
                    <button>Add Sales Agents</button>
                  </div>
                </div>

                <div className="alerts">
                  <h3>🔔 Alerts & Notifications</h3>
                  <ul className="alert-list">
                    <li className="alert warning">🧂 Salt stock is below 10kg!</li>
                    <li className="alert info">✅ Batch #67 completed successfully.</li>
                    <li className="alert danger">🔥 Oven temperature warning in Line 2!</li>
                  </ul>
                </div>
              </>
            </PrivateRoute>
          }
        />

        <Route
          path="/sales"
          element={<PrivateRoute><Sales /></PrivateRoute>}
        />
        <Route
  path="/sales-agents"
  element={<PrivateRoute><SalesAgents /></PrivateRoute>}
/>
<Route
  path="/agents"
  element={<PrivateRoute><Agents /></PrivateRoute>}
/>

<Route
  path="/monthly-record"
  element={<PrivateRoute><MonthlyRecord /></PrivateRoute>}
/>



       
        <Route
          path="/raw-materials"
          element={<PrivateRoute><RawMaterials /></PrivateRoute>}
        />
<Route
  path="/reports"
  element={<PrivateRoute><Reports /></PrivateRoute>}
/>


      </Routes>

    </main>
  </div>
);
}

export default App;
