/*import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;*/

import React, { useState, useEffect } from "react";
import { Box } from "@mui/material";
import Header from "./components/Header";
import Equipment from "./pages/Equipment";
import Dashboard from "./pages/Dashboard";
import AddEquipment from "./pages/AddEquipment";
import Footer from "./components/Footer";
import { firestore } from "./firebase"; // Adjust the path as needed
import { fetchEquipmentData } from "./services/api";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  const [equipmentData, setEquipmentData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEquipment: 0,
    currentlyBorrowed: 0,
    activeRentals: 0,
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchEquipmentData();
        setEquipmentData(data);

        // Calculate stats
        const borrowed = data.filter(
          (item) => item.status === "Borrowed"
        ).length;
        const rented = data.filter((item) => item.status === "Rented").length;

        setStats({
          totalEquipment: 2547, // Hardcoded for demo, would come from API
          currentlyBorrowed: 184, // Hardcoded for demo, would come from API
          activeRentals: 95, // Hardcoded for demo, would come from API
        });

        setLoading(false);
      } catch (error) {
        console.error("Error loading data:", error);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <Router>
      <Box
        sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
      >
        <Header />
        <Routes>
          <Route
            path="/"
            element={
              <Dashboard
                equipmentData={equipmentData}
                loading={loading}
                stats={stats}
              />
            }
          />
          <Route path="/equipment" element={<Equipment />} />
          <Route path="/equipment/add" element={<AddEquipment />} />
          {/* Add more routes as needed */}
        </Routes>
        <Footer />
      </Box>
    </Router>
    /*
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <Dashboard
        equipmentData={equipmentData}
        loading={loading}
        stats={stats}
      />
      <Footer />
    </Box>*/
  );
}

export default App;
