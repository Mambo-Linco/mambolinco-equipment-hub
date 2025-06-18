// import React, { useState, useEffect } from "react";
// import { Box } from "@mui/material";
// import Header from "./components/Header";
// import Equipment from "./pages/Equipment";
// import Dashboard from "./pages/Dashboard";
// import AddEquipment from "./pages/AddEquipment";
// import Footer from "./components/Footer";
// import ViewEquipment from "./pages/ViewEquipment";
// import EditEquipment from "./pages/EditEquipment";
// import { ToastProvider } from "./components/Toast";
// import Borrowings from "./pages/Borrowings";
// import Rentals from "./pages/Rentals";
// import Reports from "./pages/Reports";
// // Correct import path
// //import { db, storage } from "../firebase/config";
// import { db, storage } from "./firebase.js";
// import { fetchEquipmentData } from "./services/api";
// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// function App() {
//   const [equipmentData, setEquipmentData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [stats, setStats] = useState({
//     totalEquipment: 0,
//     currentlyBorrowed: 0,
//     activeRentals: 0,
//   });

//   useEffect(() => {
//     const loadData = async () => {
//       try {
//         const data = await fetchEquipmentData();
//         setEquipmentData(data);

//         // Calculate stats
//         const borrowed = data.filter(
//           (item) => item.status === "Borrowed"
//         ).length;
//         const rented = data.filter((item) => item.status === "Rented").length;

//         setStats({
//           totalEquipment: 2547, // Hardcoded for demo, would come from API
//           currentlyBorrowed: 184, // Hardcoded for demo, would come from API
//           activeRentals: 95, // Hardcoded for demo, would come from API
//         });

//         setLoading(false);
//       } catch (error) {
//         console.error("Error loading data:", error);
//         setLoading(false);
//       }
//     };

//     loadData();
//   }, []);

//   return (
//     <ToastProvider>
//       <Router>
//         <Box
//           sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
//         >
//           <Header />
//           <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
//             <Routes>
//               <Route path="/" element={<Dashboard stats={stats} />} />
//               <Route
//                 path="/equipment"
//                 element={<Equipment data={equipmentData} loading={loading} />}
//               />
//               <Route path="/equipment/add" element={<AddEquipment />} />
//               <Route path="/equipment/view/:id" element={<ViewEquipment />} />
//               <Route path="/equipment/edit/:id" element={<EditEquipment />} />
//               <Route path="/borrowings" element={<Borrowings />} />
//               <Route path="/rentals" element={<Rentals />} />
//               <Route path="/reports" element={<Reports />} />
//             </Routes>
//           </Box>
//           <Footer />
//         </Box>
//       </Router>
//     </ToastProvider>
//   );
// }

// export default App;
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
import SignInComponent from "./pages/SignIn"; // Make sure you have this component
import SignUpPage from "./pages/SignUpPage"; // Import your Sign-Up page component

// Import the AuthProvider and the PrivateRoute component
import { AuthProvider } from "./AuthContext"; // Adjust path as needed
import PrivateRoute from "./components/PrivateRoute"; // Adjust path as needed

// Correct import path for Firebase services (ensure 'auth' is also exported in firebase.js)
import { db, storage, auth } from "./firebase.js"; // Adjust path as needed

import { fetchEquipmentData } from "./services/api"; // Keep your API call for data

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  // Keep your state and data fetching logic here or move it
  // into components that need the data (like the Dashboard itself)
  const [equipmentData, setEquipmentData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEquipment: 0,
    currentlyBorrowed: 0,
    activeRentals: 0,
  });

   // You might move this data fetching *inside* the Dashboard component's useEffect
   // if the data is only needed there and should only load when the Dashboard is rendered.
   // For now, keeping it here, but be aware of potential performance implications
   // if this fetches data regardless of the route.
   useEffect(() => {
     const loadData = async () => {
       try {
         const data = await fetchEquipmentData();
         setEquipmentData(data);

         const borrowed = data.filter(
           (item) => item.status === "In Use" || item.status === "Borrowed"
         ).length;
         const rented = data.filter((item) => item.status === "Rented").length;

         setStats({
           totalEquipment: data.length, // Use actual fetched data length
           currentlyBorrowed: borrowed,
           activeRentals: rented,
         });

         setLoading(false);
       } catch (error) {
         console.error("Error loading data:", error);
         setLoading(false);
       }
     };

     // You might want to load this data only if the user is authenticated.
     // This would require checking `currentUser` from AuthContext inside this effect.
     loadData();
   }, []); // Dependency array is empty, runs once on mount

  return (
    <ToastProvider>
      {/* Wrap everything with the AuthProvider */}
      <AuthProvider>
        <Router>
          <Box
            sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
          >
            {/* Header component might need to access auth context to show sign-out */}
            <Header />
            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
              <Routes>
                {/* The Sign-In page is NOT protected - anyone can access it */}
                <Route path="/signin" element={<SignInComponent />} />
                {/* Add a Route for your Sign-Up page if you create one (also not protected) */}
                {/* <Route path="/signup" element={<SignUpPage />} /> */}

                {/* Wrap the Dashboard route with PrivateRoute */}
                {/* Now, accessing '/' will first go through PrivateRoute check */}
                <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />

                {/* You might want to protect these routes too */}
                <Route path="/equipment" element={<PrivateRoute><Equipment data={equipmentData} loading={loading} /></PrivateRoute>} />
                <Route path="/equipment/add" element={<PrivateRoute><AddEquipment /></PrivateRoute>} />
                <Route path="/equipment/view/:id" element={<PrivateRoute><ViewEquipment /></PrivateRoute>} />
                <Route path="/equipment/edit/:id" element={<PrivateRoute><EditEquipment /></PrivateRoute>} />
                <Route path="/borrowings" element={<PrivateRoute><Borrowings /></PrivateRoute>} />
                <Route path="/rentals" element={<PrivateRoute><Rentals /></PrivateRoute>} />
                <Route path="/reports" element={<PrivateRoute><Reports /></PrivateRoute>} />
                <Route path="/signup" element={<SignUpPage />} />


                {/* Add a catch-all for 404 or redirect unauthenticated users */}
                {/* <Route path="*" element={<Navigate to="/signin" />} /> */}

              </Routes>
            </Box>
            <Footer />
          </Box>
        </Router>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
