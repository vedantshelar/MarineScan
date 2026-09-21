import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";

import Dashboard from "./pages/Dashboard";
import Detection from "./pages/Detection";
import MarineMap from "./pages/MarineMap";
import Analytics from "./pages/Analytics";
import ScanHistory from "./pages/ScanHistory";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";

import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">

        <Sidebar />

        <div className="main-area">

          <Navbar />

          <main className="page-content">
            <Routes>

              <Route
                path="/"
                element={<Navigate to="/dashboard" replace />}
              />

              <Route
                path="/dashboard"
                element={<Dashboard />}
              />

              <Route
                path="/detection"
                element={<Detection />}
              />

              <Route
                path="/map"
                element={<MarineMap />}
              />

              <Route
                path="/analytics"
                element={<Analytics />}
              />

              <Route
                path="/scans"
                element={<ScanHistory />}
              />

              <Route
                path="/reports"
                element={<Reports />}
              />

              <Route
                path="/settings"
                element={<Settings />}
              />

            </Routes>
          </main>

        </div>

      </div>
    </BrowserRouter>
  );
}

export default App;