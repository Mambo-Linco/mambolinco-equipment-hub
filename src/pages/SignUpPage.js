// src/pages/SignUpPage.js
import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext'; // Import the custom hook

function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Get the signup function from the Auth Context
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission
    setError(null); // Clear previous errors
    setIsLoading(true); // Start loading

    // Basic validation
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    try {
      // Call the signup function from the AuthContext
      await signup(email, password);

      // *** Success! ***
      // User is automatically signed in after successful sign up with email/password
      // The onAuthStateChanged listener in AuthProvider will update the state.
      // Now, navigate the user to the dashboard or another page
      navigate('/'); // Redirect to the dashboard after successful sign up

    } catch (err) {
      // Handle errors (e.g., weak password, email already in use)
      console.error("Sign up failed:", err);
      // Set the error state to display the message to the user
      setError(err.message);

      // You could check specific error codes for more user-friendly messages:
      // switch (err.code) {
      //   case 'auth/email-already-in-use':
      //     setError('The email address is already in use by another account.');
      //     break;
      //   case 'auth/weak-password':
      //     setError('Password should be at least 6 characters.');
      //     break;
      //   case 'auth/invalid-email':
      //     setError('Invalid email address.');
      //     break;
      //   default:
      //     setError('Sign up failed. Please try again.');
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
          Sign Up
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
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
           <TextField
            margin="normal"
            required
            fullWidth
            name="confirmPassword"
            label="Confirm Password"
            type="password"
            id="confirmPassword"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
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
            {isLoading ? 'Signing Up...' : 'Sign Up'}
          </Button>
          {/* Optional: Link to Sign In page */}
           <Typography variant="body2" align="center">
             Already have an account? <span onClick={() => navigate('/signin')} style={{ cursor: 'pointer', textDecoration: 'underline' }}>Sign In</span>
           </Typography>
        </Box>
      </Box>
    </Container>
  );
}

export default SignUpPage;
