import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Paper,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Pagination,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  alpha,
  useTheme,
} from "@mui/material";
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Build as BuildIcon,
  Category as CategoryIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";

import { ListItemIcon, ListItemText } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  updateDoc,
  deleteDoc,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import { useToast } from "../components/Toast";
import Header from "../components/Header";
import Footer from "../components/Footer";

function Equipment() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [page, setPage] = useState(1);
  const [categories, setCategories] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [equipmentToDelete, setEquipmentToDelete] = useState(null);
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'
  const [stats, setStats] = useState({
    totalEquipment: 0,
    availableEquipment: 0,
    inUseEquipment: 0,
    maintenanceEquipment: 0,
  });

  const rowsPerPage = 8;

  // Fetch equipment data
  const fetchEquipment = useCallback(async () => {
    try {
      setLoading(true);
      console.log("Fetching equipment data...");

      const equipmentRef = collection(db, "equipment");
      const q = query(equipmentRef, orderBy("name", "asc"));
      const querySnapshot = await getDocs(q);

      console.log("Query snapshot size:", querySnapshot.size);

      if (querySnapshot.empty) {
        console.log("No equipment data found");
        setEquipment([]);
        setStats({
          totalEquipment: 0,
          availableEquipment: 0,
          inUseEquipment: 0,
          maintenanceEquipment: 0,
        });
        setLoading(false);
        return;
      }

      const equipmentItems = [];
      const uniqueCategories = new Set();

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        equipmentItems.push({
          id: doc.id,
          ...data,
          // Convert Firebase timestamps to JS Date objects if they exist
          purchaseDate: data.purchaseDate?.toDate
            ? data.purchaseDate.toDate()
            : data.purchaseDate
            ? new Date(data.purchaseDate)
            : null,
          lastMaintenance: data.lastMaintenance?.toDate
            ? data.lastMaintenance.toDate()
            : data.lastMaintenance
            ? new Date(data.lastMaintenance)
            : null,
          nextMaintenance: data.nextMaintenance?.toDate
            ? data.nextMaintenance.toDate()
            : data.nextMaintenance
            ? new Date(data.nextMaintenance)
            : null,
        });

        if (data.category) {
          uniqueCategories.add(data.category);
        }
      });

      setEquipment(equipmentItems);
      setCategories(Array.from(uniqueCategories).sort());

      // Calculate stats
      const available = equipmentItems.filter(
        (item) => item.status === "Available"
      ).length;
      const inUse = equipmentItems.filter(
        (item) => item.status === "In Use" || item.status === "Rented"
      ).length;
      const maintenance = equipmentItems.filter(
        (item) => item.status === "Maintenance"
      ).length;

      setStats({
        totalEquipment: equipmentItems.length,
        availableEquipment: available,
        inUseEquipment: inUse,
        maintenanceEquipment: maintenance,
      });

      console.log(
        "Equipment data loaded successfully:",
        equipmentItems.length,
        "items"
      );
    } catch (error) {
      console.error("Error fetching equipment data:", error);
      showToast(`Error loading equipment data: ${error.message}`, "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchEquipment();
  }, [fetchEquipment]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchEquipment();
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(1); // Reset to first page when searching
  };

  const handleFilterCategoryChange = (event) => {
    setFilterCategory(event.target.value);
    setPage(1); // Reset to first page when filtering
  };

  const handleFilterStatusChange = (event) => {
    setFilterStatus(event.target.value);
    setPage(1); // Reset to first page when filtering
  };

  const handleSortChange = (event) => {
    setSortBy(event.target.value);
  };

  const handleSortDirectionChange = () => {
    setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleMenuOpen = (event, equipment) => {
    setAnchorEl(event.currentTarget);
    setSelectedEquipment(equipment);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleViewEquipment = () => {
    if (selectedEquipment) {
      navigate(`/equipment/view/${selectedEquipment.id}`);
    }
    handleMenuClose();
  };

  const handleEditEquipment = () => {
    if (selectedEquipment) {
      navigate(`/equipment/edit/${selectedEquipment.id}`);
    }
    handleMenuClose();
  };

  const handleDeleteDialogOpen = () => {
    setEquipmentToDelete(selectedEquipment);
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
    setEquipmentToDelete(null);
  };

  const handleDeleteEquipment = async () => {
    if (!equipmentToDelete) return;

    try {
      // Soft delete - update the document with a deleted flag
      await updateDoc(doc(db, "equipment", equipmentToDelete.id), {
        deleted: true,
        deletedAt: serverTimestamp(),
      });

      showToast("Equipment deleted successfully", "success");
      fetchEquipment();
    } catch (error) {
      console.error("Error deleting equipment:", error);
      showToast(`Error deleting equipment: ${error.message}`, "error");
    } finally {
      handleDeleteDialogClose();
    }
  };

  const toggleViewMode = () => {
    setViewMode((prev) => (prev === "grid" ? "list" : "grid"));
  };

  // Filter and sort equipment
  const filteredEquipment = equipment.filter((item) => {
    const matchesSearch =
      (item.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (item.description?.toLowerCase() || "").includes(
        searchTerm.toLowerCase()
      ) ||
      (item.equipmentId?.toLowerCase() || "").includes(
        searchTerm.toLowerCase()
      );

    const matchesCategory = filterCategory
      ? item.category === filterCategory
      : true;
    const matchesStatus = filterStatus ? item.status === filterStatus : true;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Sort equipment
  const sortedEquipment = [...filteredEquipment].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case "name":
        comparison = (a.name || "").localeCompare(b.name || "");
        break;
      case "category":
        comparison = (a.category || "").localeCompare(b.category || "");
        break;
      case "status":
        comparison = (a.status || "").localeCompare(b.status || "");
        break;
      case "purchaseDate":
        const dateA = a.purchaseDate ? new Date(a.purchaseDate).getTime() : 0;
        const dateB = b.purchaseDate ? new Date(b.purchaseDate).getTime() : 0;
        comparison = dateA - dateB;
        break;
      default:
        comparison = (a.name || "").localeCompare(b.name || "");
    }

    return sortDirection === "asc" ? comparison : -comparison;
  });

  // Paginate the sorted data
  const paginatedEquipment = sortedEquipment.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  // Function to get chip color based on status
  const getStatusColor = (status) => {
    switch (status) {
      case "Available":
        return "success";
      case "In Use":
      case "Rented":
        return "primary";
      case "Maintenance":
        return "warning";
      case "Out of Order":
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

  return (
    <>
      {/*<Header />*/}
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
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
                      {stats.totalEquipment}
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
                    <BuildIcon sx={{ color: theme.palette.primary.main }} />
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
                  {loading ? (
                    <Skeleton variant="text" width={80} height={60} />
                  ) : (
                    <Typography
                      variant="h3"
                      component="div"
                      sx={{ fontWeight: "bold", color: "#4caf50" }}
                    >
                      {stats.availableEquipment}
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
                    <CheckCircleIcon sx={{ color: "#4caf50" }} />
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
                  {loading ? (
                    <Skeleton variant="text" width={80} height={60} />
                  ) : (
                    <Typography
                      variant="h3"
                      component="div"
                      sx={{ fontWeight: "bold", color: "#2196f3" }}
                    >
                      {stats.inUseEquipment}
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
                    <PersonIcon sx={{ color: "#2196f3" }} />
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
                  {loading ? (
                    <Skeleton variant="text" width={80} height={60} />
                  ) : (
                    <Typography
                      variant="h3"
                      component="div"
                      sx={{ fontWeight: "bold", color: "#ff9800" }}
                    >
                      {stats.maintenanceEquipment}
                    </Typography>
                  )}
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
                    <BuildIcon sx={{ color: "#ff9800" }} />
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
              Equipment Inventory
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
                Add Equipment
              </Button>
            </Box>
          </Box>

          <Box
            sx={{
              p: 3,
              display: "flex",
              flexWrap: "wrap",
              gap: 2,
              borderBottom: "1px solid #f0f0f0",
            }}
          >
            <TextField
              placeholder="Search equipment..."
              size="small"
              value={searchTerm}
              onChange={handleSearchChange}
              sx={{ width: { xs: "100%", sm: 250 } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel id="category-filter-label">Category</InputLabel>
              <Select
                labelId="category-filter-label"
                value={filterCategory}
                onChange={handleFilterCategoryChange}
                label="Category"
              >
                <MenuItem value="">All Categories</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel id="status-filter-label">Status</InputLabel>
              <Select
                labelId="status-filter-label"
                value={filterStatus}
                onChange={handleFilterStatusChange}
                label="Status"
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="Available">Available</MenuItem>
                <MenuItem value="In Use">In Use</MenuItem>
                <MenuItem value="Rented">Rented</MenuItem>
                <MenuItem value="Maintenance">Maintenance</MenuItem>
                <MenuItem value="Out of Order">Out of Order</MenuItem>
              </Select>
            </FormControl>

            <Box sx={{ display: "flex", ml: "auto", gap: 1 }}>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel id="sort-by-label">Sort By</InputLabel>
                <Select
                  labelId="sort-by-label"
                  value={sortBy}
                  onChange={handleSortChange}
                  label="Sort By"
                >
                  <MenuItem value="name">Name</MenuItem>
                  <MenuItem value="category">Category</MenuItem>
                  <MenuItem value="status">Status</MenuItem>
                  <MenuItem value="purchaseDate">Purchase Date</MenuItem>
                </Select>
              </FormControl>

              <Button
                onClick={handleSortDirectionChange}
                variant="outlined"
                size="small"
                sx={{ minWidth: 40, px: 1 }}
              >
                {sortDirection === "asc" ? "↑" : "↓"}
              </Button>

              <Button
                onClick={toggleViewMode}
                variant="outlined"
                size="small"
                sx={{ minWidth: 40, px: 1 }}
              >
                {viewMode === "grid" ? "≡" : "⊞"}
              </Button>
            </Box>
          </Box>

          {loading ? (
            <Box sx={{ p: 3 }}>
              <Grid container spacing={3}>
                {[...Array(4)].map((_, index) => (
                  <Grid item xs={12} sm={6} md={3} key={index}>
                    <Card sx={{ height: "100%" }}>
                      <Skeleton variant="rectangular" height={160} />
                      <CardContent>
                        <Skeleton variant="text" />
                        <Skeleton variant="text" width="60%" />
                        <Skeleton variant="text" width="40%" />
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          ) : (
            <>
              {viewMode === "grid" ? (
                <Box sx={{ p: 3 }}>
                  {paginatedEquipment.length > 0 ? (
                    <Grid container spacing={3}>
                      {paginatedEquipment.map((item) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}>
                          <Card
                            elevation={0}
                            sx={{
                              height: "100%",
                              display: "flex",
                              flexDirection: "column",
                              border: "1px solid #e0e0e0",
                              borderRadius: 2,
                              transition: "transform 0.2s, box-shadow 0.2s",
                              "&:hover": {
                                transform: "translateY(-4px)",
                                boxShadow: "0 6px 12px rgba(0,0,0,0.1)",
                              },
                            }}
                          >
                            <Box sx={{ position: "relative" }}>
                              {item.imageUrl ? (
                                <CardMedia
                                  component="img"
                                  height="160"
                                  image={item.imageUrl}
                                  alt={item.name}
                                  sx={{ objectFit: "cover" }}
                                  loading="lazy"
                                />
                              ) : (
                                <Box
                                  sx={{
                                    height: 160,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    bgcolor: "#f5f5f5",
                                  }}
                                >
                                  <BuildIcon
                                    sx={{ fontSize: 60, color: "#bdbdbd" }}
                                  />
                                </Box>
                              )}
                              <Box
                                sx={{
                                  position: "absolute",
                                  top: 8,
                                  right: 8,
                                  zIndex: 1,
                                }}
                              >
                                <IconButton
                                  size="small"
                                  onClick={(e) => handleMenuOpen(e, item)}
                                  sx={{
                                    bgcolor: "rgba(255, 255, 255, 0.8)",
                                    "&:hover": {
                                      bgcolor: "rgba(255, 255, 255, 0.9)",
                                    },
                                  }}
                                >
                                  <MoreVertIcon fontSize="small" />
                                </IconButton>
                              </Box>
                            </Box>

                            <CardContent
                              sx={{
                                flexGrow: 1,
                                display: "flex",
                                flexDirection: "column",
                              }}
                            >
                              <Box sx={{ mb: 1 }}>
                                <Chip
                                  label={item.status || "Unknown"}
                                  size="small"
                                  color={getStatusColor(item.status)}
                                  sx={{
                                    borderRadius: 1,
                                    fontWeight: "medium",
                                    fontSize: "0.75rem",
                                    mb: 1,
                                  }}
                                />
                              </Box>

                              <Typography
                                variant="h6"
                                component="h3"
                                sx={{ fontWeight: "medium", mb: 0.5 }}
                              >
                                {item.name}
                              </Typography>

                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mb: 1 }}
                              >
                                ID: {item.equipmentId || "N/A"}
                              </Typography>

                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  mb: 1,
                                }}
                              >
                                <CategoryIcon
                                  fontSize="small"
                                  sx={{ color: "text.secondary", mr: 0.5 }}
                                />
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  {item.category || "Uncategorized"}
                                </Typography>
                              </Box>

                              {item.description && (
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  sx={{
                                    mb: 1,
                                    display: "-webkit-box",
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: "vertical",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                  }}
                                >
                                  {item.description}
                                </Typography>
                              )}

                              <Box
                                sx={{
                                  mt: "auto",
                                  pt: 1,
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                <CalendarIcon
                                  fontSize="small"
                                  sx={{ color: "text.secondary", mr: 0.5 }}
                                />
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  Purchased: {formatDate(item.purchaseDate)}
                                </Typography>
                              </Box>
                            </CardContent>

                            <Box
                              sx={{
                                p: 2,
                                pt: 0,
                                display: "flex",
                                justifyContent: "space-between",
                              }}
                            >
                              <Button
                                size="small"
                                startIcon={<VisibilityIcon />}
                                component={Link}
                                to={`/equipment/view/${item.id}`}
                              >
                                View
                              </Button>
                              <Button
                                size="small"
                                startIcon={<EditIcon />}
                                component={Link}
                                to={`/equipment/edit/${item.id}`}
                              >
                                Edit
                              </Button>
                            </Box>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    <Box sx={{ py: 4, textAlign: "center" }}>
                      <Typography variant="h6" color="text.secondary">
                        No equipment found
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 1 }}
                      >
                        Try adjusting your search or filters
                      </Typography>
                    </Box>
                  )}
                </Box>
              ) : (
                <Box sx={{ p: 3 }}>
                  {paginatedEquipment.length > 0 ? (
                    paginatedEquipment.map((item) => (
                      <Card
                        key={item.id}
                        elevation={0}
                        sx={{
                          mb: 2,
                          border: "1px solid #e0e0e0",
                          borderRadius: 2,
                          transition: "transform 0.2s, box-shadow 0.2s",
                          "&:hover": {
                            transform: "translateY(-2px)",
                            boxShadow: "0 4px 8px rgba(0,0,0,0.05)",
                          },
                        }}
                      >
                        <Box sx={{ display: "flex", p: 2 }}>
                          {item.imageUrl ? (
                            <Box
                              component="img"
                              src={item.imageUrl}
                              alt={item.name}
                              sx={{
                                width: 100,
                                height: 100,
                                objectFit: "cover",
                                borderRadius: 1,
                                mr: 2,
                              }}
                              loading="lazy"
                            />
                          ) : (
                            <Box
                              sx={{
                                width: 100,
                                height: 100,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                bgcolor: "#f5f5f5",
                                borderRadius: 1,
                                mr: 2,
                              }}
                            >
                              <BuildIcon
                                sx={{ fontSize: 40, color: "#bdbdbd" }}
                              />
                            </Box>
                          )}

                          <Box sx={{ flexGrow: 1 }}>
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "flex-start",
                              }}
                            >
                              <Box>
                                <Typography
                                  variant="h6"
                                  component="h3"
                                  sx={{ fontWeight: "medium" }}
                                >
                                  {item.name}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  ID: {item.equipmentId || "N/A"} | Category:{" "}
                                  {item.category || "Uncategorized"}
                                </Typography>
                              </Box>

                              <Box>
                                <Chip
                                  label={item.status || "Unknown"}
                                  size="small"
                                  color={getStatusColor(item.status)}
                                  sx={{
                                    borderRadius: 1,
                                    fontWeight: "medium",
                                    fontSize: "0.75rem",
                                  }}
                                />
                              </Box>
                            </Box>

                            {item.description && (
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{
                                  mt: 1,
                                  display: "-webkit-box",
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: "vertical",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                              >
                                {item.description}
                              </Typography>
                            )}

                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                mt: 2,
                              }}
                            >
                              <Box
                                sx={{ display: "flex", alignItems: "center" }}
                              >
                                <CalendarIcon
                                  fontSize="small"
                                  sx={{ color: "text.secondary", mr: 0.5 }}
                                />
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  Purchased: {formatDate(item.purchaseDate)}
                                </Typography>
                              </Box>

                              <Box sx={{ display: "flex", gap: 1 }}>
                                <Button
                                  size="small"
                                  startIcon={<VisibilityIcon />}
                                  component={Link}
                                  to={`/equipment/view/${item.id}`}
                                >
                                  View
                                </Button>
                                <Button
                                  size="small"
                                  startIcon={<EditIcon />}
                                  component={Link}
                                  to={`/equipment/edit/${item.id}`}
                                >
                                  Edit
                                </Button>
                                <IconButton
                                  size="small"
                                  onClick={(e) => handleMenuOpen(e, item)}
                                >
                                  <MoreVertIcon fontSize="small" />
                                </IconButton>
                              </Box>
                            </Box>
                          </Box>
                        </Box>
                      </Card>
                    ))
                  ) : (
                    <Box sx={{ py: 4, textAlign: "center" }}>
                      <Typography variant="h6" color="text.secondary">
                        No equipment found
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 1 }}
                      >
                        Try adjusting your search or filters
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}

              <Box
                sx={{
                  p: 2,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderTop: "1px solid #f0f0f0",
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Showing{" "}
                  {filteredEquipment.length > 0
                    ? Math.min(
                        (page - 1) * rowsPerPage + 1,
                        filteredEquipment.length
                      )
                    : 0}{" "}
                  to {Math.min(page * rowsPerPage, filteredEquipment.length)} of{" "}
                  {filteredEquipment.length} entries
                </Typography>
                <Pagination
                  count={Math.max(
                    1,
                    Math.ceil(filteredEquipment.length / rowsPerPage)
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
      </Container>

      {/* Equipment Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: "visible",
            filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.1))",
            mt: 1.5,
            "& .MuiMenuItem-root": {
              px: 2,
              py: 1,
            },
          },
        }}
      >
        <MenuItem onClick={handleViewEquipment}>
          <ListItemIcon>
            <VisibilityIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleEditEquipment}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit Equipment</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDeleteDialogOpen}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" sx={{ color: "#f44336" }} />
          </ListItemIcon>
          <ListItemText sx={{ color: "#f44336" }}>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteDialogClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete "{equipmentToDelete?.name}"? This
            action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose}>Cancel</Button>
          <Button onClick={handleDeleteEquipment} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default Equipment;
