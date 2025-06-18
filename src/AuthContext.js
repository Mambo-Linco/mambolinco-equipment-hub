// src/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { app } from './firebase'; // Assuming you export 'app' as default from firebase.js

// Get the auth instance from your initialized Firebase app
const auth = getAuth(app);

// Create the Auth Context
const AuthContext = createContext();

// Create a custom hook to easily access the auth context
export function useAuth() {
  return useContext(AuthContext);
}

// Create the Auth Provider component
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true); // Start as true while checking initial auth state

  // useEffect to set up the listener for auth state changes
  useEffect(() => {
    // onAuthStateChanged is Firebase's built-in listener
    // It fires when the auth state changes (user signs in, signs out, etc.)
    // It also fires once when the listener is attached, providing the current state
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user); // Update the user state
      setLoadingAuth(false); // Auth state has been checked
    });

    // Cleanup function: unsubscribe from the listener when the component unmounts
    return unsubscribe;
  }, []); // Empty dependency array means this effect runs only once on mount

  // Function to handle user sign-up
  const signup = async (email, password) => {
    try {
      // Use Firebase's createUserWithEmailAndPassword function
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log("User signed up:", userCredential.user);
      // The onAuthStateChanged listener above will automatically update currentUser state
      return userCredential; // Return user credential on success
    } catch (error) {
      console.error("Error signing up:", error);
      throw error; // Re-throw the error so components can catch and display it
    }
  };

  // Function to handle user sign-in
  const signin = async (email, password) => {
    try {
      // Use Firebase's signInWithEmailAndPassword function
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("User signed in:", userCredential.user);
       // The onAuthStateChanged listener above will automatically update currentUser state
      return userCredential; // Return user credential on success
    } catch (error) {
      console.error("Error signing in:", error);
      throw error; // Re-throw the error
    }
  };

    // Function to handle user sign-out
  const signout = async () => {
    try {
      await signOut(auth);
      console.log("User signed out");
      // The onAuthStateChanged listener above will automatically update currentUser state to null
    } catch (error) {
      console.error("Error signing out:", error);
      throw error; // Re-throw the error
    }
  };


  // The value passed to the provider
  // Contains the current user, loading state, and auth functions
  const value = {
    currentUser,
    loadingAuth, // Useful to show loading spinner while checking initial state
    signup,
    signin,
    signout,
  };

  // Render the provider only when auth state is initially checked
  // This prevents rendering UI that depends on auth before we know the state
  return (
    <AuthContext.Provider value={value}>
      {!loadingAuth && children} {/* Render children only after loadingAuth is false */}
      {/* Alternatively, you could render a loading spinner here if loadingAuth is true */}
    </AuthContext.Provider>
  );
}
