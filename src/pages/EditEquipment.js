import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  TextField,
  Grid,
  MenuItem,
  Switch,
  FormControlLabel,
  InputAdornment,
  Button,
  Paper,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  IconButton,
  AppBar,
  Toolbar,
  Divider,
  alpha,
  useTheme,
  CircularProgress,
} from "@mui/material";
import {
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon,
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Edit as EditIcon,
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
  PhotoCamera as PhotoCameraIcon,
} from "@mui/icons-material";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
// Firebase imports
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { db, storage } from "../firebase.js";
import { useToast } from "../components/Toast";

function EditEquipment() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { id } = useParams();
  const fileInputRef = useRef(null);
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    inStock: true,
    equipmentId: "",
    name: "",
    category: "",
    serialNumber: "",
    status: "",
    issues: "",
    value: "",
    powerVoltage: "",
    voltage: "",
    location: "",
    lastUpdated: null,
    action: "Schedule Maintenance",
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [existingImagePath, setExistingImagePath] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch equipment data on component mount
  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        setLoading(true);
        console.log("Fetching equipment with ID:", id);

        const docRef = doc(db, "equipment", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          console.log("Document data:", docSnap.data());
          const data = docSnap.data();

          // Convert Firebase timestamp to Date object if it exists
          let lastUpdated = null;
          if (data.lastUpdated) {
            lastUpdated = data.lastUpdated.toDate
              ? data.lastUpdated.toDate()
              : new Date(data.lastUpdated);
          }

          setFormData({
            inStock: data.inStock ?? true,
            equipmentId: data.equipmentId ?? "",
            name: data.name ?? "",
            category: data.category ?? "",
            serialNumber: data.serialNumber ?? "",
            status: data.status ?? "",
            issues: data.issues ?? "",
            value: data.value ? data.value.toString() : "",
            powerVoltage: data.powerVoltage ? data.powerVoltage.toString() : "",
            voltage: data.voltage ? data.voltage.toString() : "",
            location: data.location ?? "",
            lastUpdated: lastUpdated,
            action: data.action ?? "Schedule Maintenance",
          });

          // Set image preview if available
          if (data.imageUrl) {
            setImagePreview(data.imageUrl);
          }

          // Store the existing image path for later use
          if (data.imagePath) {
            setExistingImagePath(data.imagePath);
          }

          setLoading(false);
        } else {
          console.log("No such document!");
          showToast("Equipment not found", "error");
          setError("Equipment not found");
          setLoading(false);
          setTimeout(() => {
            navigate("/equipment");
          }, 2000);
        }
      } catch (err) {
        console.error("Error fetching equipment:", err);
        showToast(`Error loading equipment data: ${err.message}`, "error");
        setError("Error loading equipment data");
        setLoading(false);
      }
    };

    fetchEquipment();
  }, [id, navigate, showToast]);

  const handleChange = (event) => {
    const { name, value, checked } = event.target;
    setFormData({
      ...formData,
      [name]: name === "inStock" ? checked : value,
    });
  };

  const handleDateChange = (date) => {
    setFormData({
      ...formData,
      lastUpdated: date,
    });
  };

  // Image upload handlers
  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type.substr(0, 5) === "image") {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type.substr(0, 5) === "image") {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate required fields
      if (
        !formData.equipmentId ||
        !formData.name ||
        !formData.category ||
        !formData.serialNumber ||
        !formData.status ||
        !formData.value ||
        !formData.powerVoltage ||
        !formData.voltage ||
        !formData.location
      ) {
        showToast("Please fill in all required fields", "error");
        setIsSubmitting(false);
        return;
      }

      let imagePath = existingImagePath;
      let imageUrl = imagePreview;

      // If a new image is selected, upload it and delete the old one
      if (imageFile) {
        try {
          // Delete old image if it exists
          if (existingImagePath) {
            try {
              const oldImageRef = ref(storage, existingImagePath);
              await deleteObject(oldImageRef);
              console.log("Old image deleted successfully");
            } catch (deleteError) {
              console.error("Error deleting old image:", deleteError);
              // Continue with the update even if deleting the old image fails
            }
          }

          // Upload new image
          const storageRef = ref(
            storage,
            `equipment-images/${Date.now()}-${imageFile.name}`
          );
          const snapshot = await uploadBytes(storageRef, imageFile);
          console.log("New image uploaded successfully:", snapshot);

          imageUrl = await getDownloadURL(storageRef);
          console.log("New image URL obtained:", imageUrl);

          imagePath = storageRef.fullPath;
        } catch (uploadError) {
          console.error("Error handling image:", uploadError);
          showToast(`Error uploading image: ${uploadError.message}`, "error");
          setIsSubmitting(false);
          return;
        }
      }

      // If image was removed (and no new one selected)
      if (!imagePreview && existingImagePath) {
        try {
          const oldImageRef = ref(storage, existingImagePath);
          await deleteObject(oldImageRef);
          console.log("Image deleted successfully");
          imagePath = null;
          imageUrl = null;
        } catch (error) {
          console.error("Error deleting old image:", error);
        }
      }

      // Prepare data for Firestore update
      const equipmentData = {
        ...formData,
        value: formData.value ? parseFloat(formData.value) : 0,
        powerVoltage: formData.powerVoltage
          ? parseFloat(formData.powerVoltage)
          : 0,
        voltage: formData.voltage ? parseFloat(formData.voltage) : 0,
        lastUpdated: formData.lastUpdated || serverTimestamp(),
        updatedAt: serverTimestamp(),
        imagePath,
        imageUrl,
      };

      console.log("Updating equipment data:", equipmentData);

      // Update document in Firestore
      const equipmentRef = doc(db, "equipment", id);
      await updateDoc(equipmentRef, equipmentData);
      console.log("Document updated successfully");

      // Show success message
      showToast("Equipment updated successfully!", "success");

      // Navigate back to equipment list
      setTimeout(() => {
        navigate("/equipment");
      }, 1000);
    } catch (error) {
      console.error("Error updating equipment:", error);
      showToast(`Error updating equipment: ${error.message}`, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate("/equipment");
  };

  // Category options
  const categories = [
    "Electronics",
    "Machinery",
    "Tools",
    "Office Equipment",
    "Audio/Visual",
    "Photography",
    "Manufacturing",
  ];

  // Status options
  const statuses = ["Available", "In Use", "Maintenance", "Broken", "Retired"];

  // Action options
  const actions = [
    "Schedule Maintenance",
    "Request Repair",
    "Mark as Retired",
    "Transfer Location",
  ];

  // Form field styling
  const formFieldStyle = {
    "& .MuiOutlinedInput-root": {
      borderRadius: 1,
      transition: "all 0.3s",
      "&:hover": {
        boxShadow: "0 0 0 1px rgba(0,0,0,0.05)",
      },
      "&.Mui-focused": {
        boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.25)}`,
      },
    },
    "& .MuiInputLabel-root": {
      fontSize: "0.9rem",
    },
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

  if (error) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          flexDirection: "column",
        }}
      >
        <Typography variant="h6" color="error" gutterBottom>
          {error}
        </Typography>
        <Button
          variant="contained"
          component={Link}
          to="/equipment"
          sx={{ mt: 2 }}
        >
          Back to Equipment List
        </Button>
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
              sx={{ mr: 2, color: theme.palette.text.secondary }}
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
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: "bold",
              mb: 4,
              color: "#333",
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <EditIcon sx={{ fontSize: 28 }} /> Edit Equipment
          </Typography>

          <form onSubmit={handleSubmit}>
            <Grid container spacing={4}>
              {/* Left Column */}
              <Grid item xs={12} md={6}>
                <Card
                  elevation={0}
                  sx={{ mb: 3, border: "1px solid #e0e0e0", borderRadius: 2 }}
                >
                  <CardContent>
                    <Typography
                      variant="h6"
                      sx={{ mb: 2, fontWeight: "medium" }}
                    >
                      Basic Information
                    </Typography>

                    <Box sx={{ mb: 3 }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.inStock}
                            onChange={handleChange}
                            name="inStock"
                            color="primary"
                          />
                        }
                        label={
                          <Box
                            component="span"
                            sx={{ display: "flex", alignItems: "center" }}
                          >
                            In Stock
                            <Typography
                              component="span"
                              color="error"
                              sx={{ ml: 0.5 }}
                            >
                              *
                            </Typography>
                          </Box>
                        }
                      />
                    </Box>

                    <Box sx={{ mb: 3 }}>
                      <Typography
                        variant="body2"
                        sx={{ mb: 1, fontWeight: "medium" }}
                      >
                        Equipment ID
                        <Typography component="span" color="error">
                          *
                        </Typography>
                      </Typography>
                      <TextField
                        fullWidth
                        name="equipmentId"
                        value={formData.equipmentId}
                        onChange={handleChange}
                        placeholder="Enter equipment ID"
                        variant="outlined"
                        required
                        sx={formFieldStyle}
                      />
                    </Box>

                    <Box sx={{ mb: 3 }}>
                      <Typography
                        variant="body2"
                        sx={{ mb: 1, fontWeight: "medium" }}
                      >
                        Name
                        <Typography component="span" color="error">
                          *
                        </Typography>
                      </Typography>
                      <TextField
                        fullWidth
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter equipment name"
                        variant="outlined"
                        required
                        sx={formFieldStyle}
                      />
                    </Box>

                    <Box sx={{ mb: 3 }}>
                      <Typography
                        variant="body2"
                        sx={{ mb: 1, fontWeight: "medium" }}
                      >
                        Category
                        <Typography component="span" color="error">
                          *
                        </Typography>
                      </Typography>
                      <FormControl
                        fullWidth
                        variant="outlined"
                        sx={formFieldStyle}
                      >
                        <Select
                          name="category"
                          value={formData.category}
                          onChange={handleChange}
                          displayEmpty
                          required
                          renderValue={(selected) => {
                            if (!selected) {
                              return (
                                <Typography color="text.secondary">
                                  Select category
                                </Typography>
                              );
                            }
                            return selected;
                          }}
                        >
                          {categories.map((category) => (
                            <MenuItem key={category} value={category}>
                              {category}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Box>

                    <Box sx={{ mb: 3 }}>
                      <Typography
                        variant="body2"
                        sx={{ mb: 1, fontWeight: "medium" }}
                      >
                        Serial Number
                        <Typography component="span" color="error">
                          *
                        </Typography>
                      </Typography>
                      <TextField
                        fullWidth
                        name="serialNumber"
                        value={formData.serialNumber}
                        onChange={handleChange}
                        placeholder="Enter serial number"
                        variant="outlined"
                        required
                        sx={formFieldStyle}
                      />
                    </Box>
                  </CardContent>
                </Card>

                <Card
                  elevation={0}
                  sx={{ border: "1px solid #e0e0e0", borderRadius: 2, mb: 3 }}
                >
                  <CardContent>
                    <Typography
                      variant="h6"
                      sx={{ mb: 2, fontWeight: "medium" }}
                    >
                      Status & Issues
                    </Typography>

                    <Box sx={{ mb: 3 }}>
                      <Typography
                        variant="body2"
                        sx={{ mb: 1, fontWeight: "medium" }}
                      >
                        Status
                        <Typography component="span" color="error">
                          *
                        </Typography>
                      </Typography>
                      <FormControl
                        fullWidth
                        variant="outlined"
                        sx={formFieldStyle}
                      >
                        <Select
                          name="status"
                          value={formData.status}
                          onChange={handleChange}
                          displayEmpty
                          required
                          renderValue={(selected) => {
                            if (!selected) {
                              return (
                                <Typography color="text.secondary">
                                  Select status
                                </Typography>
                              );
                            }
                            return selected;
                          }}
                        >
                          {statuses.map((status) => (
                            <MenuItem key={status} value={status}>
                              {status}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Box>

                    <Box sx={{ mb: 1 }}>
                      <Typography
                        variant="body2"
                        sx={{ mb: 1, fontWeight: "medium" }}
                      >
                        Issues
                      </Typography>
                      <TextField
                        fullWidth
                        name="issues"
                        value={formData.issues}
                        onChange={handleChange}
                        placeholder="Describe any issues..."
                        variant="outlined"
                        multiline
                        rows={4}
                        sx={formFieldStyle}
                      />
                    </Box>
                  </CardContent>
                </Card>

                {/* Technical Specifications */}
                <Card
                  elevation={0}
                  sx={{ border: "1px solid #e0e0e0", borderRadius: 2 }}
                >
                  <CardContent>
                    <Typography
                      variant="h6"
                      sx={{ mb: 2, fontWeight: "medium" }}
                    >
                      Technical Specifications
                    </Typography>

                    <Box sx={{ mb: 3 }}>
                      <Typography
                        variant="body2"
                        sx={{ mb: 1, fontWeight: "medium" }}
                      >
                        Value
                        <Typography component="span" color="error">
                          *
                        </Typography>
                      </Typography>
                      <TextField
                        fullWidth
                        name="value"
                        value={formData.value}
                        onChange={handleChange}
                        placeholder="Enter value"
                        variant="outlined"
                        required
                        sx={formFieldStyle}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">$</InputAdornment>
                          ),
                        }}
                      />
                    </Box>

                    <Box sx={{ mb: 3 }}>
                      <Typography
                        variant="body2"
                        sx={{ mb: 1, fontWeight: "medium" }}
                      >
                        Power Voltage
                        <Typography component="span" color="error">
                          *
                        </Typography>
                      </Typography>
                      <TextField
                        fullWidth
                        name="powerVoltage"
                        value={formData.powerVoltage}
                        onChange={handleChange}
                        placeholder="Enter power voltage"
                        variant="outlined"
                        required
                        sx={formFieldStyle}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">V</InputAdornment>
                          ),
                        }}
                      />
                    </Box>

                    <Box sx={{ mb: 3 }}>
                      <Typography
                        variant="body2"
                        sx={{ mb: 1, fontWeight: "medium" }}
                      >
                        Voltage
                        <Typography component="span" color="error">
                          *
                        </Typography>
                      </Typography>
                      <TextField
                        fullWidth
                        name="voltage"
                        value={formData.voltage}
                        onChange={handleChange}
                        placeholder="Enter voltage"
                        variant="outlined"
                        required
                        sx={formFieldStyle}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">V</InputAdornment>
                          ),
                        }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Right Column */}
              <Grid item xs={12} md={6}>
                {/* Image Upload Card */}
                <Card
                  elevation={0}
                  sx={{ mb: 3, border: "1px solid #e0e0e0", borderRadius: 2 }}
                >
                  <CardContent>
                    <Typography
                      variant="h6"
                      sx={{
                        mb: 2,
                        fontWeight: "medium",
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <PhotoCameraIcon fontSize="small" /> Equipment Image
                    </Typography>

                    <Box
                      sx={{
                        border: `2px dashed ${
                          isDragging ? theme.palette.primary.main : "#e0e0e0"
                        }`,
                        borderRadius: 2,
                        p: 2,
                        mb: 2,
                        minHeight: 200,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        position: "relative",
                        transition: "all 0.3s",
                        bgcolor: isDragging
                          ? alpha(theme.palette.primary.main, 0.05)
                          : "transparent",
                        cursor: "pointer",
                      }}
                      onClick={triggerFileInput}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        style={{ display: "none" }}
                        ref={fileInputRef}
                      />

                      {imagePreview ? (
                        <Box
                          sx={{
                            position: "relative",
                            width: "100%",
                            height: "100%",
                          }}
                        >
                          <Box
                            component="img"
                            src={imagePreview}
                            alt="Equipment preview"
                            sx={{
                              width: "100%",
                              height: "200px",
                              objectFit: "contain",
                              borderRadius: 1,
                            }}
                          />
                          <IconButton
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveImage();
                            }}
                            sx={{
                              position: "absolute",
                              top: 8,
                              right: 8,
                              bgcolor: "rgba(255, 255, 255, 0.8)",
                              "&:hover": {
                                bgcolor: "rgba(255, 255, 255, 0.9)",
                              },
                            }}
                            size="small"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      ) : (
                        <>
                          <CloudUploadIcon
                            sx={{
                              fontSize: 48,
                              color: "text.secondary",
                              mb: 2,
                            }}
                          />
                          <Typography
                            variant="body1"
                            color="text.secondary"
                            align="center"
                            gutterBottom
                          >
                            Drag and drop an image here, or click to select
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            align="center"
                          >
                            Supports: JPG, PNG, GIF (max 5MB)
                          </Typography>
                        </>
                      )}
                    </Box>
                  </CardContent>
                </Card>

                <Card
                  elevation={0}
                  sx={{ mb: 3, border: "1px solid #e0e0e0", borderRadius: 2 }}
                >
                  <CardContent>
                    <Typography
                      variant="h6"
                      sx={{ mb: 2, fontWeight: "medium" }}
                    >
                      Location & Tracking
                    </Typography>

                    <Box sx={{ mb: 3 }}>
                      <Typography
                        variant="body2"
                        sx={{ mb: 1, fontWeight: "medium" }}
                      >
                        Location
                        <Typography component="span" color="error">
                          *
                        </Typography>
                      </Typography>
                      <TextField
                        fullWidth
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder="Enter location"
                        variant="outlined"
                        required
                        sx={formFieldStyle}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LocationIcon
                                fontSize="small"
                                sx={{ color: "text.secondary" }}
                              />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Box>

                    <Box sx={{ mb: 3 }}>
                      <Typography
                        variant="body2"
                        sx={{ mb: 1, fontWeight: "medium" }}
                      >
                        Last Updated
                      </Typography>
                      <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker
                          value={formData.lastUpdated}
                          onChange={handleDateChange}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              fullWidth
                              variant="outlined"
                              placeholder="yyyy / mm / dd"
                              sx={formFieldStyle}
                              InputProps={{
                                endAdornment: (
                                  <InputAdornment position="end">
                                    <CalendarIcon
                                      fontSize="small"
                                      sx={{ color: "text.secondary" }}
                                    />
                                  </InputAdornment>
                                ),
                              }}
                            />
                          )}
                        />
                      </LocalizationProvider>
                    </Box>
                  </CardContent>
                </Card>

                <Card
                  elevation={0}
                  sx={{ border: "1px solid #e0e0e0", borderRadius: 2 }}
                >
                  <CardContent>
                    <Typography
                      variant="h6"
                      sx={{ mb: 2, fontWeight: "medium" }}
                    >
                      Maintenance
                    </Typography>

                    <Box sx={{ mb: 1 }}>
                      <Typography
                        variant="body2"
                        sx={{ mb: 1, fontWeight: "medium" }}
                      >
                        Actions
                      </Typography>
                      <FormControl
                        fullWidth
                        variant="outlined"
                        sx={formFieldStyle}
                      >
                        <Select
                          name="action"
                          value={formData.action}
                          onChange={handleChange}
                          displayEmpty
                        >
                          {actions.map((action) => (
                            <MenuItem key={action} value={action}>
                              {action}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Form Buttons */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                mt: 4,
                gap: 2,
                position: "sticky",
                bottom: 16,
                zIndex: 10,
              }}
            >
              <Button
                variant="outlined"
                onClick={handleCancel}
                startIcon={<CancelIcon />}
                disabled={isSubmitting}
                sx={{
                  borderColor: "#8B4513",
                  color: "#8B4513",
                  px: 3,
                  py: 1,
                  borderRadius: 1,
                  "&:hover": {
                    borderColor: "#704214",
                    bgcolor: alpha("#8B4513", 0.04),
                  },
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={<SaveIcon />}
                disabled={isSubmitting}
                sx={{
                  bgcolor: "#8B4513",
                  "&:hover": { bgcolor: "#704214" },
                  px: 3,
                  py: 1,
                  borderRadius: 1,
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
              >
                {isSubmitting ? "Saving..." : "Update"}
              </Button>
            </Box>
          </form>
        </Paper>
      </Container>
    </Box>
  );
}

export default EditEquipment;
