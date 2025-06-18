// src/components/PrivateRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../AuthContext'; // Import the custom hook

function PrivateRoute({ children }) {
  // Get the current user and loading state from the Auth Context
  const { currentUser, loadingAuth } = useAuth();

  // If auth state is still loading, you might want to show a spinner
  // instead of immediately redirecting or showing the page.
  // This is important because onAuthStateChanged is asynchronous.
  if (loadingAuth) {
    // You could return a loading indicator component here
    return <div>Loading Authentication...</div>; // Replace with a real spinner if desired
  }

  // Check if there is a current user (authenticated)
  if (currentUser) {
    // If authenticated, render the children (the component for the route)
    return children;
  } else {
    // If not authenticated, redirect to the sign-in page
    // The 'replace' prop prevents the user from going back to the protected route
    return <Navigate to="/signin" replace />;
  }
}

export default PrivateRoute;
