import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Skeleton,
  alpha,
  useTheme,
} from "@mui/material";
import {
  AttachMoney as MoneyIcon,
  CalendarToday as CalendarIcon,
  Add as AddIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  FilterList as FilterListIcon,
  FileDownload as FileDownloadIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Receipt as ReceiptIcon,
} from "@mui/icons-material";
import { Link } from "react-router-dom";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import {
  collection,
  getDocs,
  query,
  orderBy,
  addDoc,
  updateDoc,
  doc,
  getDoc,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { db } from "../firebase";
import { useToast } from "../components/Toast";

function Rentals() {
  const theme = useTheme();
  const { showToast } = useToast();
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [availableEquipment, setAvailableEquipment] = useState([]);
  const [formData, setFormData] = useState({
    equipmentId: "",
    client: "",
    company: "",
    contactInfo: "",
    rentalStart: new Date(),
    rentalEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default to 30 days from now
    rentalRate: "",
    totalCost: "",
    paymentStatus: "Pending",
    notes: "",
    status: "Active",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stats, setStats] = useState({
    totalRentals: 0,
    activeRentals: 0,
    revenue: 0,
  });

  const rowsPerPage = 5;

  // Fetch rentals data
  const fetchRentals = useCallback(async () => {
    try {
      setLoading(true);
      console.log("Fetching rentals data...");

      const rentalsRef = collection(db, "rentals");
      const q = query(rentalsRef, orderBy("rentalStart", "desc"));
      const querySnapshot = await getDocs(q);

      console.log("Query snapshot size:", querySnapshot.size);

      if (querySnapshot.empty) {
        console.log("No rentals data found");
        setRentals([]);
        setStats({
          totalRentals: 0,
          activeRentals: 0,
          revenue: 0,
        });
        setLoading(false);
        return;
      }

      const rentalItems = [];
      let totalRevenue = 0;

      // Process each document
      const promises = querySnapshot.docs.map(async (docSnapshot) => {
        const data = docSnapshot.data();

        // Get equipment details
        let equipmentDetails = { name: "Unknown", category: "Unknown" };
        if (data.equipmentId) {
          try {
            const equipmentDoc = await getDoc(
              doc(db, "equipment", data.equipmentId)
            );
            if (equipmentDoc.exists()) {
              equipmentDetails = {
                name: equipmentDoc.data().name || "Unknown",
                category: equipmentDoc.data().category || "Unknown",
                imageUrl: equipmentDoc.data().imageUrl || null,
              };
            }
          } catch (error) {
            console.error("Error getting equipment details:", error);
          }
        }

        // Calculate revenue
        if (data.totalCost && data.paymentStatus === "Paid") {
          totalRevenue += parseFloat(data.totalCost);
        }

        return {
          id: docSnapshot.id,
          ...data,
          equipmentName: equipmentDetails.name,
          equipmentCategory: equipmentDetails.category,
          equipmentImageUrl: equipmentDetails.imageUrl,
          // Convert Firebase timestamps to JS Date objects
          rentalStart: data.rentalStart?.toDate
            ? data.rentalStart.toDate()
            : new Date(data.rentalStart),
          rentalEnd: data.rentalEnd?.toDate
            ? data.rentalEnd.toDate()
            : new Date(data.rentalEnd),
          returnDate: data.returnDate?.toDate
            ? data.returnDate.toDate()
            : data.returnDate
            ? new Date(data.returnDate)
            : null,
        };
      });

      // Wait for all promises to resolve
      const resolvedItems = await Promise.all(promises);
      setRentals(resolvedItems);

      // Calculate stats
      const active = resolvedItems.filter(
        (item) => item.status === "Active"
      ).length;

      setStats({
        totalRentals: resolvedItems.length,
        activeRentals: active,
        revenue: totalRevenue,
      });

      console.log(
        "Rentals data loaded successfully:",
        resolvedItems.length,
        "items"
      );
    } catch (error) {
      console.error("Error fetching rentals data:", error);
      showToast(`Error loading rentals data: ${error.message}`, "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [showToast]);

  // Fetch available equipment for rental
  const fetchAvailableEquipment = useCallback(async () => {
    try {
      const equipmentRef = collection(db, "equipment");
      const q = query(equipmentRef, where("status", "==", "Available"));
      const querySnapshot = await getDocs(q);

      const equipment = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setAvailableEquipment(equipment);
    } catch (error) {
      console.error("Error fetching available equipment:", error);
      showToast(`Error loading available equipment: ${error.message}`, "error");
    }
  }, [showToast]);

  useEffect(() => {
    fetchRentals();
  }, [fetchRentals]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchRentals();
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(1); // Reset to first page when searching
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleOpenDialog = () => {
    fetchAvailableEquipment();
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({
      equipmentId: "",
      client: "",
      company: "",
      contactInfo: "",
      rentalStart: new Date(),
      rentalEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      rentalRate: "",
      totalCost: "",
      paymentStatus: "Pending",
      notes: "",
      status: "Active",
    });
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Calculate total cost if rental rate and dates are set
    if (
      name === "rentalRate" ||
      name === "rentalStart" ||
      name === "rentalEnd"
    ) {
      if (
        formData.rentalStart &&
        formData.rentalEnd &&
        (name === "rentalRate" ? value : formData.rentalRate)
      ) {
        const start = new Date(formData.rentalStart);
        const end = new Date(name === "rentalEnd" ? value : formData.rentalEnd);
        const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        const rate = parseFloat(
          name === "rentalRate" ? value : formData.rentalRate
        );

        if (days > 0 && !isNaN(rate)) {
          const total = days * rate;
          setFormData((prev) => ({
            ...prev,
            [name]: value,
            totalCost: total.toFixed(2),
          }));
        }
      }
    }
  };

  const handleDateChange = (name, date) => {
    setFormData((prev) => ({
      ...prev,
      [name]: date,
    }));

    // Calculate total cost if rental rate and dates are set
    if (formData.rentalRate) {
      const start = new Date(
        name === "rentalStart" ? date : formData.rentalStart
      );
      const end = new Date(name === "rentalEnd" ? date : formData.rentalEnd);
      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      const rate = parseFloat(formData.rentalRate);

      if (days > 0 && !isNaN(rate)) {
        const total = days * rate;
        setFormData((prev) => ({
          ...prev,
          [name]: date,
          totalCost: total.toFixed(2),
        }));
      }
    }
  };

  const handleSubmit = async () => {
    if (
      !formData.equipmentId ||
      !formData.client ||
      !formData.rentalRate ||
      !formData.totalCost
    ) {
      showToast("Please fill in all required fields", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      // Add rental record
      const rentalData = {
        ...formData,
        rentalStart: formData.rentalStart || new Date(),
        rentalEnd:
          formData.rentalEnd || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        rentalRate: parseFloat(formData.rentalRate),
        totalCost: parseFloat(formData.totalCost),
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, "rentals"), rentalData);
      console.log("Rental record created with ID:", docRef.id);

      // Update equipment status
      const equipmentRef = doc(db, "equipment", formData.equipmentId);
      await updateDoc(equipmentRef, {
        status: "Rented",
        lastUpdated: serverTimestamp(),
      });

      showToast("Equipment rental created successfully!", "success");
      handleCloseDialog();
      fetchRentals();
    } catch (error) {
      console.error("Error creating rental record:", error);
      showToast(`Error: ${error.message}`, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompleteRental = async (rentalId, equipmentId) => {
    if (window.confirm("Mark this rental as completed?")) {
      try {
        // Update rental record
        const rentalRef = doc(db, "rentals", rentalId);
        await updateDoc(rentalRef, {
          status: "Completed",
          returnDate: new Date(),
          updatedAt: serverTimestamp(),
        });

        // Update equipment status
        const equipmentRef = doc(db, "equipment", equipmentId);
        await updateDoc(equipmentRef, {
          status: "Available",
          lastUpdated: serverTimestamp(),
        });

        showToast("Rental completed successfully!", "success");
        fetchRentals();
      } catch (error) {
        console.error("Error completing rental:", error);
        showToast(`Error: ${error.message}`, "error");
      }
    }
  };

  const handleDeleteRental = async (id) => {
    if (window.confirm("Are you sure you want to delete this rental record?")) {
      try {
        await updateDoc(doc(db, "rentals", id), {
          deleted: true,
          deletedAt: serverTimestamp(),
        });
        showToast("Rental record deleted successfully", "success");
        fetchRentals();
      } catch (error) {
        console.error("Error deleting rental record:", error);
        showToast(`Error: ${error.message}`, "error");
      }
    }
  };

  // Filter rentals based on search term
  const filteredRentals = rentals.filter((item) => {
    return (
      (item.client?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (item.company?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (item.equipmentName?.toLowerCase() || "").includes(
        searchTerm.toLowerCase()
      ) ||
      (item.paymentStatus?.toLowerCase() || "").includes(
        searchTerm.toLowerCase()
      )
    );
  });

  // Paginate the filtered data
  const paginatedRentals = filteredRentals.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  // Function to get chip color based on status
  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "primary";
      case "Completed":
        return "success";
      case "Cancelled":
        return "error";
      default:
        return "default";
    }
  };

  // Function to get chip color based on payment status
  const getPaymentStatusColor = (status) => {
    switch (status) {
      case "Paid":
        return "success";
      case "Pending":
        return "warning";
      case "Overdue":
        return "error";
      default:
        return "default";
    }
  };

  // Format date for display
  const formatDate = (date) => {
    if (!date) return "N/A";

    try {
      return new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid Date";
    }
  };

  // Format currency for display
  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return "$0.00";

    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 2,
              height: "100%",
              border: "1px solid #e0e0e0",
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                Total Rentals
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                {loading ? (
                  <Skeleton variant="text" width={80} height={60} />
                ) : (
                  <Typography
                    variant="h3"
                    component="div"
                    sx={{
                      fontWeight: "bold",
                      color: theme.palette.primary.main,
                    }}
                  >
                    {stats.totalRentals}
                  </Typography>
                )}
                <Box
                  sx={{
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    p: 1,
                    borderRadius: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <ReceiptIcon sx={{ color: theme.palette.primary.main }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 2,
              height: "100%",
              border: "1px solid #e0e0e0",
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                Active Rentals
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                {loading ? (
                  <Skeleton variant="text" width={80} height={60} />
                ) : (
                  <Typography
                    variant="h3"
                    component="div"
                    sx={{ fontWeight: "bold", color: "#2196f3" }}
                  >
                    {stats.activeRentals}
                  </Typography>
                )}
                <Box
                  sx={{
                    bgcolor: alpha("#2196f3", 0.1),
                    p: 1,
                    borderRadius: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <CheckCircleIcon sx={{ color: "#2196f3" }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 2,
              height: "100%",
              border: "1px solid #e0e0e0",
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                Total Revenue
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                {loading ? (
                  <Skeleton variant="text" width={80} height={60} />
                ) : (
                  <Typography
                    variant="h3"
                    component="div"
                    sx={{ fontWeight: "bold", color: "#4caf50" }}
                  >
                    {formatCurrency(stats.revenue)}
                  </Typography>
                )}
                <Box
                  sx={{
                    bgcolor: alpha("#4caf50", 0.1),
                    p: 1,
                    borderRadius: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <MoneyIcon sx={{ color: "#4caf50" }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Rentals Management Section */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 2,
          overflow: "hidden",
          mb: 4,
          border: "1px solid #e0e0e0",
        }}
      >
        <Box
          sx={{
            p: 3,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6" component="h2" sx={{ fontWeight: "bold" }}>
            Rentals Management
          </Typography>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              disabled={refreshing}
              sx={{ borderRadius: 50 }}
            >
              {refreshing ? "Refreshing..." : "Refresh"}
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenDialog}
              sx={{
                borderRadius: 50,
                px: 2,
                backgroundColor: "#0000FF", // Blue colorbackgroundColor: "#0000FF", // Blue color
                //bgcolor: "#8B4513",
                "&:hover": { bgcolor: "#704214" },
              }}
            >
              New Rental
            </Button>
          </Box>
        </Box>

        <Box
          sx={{
            p: 3,
            display: "flex",
            justifyContent: "space-between",
            borderBottom: "1px solid #f0f0f0",
          }}
        >
          <TextField
            placeholder="Search rentals..."
            size="small"
            value={searchTerm}
            onChange={handleSearchChange}
            sx={{ width: 250 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              startIcon={<FilterListIcon />}
              size="small"
              sx={{ color: "text.secondary" }}
            >
              Filter
            </Button>
            <Button
              startIcon={<FileDownloadIcon />}
              size="small"
              sx={{ color: "text.secondary" }}
            >
              Export
            </Button>
          </Box>
        </Box>

        {loading ? (
          <Box sx={{ p: 2 }}>
            {[...Array(5)].map((_, index) => (
              <Box key={index} sx={{ display: "flex", my: 2, px: 2 }}>
                <Skeleton
                  variant="rectangular"
                  width={60}
                  height={60}
                  sx={{ mr: 2 }}
                />
                <Box sx={{ width: "100%" }}>
                  <Skeleton variant="text" width="20%" />
                  <Skeleton variant="text" width="40%" />
                  <Skeleton variant="text" width="15%" />
                </Box>
              </Box>
            ))}
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table sx={{ minWidth: 650 }}>
                <TableHead sx={{ bgcolor: "#fafafa" }}>
                  <TableRow>
                    <TableCell>Equipment</TableCell>
                    <TableCell>Client</TableCell>
                    <TableCell>Rental Period</TableCell>
                    <TableCell>Rate</TableCell>
                    <TableCell>Total Cost</TableCell>
                    <TableCell>Payment Status</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedRentals.length > 0 ? (
                    paginatedRentals.map((row) => (
                      <TableRow key={row.id} hover>
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            {row.equipmentImageUrl ? (
                              <Box
                                component="img"
                                src={row.equipmentImageUrl}
                                alt={row.equipmentName}
                                sx={{
                                  width: 40,
                                  height: 40,
                                  objectFit: "cover",
                                  borderRadius: 1,
                                  border: "1px solid #e0e0e0",
                                  mr: 1.5,
                                }}
                                loading="lazy"
                              />
                            ) : (
                              <Box
                                sx={{
                                  width: 40,
                                  height: 40,
                                  bgcolor: "#f5f5f5",
                                  borderRadius: 1,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  border: "1px solid #e0e0e0",
                                  mr: 1.5,
                                }}
                              >
                                <ReceiptIcon sx={{ color: "#bdbdbd" }} />
                              </Box>
                            )}
                            <Box>
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: "medium" }}
                              >
                                {row.equipmentName || "Unknown Equipment"}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {row.equipmentCategory || "Unknown Category"}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: "medium" }}
                          >
                            {row.client || "N/A"}
                          </Typography>
                          {row.company && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {row.company}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {formatDate(row.rentalStart)} -{" "}
                            {formatDate(row.rentalEnd)}
                          </Typography>
                          {row.returnDate && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Returned: {formatDate(row.returnDate)}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          {formatCurrency(row.rentalRate)}/day
                        </TableCell>
                        <TableCell>{formatCurrency(row.totalCost)}</TableCell>
                        <TableCell>
                          <Chip
                            label={row.paymentStatus || "Unknown"}
                            size="small"
                            color={getPaymentStatusColor(row.paymentStatus)}
                            sx={{
                              borderRadius: 1,
                              fontWeight: "medium",
                              fontSize: "0.75rem",
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={row.status || "Unknown"}
                            size="small"
                            color={getStatusColor(row.status)}
                            sx={{
                              borderRadius: 1,
                              fontWeight: "medium",
                              fontSize: "0.75rem",
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "center",
                              gap: 1,
                            }}
                          >
                            {row.status === "Active" && (
                              <Button
                                size="small"
                                variant="outlined"
                                color="success"
                                onClick={() =>
                                  handleCompleteRental(row.id, row.equipmentId)
                                }
                                sx={{ fontSize: "0.7rem", py: 0.5 }}
                              >
                                Complete
                              </Button>
                            )}
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteRental(row.id)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                        <Typography variant="body1" color="text.secondary">
                          No rentals found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <Box
              sx={{
                p: 2,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Showing{" "}
                {filteredRentals.length > 0
                  ? Math.min(
                      (page - 1) * rowsPerPage + 1,
                      filteredRentals.length
                    )
                  : 0}{" "}
                to {Math.min(page * rowsPerPage, filteredRentals.length)} of{" "}
                {filteredRentals.length} entries
              </Typography>
              <Pagination
                count={Math.max(
                  1,
                  Math.ceil(filteredRentals.length / rowsPerPage)
                )}
                page={page}
                onChange={handlePageChange}
                shape="rounded"
                size="small"
              />
            </Box>
          </>
        )}
      </Paper>

      {/* New Rental Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: "bold", pb: 1 }}>New Rental</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="equipment-label">Equipment *</InputLabel>
                <TextField
                  labelId="equipment-label"
                  name="equipmentId"
                  value={formData.equipmentId}
                  onChange={handleFormChange}
                  label="Equipment *"
                  required
                >
                  {availableEquipment.map((equipment) => (
                    <MenuItem key={equipment.id} value={equipment.id}>
                      {equipment.name} ({equipment.equipmentId})
                    </MenuItem>
                  ))}
                </TextField>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                margin="normal"
                label="Client Name *"
                name="client"
                value={formData.client}
                onChange={handleFormChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                margin="normal"
                label="Company"
                name="company"
                value={formData.company}
                onChange={handleFormChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                margin="normal"
                label="Contact Information"
                name="contactInfo"
                value={formData.contactInfo}
                onChange={handleFormChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Rental Start Date"
                  value={formData.rentalStart}
                  onChange={(date) => handleDateChange("rentalStart", date)}
                  renderInput={(params) => (
                    <TextField {...params} fullWidth margin="normal" />
                  )}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Rental End Date"
                  value={formData.rentalEnd}
                  onChange={(date) => handleDateChange("rentalEnd", date)}
                  renderInput={(params) => (
                    <TextField {...params} fullWidth margin="normal" />
                  )}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                margin="normal"
                label="Daily Rate ($) *"
                name="rentalRate"
                value={formData.rentalRate}
                onChange={handleFormChange}
                required
                type="number"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">$</InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                margin="normal"
                label="Total Cost ($)"
                name="totalCost"
                value={formData.totalCost}
                onChange={handleFormChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">$</InputAdornment>
                  ),
                  readOnly: true,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="payment-status-label">
                  Payment Status
                </InputLabel>
                <Select
                  labelId="payment-status-label"
                  name="paymentStatus"
                  value={formData.paymentStatus}
                  onChange={handleFormChange}
                  label="Payment Status"
                >
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="Paid">Paid</MenuItem>
                  <MenuItem value="Overdue">Overdue</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="status-label">Status</InputLabel>
                <Select
                  labelId="status-label"
                  name="status"
                  value={formData.status}
                  onChange={handleFormChange}
                  label="Status"
                >
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Completed">Completed</MenuItem>
                  <MenuItem value="Cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                margin="normal"
                label="Notes"
                name="notes"
                value={formData.notes}
                onChange={handleFormChange}
                multiline
                rows={2}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDialog} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={isSubmitting}
            sx={{
              bgcolor: "#8B4513",
              "&:hover": { bgcolor: "#704214" },
            }}
          >
            {isSubmitting ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Rentals;
