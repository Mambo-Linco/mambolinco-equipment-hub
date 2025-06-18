// // Assuming you have a file like 'firebase.js' or 'initFirebase.js'
// // where you initialize Firebase and export the auth instance
// import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
// import React, { useState } from 'react';
// import { auth } from '../firebase'; // Assuming your file is named firebase.js and in the same directory
// //import { signInWithEmailAndPassword } from "firebase/auth"; // Still need the function itself
// // ... rest of your React component code


// // Get the auth instance from your initialized Firebase app
// //const auth = getAuth();

// function SignInComponent() {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState(null); // State to hold any sign-in errors
//   const [isLoading, setIsLoading] = useState(false); // State for loading indicator

//   const handleSignIn = async (e) => {
//     e.preventDefault(); // Prevent default form submission if using a form
//     setError(null); // Clear previous errors
//     setIsLoading(true); // Start loading

//     try {
//       // Use the signInWithEmailAndPassword function from Firebase Auth
//       const userCredential = await signInWithEmailAndPassword(auth, email, password);
//       // Signed in successfully
//       const user = userCredential.user;
//       console.log("User signed in:", user);

//       // *** Success! What happens now? ***
//       // You'd typically redirect the user, update global state,
//       // or navigate to a different part of your app here.
//       // Example: If you use React Router, you might use history.push('/')

//     } catch (err) {
//       // Handle errors, like wrong password, user not found, etc.
//       console.error("Error signing in:", err);
//       setError(err.message); // Display the error message to the user
//     } finally {
//       setIsLoading(false); // Stop loading regardless of success or failure
//     }
//   };

//   return (
//     <div>
//       <h2>Sign In</h2>
//       <form onSubmit={handleSignIn}>
//         <div>
//           <label htmlFor="email">Email:</label>
//           <input
//             type="email"
//             id="email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             required
//           />
//         </div>
//         <div>
//           <label htmlFor="password">Password:</label>
//           <input
//             type="password"
//             id="password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             required
//           />
//         </div>
//         {error && <p style={{ color: 'red' }}>{error}</p>} {/* Display error message if any */}
//         <button type="submit" disabled={isLoading}>
//           {isLoading ? 'Signing In...' : 'Sign In'}
//         </button>
//       </form>
//       {/* You might add links for "Forgot Password?" or "Sign Up" here */}
//     </div>
//   );
// }

// export default SignInComponent;
// src/pages/SignInPage.js
// src/pages/SignInPage.js
import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom'; // <-- Ensure useNavigate is imported
import { useAuth } from '../AuthContext'; // Import the custom hook
import { SignUpPage } from './SignUpPage'; // Import the SignUpPage component
import { signInWithCredential } from 'firebase/auth';

function SignInComponent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Get the signin function from the Auth Context
  const { signin } = useAuth();
  const navigate = useNavigate(); // <-- Get the navigate function

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Call the signin function from the AuthContext
      await signin(email, password); // This is where the Firebase Auth sign-in call happens

      // *** Success! ***
      // If signin is successful, navigate to the dashboard ('/')
      navigate('/'); // <-- Redirect to the dashboard

    } catch (err) {
      // Handle errors (e.g., invalid credentials)
      console.error("Sign in failed:", err);
      // Set the error state to display the message to the user
      // Firebase Auth errors have a 'message' property with a description
      setError(err.message);

      // You could check specific error codes for more user-friendly messages:
      // switch (err.code) {
      //   case 'auth/user-not-found':
      //     setError('No user found with this email.');
      //     break;
      //   case 'auth/wrong-password':
      //     setError('Incorrect password.');
      //     break;
      //   case 'auth/invalid-email':
      //      setError('Invalid email address format.');
      //      break;
      //   default:
      //     setError('Sign in failed. Please try again.');
      // }
    } finally {
      setIsLoading(false); // Stop loading regardless of success or failure
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5">
          Sign In
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && (
            <Typography color="error" variant="body2" sx={{ mt: 1 }}>
              {error}
            </Typography>
          )}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={isLoading}
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </Button>

          {/* --- Add the link to the Sign Up page --- */}
           <Typography variant="body2" align="center">
             Don't have an account?
             {/* Use the navigate function on click */}
             <span
               onClick={() => navigate('/signup')} // <-- Call navigate to /signup
               style={{ cursor: 'pointer', textDecoration: 'underline', marginLeft: 4 }} // Add slight margin
             >
               Sign Up
             </span>
           </Typography>
          {/* -------------------------------------- */}

        </Box>
      </Box>
    </Container>
  );
}

export default SignInComponent;
