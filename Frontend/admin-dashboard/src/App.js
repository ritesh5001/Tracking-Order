import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./components/LoginPage";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import ShipmentTracker from "./pages/ShipmentTracker";
import Home from "./pages/Home";

const App = () => {
  return (
    <Router>
      <Routes>
  <Route path="/" element={<Home />} />
  <Route path="/admin" element={<LoginPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/track" element={<ShipmentTracker />} />
      </Routes>
    </Router>
  );
};

export default App;