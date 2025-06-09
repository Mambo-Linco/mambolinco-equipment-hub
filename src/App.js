import React, { useState, useEffect } from "react";
import { Box } from "@mui/material";
import Header from "./components/Header";
import Equipment from "./pages/Equipment";
import Dashboard from "./pages/Dashboard";
import AddEquipment from "./pages/AddEquipment";
import Footer from "./components/Footer";
import ViewEquipment from "./pages/ViewEquipment";
import EditEquipment from "./pages/EditEquipment";
import { ToastProvider } from "./components/Toast";
import Borrowings from "./pages/Borrowings";
import Rentals from "./pages/Rentals";
import Reports from "./pages/Reports";
// Correct import path
//import { db, storage } from "../firebase/config";
import { db, storage } from "./firebase.js";
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
    <ToastProvider>
      <Router>
        <Box
          sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
        >
          <Header />
          <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
            <Routes>
              <Route path="/" element={<Dashboard stats={stats} />} />
              <Route
                path="/equipment"
                element={<Equipment data={equipmentData} loading={loading} />}
              />
              <Route path="/equipment/add" element={<AddEquipment />} />
              <Route path="/equipment/view/:id" element={<ViewEquipment />} />
              <Route path="/equipment/edit/:id" element={<EditEquipment />} />
              <Route path="/borrowings" element={<Borrowings />} />
              <Route path="/rentals" element={<Rentals />} />
              <Route path="/reports" element={<Reports />} />
            </Routes>
          </Box>
          <Footer />
        </Box>
      </Router>
    </ToastProvider>
  );
}

export default App;
