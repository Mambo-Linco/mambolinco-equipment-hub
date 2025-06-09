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
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  Divider,
  CircularProgress,
  alpha,
  useTheme,
} from "@mui/material";
import {
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  TrendingUp as TrendingUpIcon,
  FileDownload as FileDownloadIcon,
  CalendarToday as CalendarIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { collection, getDocs, query, orderBy, where } from "firebase/firestore";
import { db } from "../firebase";
import { useToast } from "../components/Toast";

// Import chart components (you'll need to install a chart library like Chart.js or Recharts)
// For this example, we'll use placeholders for the charts

function Reports() {
  const theme = useTheme();
  const { showToast } = useToast();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [reportType, setReportType] = useState("equipment");
  const [timeRange, setTimeRange] = useState("month");
  const [startDate, setStartDate] = useState(
    new Date(new Date().setMonth(new Date().getMonth() - 1))
  );
  const [endDate, setEndDate] = useState(new Date());
  const [equipmentData, setEquipmentData] = useState([]);
  const [borrowingsData, setBorrowingsData] = useState([]);
  const [rentalsData, setRentalsData] = useState([]);
  const [reportData, setReportData] = useState({
    totalEquipment: 0,
    availableEquipment: 0,
    inUseEquipment: 0,
    maintenanceEquipment: 0,
    totalBorrowings: 0,
    activeBorrowings: 0,
    overdueBorrowings: 0,
    totalRentals: 0,
    activeRentals: 0,
    totalRevenue: 0,
    equipmentByCategory: {},
    equipmentByStatus: {},
    borrowingsTrend: [],
    rentalsTrend: [],
    revenueTrend: [],
  });

  // Fetch data for reports
  const fetchReportData = useCallback(async () => {
    try {
      setLoading(true);
      console.log("Fetching report data...");

      // Fetch equipment data
      const equipmentRef = collection(db, "equipment");
      const equipmentQuery = query(equipmentRef, orderBy("createdAt", "desc"));
      const equipmentSnapshot = await getDocs(equipmentQuery);

      const equipment = equipmentSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setEquipmentData(equipment);

      // Fetch borrowings data
      const borrowingsRef = collection(db, "borrowings");
      const borrowingsQuery = query(
        borrowingsRef,
        where("borrowDate", ">=", startDate),
        where("borrowDate", "<=", endDate),
        orderBy("borrowDate", "desc")
      );
      const borrowingsSnapshot = await getDocs(borrowingsQuery);

      const borrowings = borrowingsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        borrowDate: doc.data().borrowDate?.toDate
          ? doc.data().borrowDate.toDate()
          : new Date(doc.data().borrowDate),
      }));

      setBorrowingsData(borrowings);

      // Fetch rentals data
      const rentalsRef = collection(db, "rentals");
      const rentalsQuery = query(
        rentalsRef,
        where("rentalStart", ">=", startDate),
        where("rentalStart", "<=", endDate),
        orderBy("rentalStart", "desc")
      );
      const rentalsSnapshot = await getDocs(rentalsQuery);

      const rentals = rentalsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        rentalStart: doc.data().rentalStart?.toDate
          ? doc.data().rentalStart.toDate()
          : new Date(doc.data().rentalStart),
      }));

      setRentalsData(rentals);

      // Process data for reports
      processReportData(equipment, borrowings, rentals);

      console.log("Report data loaded successfully");
    } catch (error) {
      console.error("Error fetching report data:", error);
      showToast(`Error loading report data: ${error.message}`, "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [startDate, endDate, showToast]);

  // Process data for reports
  const processReportData = (equipment, borrowings, rentals) => {
    // Equipment statistics
    const totalEquipment = equipment.length;
    const availableEquipment = equipment.filter(
      (item) => item.status === "Available"
    ).length;
    const inUseEquipment = equipment.filter(
      (item) =>
        item.status === "In Use" ||
        item.status === "Borrowed" ||
        item.status === "Rented"
    ).length;
    const maintenanceEquipment = equipment.filter(
      (item) => item.status === "Maintenance" || item.status === "Broken"
    ).length;

    // Equipment by category
    const equipmentByCategory = equipment.reduce((acc, item) => {
      const category = item.category || "Unknown";
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});

    // Equipment by status
    const equipmentByStatus = equipment.reduce((acc, item) => {
      const status = item.status || "Unknown";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    // Borrowings statistics
    const totalBorrowings = borrowings.length;
    const activeBorrowings = borrowings.filter(
      (item) => item.status === "Borrowed"
    ).length;
    const overdueBorrowings = borrowings.filter(
      (item) =>
        item.status !== "Returned" &&
        new Date(item.expectedReturnDate) < new Date()
    ).length;

    // Rentals statistics
    const totalRentals = rentals.length;
    const activeRentals = rentals.filter(
      (item) => item.status === "Active"
    ).length;
    const totalRevenue = rentals.reduce((sum, item) => {
      return (
        sum +
        (item.paymentStatus === "Paid" ? parseFloat(item.totalCost || 0) : 0)
      );
    }, 0);

    // Generate trend data (simplified for this example)
    // In a real application, you would group by date and calculate values for each period
    const borrowingsTrend = generateTrendData(borrowings, "borrowDate");
    const rentalsTrend = generateTrendData(rentals, "rentalStart");
    const revenueTrend = generateRevenueTrend(rentals);

    setReportData({
      totalEquipment,
      availableEquipment,
      inUseEquipment,
      maintenanceEquipment,
      totalBorrowings,
      activeBorrowings,
      overdueBorrowings,
      totalRentals,
      activeRentals,
      totalRevenue,
      equipmentByCategory,
      equipmentByStatus,
      borrowingsTrend,
      rentalsTrend,
      revenueTrend,
    });
  };

  // Generate trend data for charts
  const generateTrendData = (data, dateField) => {
    const trendData = [];
    const dateMap = new Map();

    // Group by date
    data.forEach((item) => {
      const date = new Date(item[dateField]);
      const dateStr = date.toISOString().split("T")[0];
      dateMap.set(dateStr, (dateMap.get(dateStr) || 0) + 1);
    });

    // Convert to array for charting
    for (const [date, count] of dateMap.entries()) {
      trendData.push({ date, count });
    }

    // Sort by date
    trendData.sort((a, b) => new Date(a.date) - new Date(b.date));

    return trendData;
  };

  // Generate revenue trend data
  const generateRevenueTrend = (rentals) => {
    const trendData = [];
    const dateMap = new Map();

    // Group by date
    rentals.forEach((item) => {
      if (item.paymentStatus === "Paid" && item.totalCost) {
        const date = new Date(item.rentalStart);
        const dateStr = date.toISOString().split("T")[0];
        dateMap.set(
          dateStr,
          (dateMap.get(dateStr) || 0) + parseFloat(item.totalCost)
        );
      }
    });

    // Convert to array for charting
    for (const [date, amount] of dateMap.entries()) {
      trendData.push({ date, amount });
    }

    // Sort by date
    trendData.sort((a, b) => new Date(a.date) - new Date(b.date));

    return trendData;
  };

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchReportData();
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleReportTypeChange = (event) => {
    setReportType(event.target.value);
  };

  const handleTimeRangeChange = (event) => {
    const range = event.target.value;
    setTimeRange(range);

    const now = new Date();
    let start = new Date();

    switch (range) {
      case "week":
        start = new Date(now.setDate(now.getDate() - 7));
        break;
      case "month":
        start = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case "quarter":
        start = new Date(now.setMonth(now.getMonth() - 3));
        break;
      case "year":
        start = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        start = new Date(now.setMonth(now.getMonth() - 1));
    }

    setStartDate(start);
    setEndDate(new Date());
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
      {/* Report Controls */}
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
            Reports & Analytics
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
              startIcon={<FileDownloadIcon />}
              sx={{
                borderRadius: 50,
                px: 2,
                bgcolor: "#8B4513",
                "&:hover": { bgcolor: "#704214" },
              }}
            >
              Export Report
            </Button>
          </Box>
        </Box>

        <Divider />

        <Box sx={{ p: 3, display: "flex", flexWrap: "wrap", gap: 2 }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel id="report-type-label">Report Type</InputLabel>
            <Select
              labelId="report-type-label"
              value={reportType}
              onChange={handleReportTypeChange}
              label="Report Type"
              size="small"
            >
              <MenuItem value="equipment">Equipment</MenuItem>
              <MenuItem value="borrowings">Borrowings</MenuItem>
              <MenuItem value="rentals">Rentals</MenuItem>
              <MenuItem value="financial">Financial</MenuItem>
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel id="time-range-label">Time Range</InputLabel>
            <Select
              labelId="time-range-label"
              value={timeRange}
              onChange={handleTimeRangeChange}
              label="Time Range"
              size="small"
            >
              <MenuItem value="week">Last Week</MenuItem>
              <MenuItem value="month">Last Month</MenuItem>
              <MenuItem value="quarter">Last Quarter</MenuItem>
              <MenuItem value="year">Last Year</MenuItem>
              <MenuItem value="custom">Custom Range</MenuItem>
            </Select>
          </FormControl>

          {timeRange === "custom" && (
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Start Date"
                value={startDate}
                onChange={setStartDate}
                renderInput={(params) => (
                  <TextField {...params} size="small" sx={{ width: 150 }} />
                )}
              />

              <DatePicker
                label="End Date"
                value={endDate}
                onChange={setEndDate}
                renderInput={(params) => (
                  <TextField {...params} size="small" sx={{ width: 150 }} />
                )}
              />
            </LocalizationProvider>
          )}
        </Box>

        <Divider />

        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            sx={{
              px: 3,
              "& .MuiTab-root": {
                textTransform: "none",
                fontWeight: "medium",
                minWidth: "auto",
                mr: 2,
                px: 1,
              },
              "& .Mui-selected": {
                fontWeight: "bold",
              },
              "& .MuiTabs-indicator": {
                height: 3,
              },
            }}
          >
            <Tab label="Overview" />
            <Tab label="Charts" />
            <Tab label="Trends" />
          </Tabs>
        </Box>
      </Paper>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Tab Content */}
          <Box sx={{ mt: 2 }}>
            {/* Overview Tab */}
            {tabValue === 0 && (
              <Grid container spacing={3}>
                {/* Equipment Stats */}
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: "medium" }}>
                    Equipment Overview
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={3}>
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
                            Total Equipment
                          </Typography>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                            }}
                          >
                            <Typography
                              variant="h3"
                              component="div"
                              sx={{
                                fontWeight: "bold",
                                color: theme.palette.primary.main,
                              }}
                            >
                              {reportData.totalEquipment}
                            </Typography>
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
                              <BarChartIcon
                                sx={{ color: theme.palette.primary.main }}
                              />
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
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
                            Available
                          </Typography>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                            }}
                          >
                            <Typography
                              variant="h3"
                              component="div"
                              sx={{ fontWeight: "bold", color: "#4caf50" }}
                            >
                              {reportData.availableEquipment}
                            </Typography>
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
                              <PieChartIcon sx={{ color: "#4caf50" }} />
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
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
                            In Use
                          </Typography>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                            }}
                          >
                            <Typography
                              variant="h3"
                              component="div"
                              sx={{ fontWeight: "bold", color: "#2196f3" }}
                            >
                              {reportData.inUseEquipment}
                            </Typography>
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
                              <PieChartIcon sx={{ color: "#2196f3" }} />
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
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
                            Maintenance
                          </Typography>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                            }}
                          >
                            <Typography
                              variant="h3"
                              component="div"
                              sx={{ fontWeight: "bold", color: "#ff9800" }}
                            >
                              {reportData.maintenanceEquipment}
                            </Typography>
                            <Box
                              sx={{
                                bgcolor: alpha("#ff9800", 0.1),
                                p: 1,
                                borderRadius: 1,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <PieChartIcon sx={{ color: "#ff9800" }} />
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Grid>

                {/* Borrowings Stats */}
                <Grid item xs={12} sx={{ mt: 2 }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: "medium" }}>
                    Borrowings Overview
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={4}>
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
                            Total Borrowings
                          </Typography>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                            }}
                          >
                            <Typography
                              variant="h3"
                              component="div"
                              sx={{
                                fontWeight: "bold",
                                color: theme.palette.primary.main,
                              }}
                            >
                              {reportData.totalBorrowings}
                            </Typography>
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
                              <BarChartIcon
                                sx={{ color: theme.palette.primary.main }}
                              />
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>

                    <Grid item xs={12} sm={6} md={4}>
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
                            Active Borrowings
                          </Typography>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                            }}
                          >
                            <Typography
                              variant="h3"
                              component="div"
                              sx={{ fontWeight: "bold", color: "#2196f3" }}
                            >
                              {reportData.activeBorrowings}
                            </Typography>
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
                              <PieChartIcon sx={{ color: "#2196f3" }} />
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>

                    <Grid item xs={12} sm={6} md={4}>
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
                            Overdue Items
                          </Typography>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                            }}
                          >
                            <Typography
                              variant="h3"
                              component="div"
                              sx={{ fontWeight: "bold", color: "#f44336" }}
                            >
                              {reportData.overdueBorrowings}
                            </Typography>
                            <Box
                              sx={{
                                bgcolor: alpha("#f44336", 0.1),
                                p: 1,
                                borderRadius: 1,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <PieChartIcon sx={{ color: "#f44336" }} />
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Grid>

                {/* Rentals Stats */}
                <Grid item xs={12} sx={{ mt: 2 }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: "medium" }}>
                    Rentals & Financial Overview
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={4}>
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
                            <Typography
                              variant="h3"
                              component="div"
                              sx={{
                                fontWeight: "bold",
                                color: theme.palette.primary.main,
                              }}
                            >
                              {reportData.totalRentals}
                            </Typography>
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
                              <BarChartIcon
                                sx={{ color: theme.palette.primary.main }}
                              />
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>

                    <Grid item xs={12} sm={6} md={4}>
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
                            <Typography
                              variant="h3"
                              component="div"
                              sx={{ fontWeight: "bold", color: "#2196f3" }}
                            >
                              {reportData.activeRentals}
                            </Typography>
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
                              <PieChartIcon sx={{ color: "#2196f3" }} />
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>

                    <Grid item xs={12} sm={6} md={4}>
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
                            <Typography
                              variant="h3"
                              component="div"
                              sx={{ fontWeight: "bold", color: "#4caf50" }}
                            >
                              {formatCurrency(reportData.totalRevenue)}
                            </Typography>
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
                              <TrendingUpIcon sx={{ color: "#4caf50" }} />
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            )}

            {/* Charts Tab */}
            {tabValue === 1 && (
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Paper
                    elevation={0}
                    sx={{ p: 3, borderRadius: 2, border: "1px solid #e0e0e0" }}
                  >
                    <Typography
                      variant="h6"
                      sx={{ mb: 3, fontWeight: "medium" }}
                    >
                      Equipment by Category
                    </Typography>
                    <Box
                      sx={{
                        height: 300,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {/* Placeholder for chart - in a real app, you would use a chart library */}
                      <Typography variant="body1" color="text.secondary">
                        Pie Chart: Equipment by Category
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Paper
                    elevation={0}
                    sx={{ p: 3, borderRadius: 2, border: "1px solid #e0e0e0" }}
                  >
                    <Typography
                      variant="h6"
                      sx={{ mb: 3, fontWeight: "medium" }}
                    >
                      Equipment by Status
                    </Typography>
                    <Box
                      sx={{
                        height: 300,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {/* Placeholder for chart */}
                      <Typography variant="body1" color="text.secondary">
                        Pie Chart: Equipment by Status
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>

                <Grid item xs={12}>
                  <Paper
                    elevation={0}
                    sx={{ p: 3, borderRadius: 2, border: "1px solid #e0e0e0" }}
                  >
                    <Typography
                      variant="h6"
                      sx={{ mb: 3, fontWeight: "medium" }}
                    >
                      Borrowings & Rentals Comparison
                    </Typography>
                    <Box
                      sx={{
                        height: 300,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {/* Placeholder for chart */}
                      <Typography variant="body1" color="text.secondary">
                        Bar Chart: Borrowings & Rentals Comparison
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            )}

            {/* Trends Tab */}
            {tabValue === 2 && (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Paper
                    elevation={0}
                    sx={{ p: 3, borderRadius: 2, border: "1px solid #e0e0e0" }}
                  >
                    <Typography
                      variant="h6"
                      sx={{ mb: 3, fontWeight: "medium" }}
                    >
                      Borrowings Trend
                    </Typography>
                    <Box
                      sx={{
                        height: 300,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {/* Placeholder for chart */}
                      <Typography variant="body1" color="text.secondary">
                        Line Chart: Borrowings Trend Over Time
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>

                <Grid item xs={12}>
                  <Paper
                    elevation={0}
                    sx={{ p: 3, borderRadius: 2, border: "1px solid #e0e0e0" }}
                  >
                    <Typography
                      variant="h6"
                      sx={{ mb: 3, fontWeight: "medium" }}
                    >
                      Rentals Trend
                    </Typography>
                    <Box
                      sx={{
                        height: 300,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {/* Placeholder for chart */}
                      <Typography variant="body1" color="text.secondary">
                        Line Chart: Rentals Trend Over Time
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>

                <Grid item xs={12}>
                  <Paper
                    elevation={0}
                    sx={{ p: 3, borderRadius: 2, border: "1px solid #e0e0e0" }}
                  >
                    <Typography
                      variant="h6"
                      sx={{ mb: 3, fontWeight: "medium" }}
                    >
                      Revenue Trend
                    </Typography>
                    <Box
                      sx={{
                        height: 300,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {/* Placeholder for chart */}
                      <Typography variant="body1" color="text.secondary">
                        Line Chart: Revenue Trend Over Time
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            )}
          </Box>
        </>
      )}
    </Container>
  );
}

export default Reports;
