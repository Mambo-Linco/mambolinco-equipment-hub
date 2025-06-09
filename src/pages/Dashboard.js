import React, { useState, useEffect } from "react";
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
  CircularProgress,
  Pagination,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  alpha,
  useTheme,
  Checkbox,
} from "@mui/material";
import {
  Inventory as InventoryIcon,
  Sync as SyncIcon,
  AttachMoney as MoneyIcon,
  Add as AddIcon,
  FilterList as FilterListIcon,
  FileDownload as FileDownloadIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import { Link } from "react-router-dom";
import {
  collection,
  getDocs,
  query,
  orderBy,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { ref, getDownloadURL } from "firebase/storage";
import { styled } from "@mui/system"; // Import styled from MUI system
import { db, storage } from "../firebase.js"; // Adjust path as needed

function Dashboard() {
  const theme = useTheme();
  const [equipmentData, setEquipmentData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [stats, setStats] = useState({
    totalEquipment: 0,
    currentlyBorrowed: 0,
    activeRentals: 0,
  });

  const rowsPerPage = 10;

  useEffect(() => {
    fetchEquipmentData();
  }, []);
  const StyledTableCell = styled(TableCell)(({ theme }) => ({
    //backgroundColor: "#614438", // Custom brown color
    color: "white", // Text color
    fontWeight: "bold", // Bold text
    backgroundColor: "#0000FF", // Blue color
    //backgroundColor: "#ADD8E6",
    //color: "#fff",
    fontStyle: "italic",
  }));

  const fetchEquipmentData = async () => {
    try {
      setLoading(true);
      const equipmentRef = collection(db, "equipment");
      const q = query(equipmentRef, orderBy("lastUpdated", "desc"));
      const querySnapshot = await getDocs(q);

      const equipmentItems = [];

      for (const docSnapshot of querySnapshot.docs) {
        const data = docSnapshot.data();
        let imageUrl = null;

        // If there's an image path, get the download URL
        if (data.imagePath) {
          try {
            const imageRef = ref(storage, data.imagePath);
            imageUrl = await getDownloadURL(imageRef);
          } catch (error) {
            console.error("Error getting image URL:", error);
          }
        }

        equipmentItems.push({
          id: docSnapshot.id,
          ...data,
          imageUrl,
        });
      }

      setEquipmentData(equipmentItems);

      // Calculate stats
      const borrowed = equipmentItems.filter(
        (item) => item.status === "In Use" || item.status === "Borrowed"
      ).length;
      const rented = equipmentItems.filter(
        (item) => item.status === "Rented"
      ).length;

      setStats({
        totalEquipment: equipmentItems.length,
        currentlyBorrowed: borrowed,
        activeRentals: rented,
      });

      setLoading(false);
    } catch (error) {
      console.error("Error fetching equipment data:", error);
      setLoading(false);
    }
  };

  const handleDeleteEquipment = async (id) => {
    if (window.confirm("Are you sure you want to delete this equipment?")) {
      try {
        await deleteDoc(doc(db, "equipment", id));
        // Refresh the data
        fetchEquipmentData();
      } catch (error) {
        console.error("Error deleting equipment:", error);
      }
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(1); // Reset to first page when searching
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  // Filter equipment based on tab and search term
  const filteredEquipment = equipmentData.filter((item) => {
    const matchesSearch =
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.equipmentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location?.toLowerCase().includes(searchTerm.toLowerCase());

    if (tabValue === 0) return matchesSearch; // All Equipment
    if (tabValue === 1) return matchesSearch && item.status === "Available"; // Available
    if (tabValue === 2)
      return (
        matchesSearch &&
        (item.status === "In Use" || item.status === "Borrowed")
      ); // Borrowed
    if (tabValue === 3) return matchesSearch && item.status === "Rented"; // Rented

    return matchesSearch;
  });

  // Paginate the filtered data
  const paginatedEquipment = filteredEquipment.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

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
                  sx={{ fontWeight: "bold", color: theme.palette.primary.main }}
                >
                  {stats.totalEquipment}
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
                  <InventoryIcon sx={{ color: theme.palette.primary.main }} />
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
                Currently Borrowed
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
                  {stats.currentlyBorrowed}
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
                  <SyncIcon sx={{ color: "#ff9800" }} />
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
                <Typography
                  variant="h3"
                  component="div"
                  sx={{ fontWeight: "bold", color: "#4caf50" }}
                >
                  {stats.activeRentals}
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
                  <MoneyIcon sx={{ color: "#4caf50" }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Equipment Management Section */}
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
            Equipment Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            component={Link}
            to="/equipment/add"
            sx={{
              borderRadius: 50,
              px: 2,
              backgroundColor: "#0000FF", // Blue color
              //bgcolor: "#8B4513",
              "&:hover": { bgcolor: "#704214" },
            }}
          >
            Add New Equipment
          </Button>
        </Box>

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
            <Tab label="All Equipment" />
            <Tab label="Available" />
            <Tab label="Borrowed" />
            <Tab label="Rented" />
          </Tabs>
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
            placeholder="Search equipment..."
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
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table sx={{ minWidth: 650 }}>
                <TableHead sx={{ bgcolor: "#fafafa" }}>
                  <TableRow>
                    <StyledTableCell>In Stock</StyledTableCell>
                    <StyledTableCell>Image</StyledTableCell>
                    <StyledTableCell>Equipment ID</StyledTableCell>
                    <StyledTableCell>Name</StyledTableCell>
                    <StyledTableCell>Serial Number</StyledTableCell>
                    <StyledTableCell>Category</StyledTableCell>
                    <StyledTableCell>Status</StyledTableCell>
                    <StyledTableCell>Location</StyledTableCell>
                    <StyledTableCell>Value</StyledTableCell>
                    <StyledTableCell>Issues</StyledTableCell>
                    <StyledTableCell>Power Voltage</StyledTableCell>
                    <StyledTableCell>Voltage</StyledTableCell>
                    <StyledTableCell>Last Updated</StyledTableCell>
                    <StyledTableCell align="center">Actions</StyledTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedEquipment.length > 0 ? (
                    paginatedEquipment.map((row) => (
                      <TableRow key={row.id} hover>
                        <TableCell>
                          <Checkbox
                            checked={row.inStock || false} // Checkbox is checked if inStock is true
                            onChange={() => {}} // Optional: Add functionality if needed
                            sx={{
                              color: row.inStock ? "red" : "default", // Red color if checked
                              "&.Mui-checked": {
                                color: "blue", // Red color when checked
                              },
                            }}
                            disabled // Disable the checkbox to make it read-only
                          />
                        </TableCell>{" "}
                        <TableCell>
                          {row.imageUrl ? (
                            <Box
                              component="img"
                              src={row.imageUrl}
                              alt={row.name}
                              sx={{
                                width: 60,
                                height: 60,
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
                                width: 60,
                                height: 60,
                                bgcolor: "#f5f5f5",
                                borderRadius: 1,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                border: "1px solid #e0e0e0",
                              }}
                            >
                              <InventoryIcon sx={{ color: "#bdbdbd" }} />
                            </Box>
                          )}
                        </TableCell>
                        <TableCell>{row.equipmentId || "N/A"}</TableCell>
                        <TableCell sx={{ fontWeight: "medium" }}>
                          {row.name || "N/A"}
                        </TableCell>
                        <TableCell sx={{ fontWeight: "medium" }}>
                          {row.serialNumber || "N/A"}
                        </TableCell>
                        <TableCell>{row.category || "N/A"}</TableCell>
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
                        <TableCell>{row.location || "N/A"}</TableCell>
                        <TableCell>
                          ${parseFloat(row.value || 0).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {parseFloat(row.issues || 0).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {parseFloat(row.powerVoltage || 0).toLocaleString()}
                          Volts
                        </TableCell>
                        <TableCell>
                          {parseFloat(row.voltage || 0).toLocaleString()} Volts
                        </TableCell>
                        <TableCell>{formatDate(row.lastUpdated)}</TableCell>
                        <TableCell>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "center",
                              gap: 1,
                            }}
                          >
                            <IconButton
                              size="small"
                              component={Link}
                              to={`/equipment/view/${row.id}`}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              component={Link}
                              to={`/equipment/edit/${row.id}`}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteEquipment(row.id)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={9} align="center" sx={{ py: 3 }}>
                        <Typography variant="body1" color="text.secondary">
                          No equipment found
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
                {Math.min(
                  (page - 1) * rowsPerPage + 1,
                  filteredEquipment.length
                )}{" "}
                to {Math.min(page * rowsPerPage, filteredEquipment.length)} of{" "}
                {filteredEquipment.length} entries
              </Typography>
              <Pagination
                count={Math.ceil(filteredEquipment.length / rowsPerPage)}
                page={page}
                onChange={handlePageChange}
                shape="rounded"
                size="small"
              />
            </Box>
          </>
        )}
      </Paper>
    </Container>
  );
}

export default Dashboard;
