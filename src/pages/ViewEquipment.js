import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  AppBar,
  Toolbar,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
} from "@mui/icons-material";
import { useParams, Link, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase.js";

function ViewEquipment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [equipment, setEquipment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        const docRef = doc(db, "equipment", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setEquipment({ id: docSnap.id, ...docSnap.data() });
        } else {
          console.log("No such equipment!");
          navigate("/equipment");
        }
      } catch (error) {
        console.error("Error fetching equipment:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEquipment();
  }, [id, navigate]);

  // Format date for display
  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";

    // If it's a Firebase timestamp, convert to JS Date
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  // Function to get chip color based on status
  const getStatusColor = (status) => {
    switch (status) {
      case "Available":
        return "success";
      case "In Use":
      case "Borrowed":
        return "warning";
      case "Rented":
        return "info";
      case "Maintenance":
        return "secondary";
      case "Broken":
        return "error";
      default:
        return "default";
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        bgcolor: "#f8f9fa",
      }}
    >
      {/* Header */}
      <AppBar
        position="static"
        color="default"
        elevation={0}
        sx={{ borderBottom: "1px solid #e0e0e0", bgcolor: "white" }}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ py: 1 }}>
            <IconButton
              edge="start"
              component={Link}
              to="/equipment"
              sx={{ mr: 2, color: "text.secondary" }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography
              variant="h6"
              component={Link}
              to="/"
              sx={{
                display: "flex",
                alignItems: "center",
                fontWeight: "bold",
                color: "#333",
                textDecoration: "none",
              }}
            >
              EquipHub
            </Typography>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ mt: 4, mb: 8, flexGrow: 1 }}>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 2,
            mb: 3,
            border: "1px solid #e0e0e0",
            bgcolor: "white",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Typography variant="h4" component="h1" sx={{ fontWeight: "bold" }}>
              Equipment Details
            </Typography>
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              component={Link}
              to={`/equipment/edit/${id}`}
              sx={{
                bgcolor: "#8B4513",
                "&:hover": { bgcolor: "#704214" },
                borderRadius: 1,
              }}
            >
              Edit Equipment
            </Button>
          </Box>

          <Grid container spacing={4}>
            {/* Left Column - Image and Basic Info */}
            <Grid item xs={12} md={4}>
              <Card
                elevation={0}
                sx={{ mb: 3, border: "1px solid #e0e0e0", borderRadius: 2 }}
              >
                {equipment.imageUrl ? (
                  <Box
                    component="img"
                    src={equipment.imageUrl}
                    alt={equipment.name}
                    sx={{
                      width: "100%",
                      height: 250,
                      objectFit: "contain",
                      borderTopLeftRadius: 8,
                      borderTopRightRadius: 8,
                      bgcolor: "#f5f5f5",
                      p: 2,
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      width: "100%",
                      height: 250,
                      bgcolor: "#f5f5f5",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderTopLeftRadius: 8,
                      borderTopRightRadius: 8,
                    }}
                  >
                    <Typography variant="body1" color="text.secondary">
                      No image available
                    </Typography>
                  </Box>
                )}
                <CardContent>
                  <Typography
                    variant="h5"
                    gutterBottom
                    sx={{ fontWeight: "bold" }}
                  >
                    {equipment.name}
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mr: 1 }}
                    >
                      Status:
                    </Typography>
                    <Chip
                      label={equipment.status || "Unknown"}
                      size="small"
                      color={getStatusColor(equipment.status)}
                    />
                  </Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 1 }}
                  >
                    ID:{" "}
                    <Typography component="span" variant="body2">
                      {equipment.equipmentId}
                    </Typography>
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 1 }}
                  >
                    Category:{" "}
                    <Typography component="span" variant="body2">
                      {equipment.category}
                    </Typography>
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 1 }}
                  >
                    Serial Number:{" "}
                    <Typography component="span" variant="body2">
                      {equipment.serialNumber}
                    </Typography>
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 1 }}
                  >
                    In Stock:{" "}
                    <Typography component="span" variant="body2">
                      {equipment.inStock ? "Yes" : "No"}
                    </Typography>
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Right Column - Technical Details */}
            <Grid item xs={12} md={8}>
              <Card
                elevation={0}
                sx={{ mb: 3, border: "1px solid #e0e0e0", borderRadius: 2 }}
              >
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: "medium" }}>
                    Technical Specifications
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Value:
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 2 }}>
                        ${parseFloat(equipment.value || 0).toLocaleString()}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Power Voltage:
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 2 }}>
                        {equipment.powerVoltage} V
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Voltage:
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 2 }}></Typography>
                      <Typography variant="body1" sx={{ mb: 2 }}>
                        {equipment.voltage} V
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              <Card
                elevation={0}
                sx={{ mb: 3, border: "1px solid #e0e0e0", borderRadius: 2 }}
              >
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: "medium" }}>
                    Location & Tracking
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Location:
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 2 }}>
                        {equipment.location || "N/A"}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Last Updated:
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 2 }}>
                        {formatDate(equipment.lastUpdated)}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {equipment.issues && (
                <Card
                  elevation={0}
                  sx={{ mb: 3, border: "1px solid #e0e0e0", borderRadius: 2 }}
                >
                  <CardContent>
                    <Typography
                      variant="h6"
                      sx={{ mb: 2, fontWeight: "medium" }}
                    >
                      Issues
                    </Typography>
                    <Typography variant="body1">{equipment.issues}</Typography>
                  </CardContent>
                </Card>
              )}

              <Card
                elevation={0}
                sx={{ border: "1px solid #e0e0e0", borderRadius: 2 }}
              >
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: "medium" }}>
                    Maintenance
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Action:
                  </Typography>
                  <Typography variant="body1">
                    {equipment.action || "No action specified"}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
}

export default ViewEquipment;
