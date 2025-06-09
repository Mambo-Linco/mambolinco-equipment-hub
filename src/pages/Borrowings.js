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
  Person as PersonIcon,
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

function Borrowings() {
  const theme = useTheme();
  const { showToast } = useToast();
  const [borrowings, setBorrowings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [availableEquipment, setAvailableEquipment] = useState([]);
  const [formData, setFormData] = useState({
    equipmentId: "",
    borrower: "",
    department: "",
    borrowDate: new Date(),
    expectedReturnDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default to 1 week from now
    purpose: "",
    status: "Borrowed",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stats, setStats] = useState({
    totalBorrowings: 0,
    activeBorrowings: 0,
    overdueItems: 0,
  });

  const rowsPerPage = 5;

  // Fetch borrowings data
  const fetchBorrowings = useCallback(async () => {
    try {
      setLoading(true);
      console.log("Fetching borrowings data...");

      const borrowingsRef = collection(db, "borrowings");
      const q = query(borrowingsRef, orderBy("borrowDate", "desc"));
      const querySnapshot = await getDocs(q);

      console.log("Query snapshot size:", querySnapshot.size);

      if (querySnapshot.empty) {
        console.log("No borrowings data found");
        setBorrowings([]);
        setStats({
          totalBorrowings: 0,
          activeBorrowings: 0,
          overdueItems: 0,
        });
        setLoading(false);
        return;
      }

      const borrowingItems = [];

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

        return {
          id: docSnapshot.id,
          ...data,
          equipmentName: equipmentDetails.name,
          equipmentCategory: equipmentDetails.category,
          equipmentImageUrl: equipmentDetails.imageUrl,
          // Convert Firebase timestamps to JS Date objects
          borrowDate: data.borrowDate?.toDate
            ? data.borrowDate.toDate()
            : new Date(data.borrowDate),
          expectedReturnDate: data.expectedReturnDate?.toDate
            ? data.expectedReturnDate.toDate()
            : new Date(data.expectedReturnDate),
          actualReturnDate: data.actualReturnDate?.toDate
            ? data.actualReturnDate.toDate()
            : data.actualReturnDate
            ? new Date(data.actualReturnDate)
            : null,
        };
      });

      // Wait for all promises to resolve
      const resolvedItems = await Promise.all(promises);
      setBorrowings(resolvedItems);

      // Calculate stats
      const active = resolvedItems.filter(
        (item) => item.status === "Borrowed" || item.status === "Overdue"
      ).length;

      const overdue = resolvedItems.filter((item) => {
        if (
          item.status !== "Returned" &&
          item.expectedReturnDate < new Date()
        ) {
          return true;
        }
        return item.status === "Overdue";
      }).length;

      setStats({
        totalBorrowings: resolvedItems.length,
        activeBorrowings: active,
        overdueItems: overdue,
      });

      console.log(
        "Borrowings data loaded successfully:",
        resolvedItems.length,
        "items"
      );
    } catch (error) {
      console.error("Error fetching borrowings data:", error);
      showToast(`Error loading borrowings data: ${error.message}`, "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [showToast]);

  // Fetch available equipment for borrowing
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
    fetchBorrowings();
  }, [fetchBorrowings]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchBorrowings();
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
      borrower: "",
      department: "",
      borrowDate: new Date(),
      expectedReturnDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      purpose: "",
      status: "Borrowed",
    });
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleDateChange = (name, date) => {
    setFormData({
      ...formData,
      [name]: date,
    });
  };

  const handleSubmit = async () => {
    if (!formData.equipmentId || !formData.borrower || !formData.department) {
      showToast("Please fill in all required fields", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      // Add borrowing record
      const borrowingData = {
        ...formData,
        borrowDate: formData.borrowDate || new Date(),
        expectedReturnDate:
          formData.expectedReturnDate ||
          new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, "borrowings"), borrowingData);
      console.log("Borrowing record created with ID:", docRef.id);

      // Update equipment status
      const equipmentRef = doc(db, "equipment", formData.equipmentId);
      await updateDoc(equipmentRef, {
        status: "In Use",
        lastUpdated: serverTimestamp(),
      });

      showToast("Equipment borrowed successfully!", "success");
      handleCloseDialog();
      fetchBorrowings();
    } catch (error) {
      console.error("Error creating borrowing record:", error);
      showToast(`Error: ${error.message}`, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReturnEquipment = async (borrowingId, equipmentId) => {
    if (window.confirm("Mark this equipment as returned?")) {
      try {
        // Update borrowing record
        const borrowingRef = doc(db, "borrowings", borrowingId);
        await updateDoc(borrowingRef, {
          status: "Returned",
          actualReturnDate: new Date(),
          updatedAt: serverTimestamp(),
        });

        // Update equipment status
        const equipmentRef = doc(db, "equipment", equipmentId);
        await updateDoc(equipmentRef, {
          status: "Available",
          lastUpdated: serverTimestamp(),
        });

        showToast("Equipment returned successfully!", "success");
        fetchBorrowings();
      } catch (error) {
        console.error("Error returning equipment:", error);
        showToast(`Error: ${error.message}`, "error");
      }
    }
  };

  const handleDeleteBorrowing = async (id) => {
    if (
      window.confirm("Are you sure you want to delete this borrowing record?")
    ) {
      try {
        await updateDoc(doc(db, "borrowings", id), {
          deleted: true,
          deletedAt: serverTimestamp(),
        });
        showToast("Borrowing record deleted successfully", "success");
        fetchBorrowings();
      } catch (error) {
        console.error("Error deleting borrowing record:", error);
        showToast(`Error: ${error.message}`, "error");
      }
    }
  };

  // Filter borrowings based on search term
  const filteredBorrowings = borrowings.filter((item) => {
    return (
      (item.borrower?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (item.department?.toLowerCase() || "").includes(
        searchTerm.toLowerCase()
      ) ||
      (item.equipmentName?.toLowerCase() || "").includes(
        searchTerm.toLowerCase()
      ) ||
      (item.purpose?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    );
  });

  // Paginate the filtered data
  const paginatedBorrowings = filteredBorrowings.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  // Function to get chip color based on status
  const getStatusColor = (status) => {
    switch (status) {
      case "Borrowed":
        return "primary";
      case "Returned":
        return "success";
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

  // Check if a borrowing is overdue
  const isOverdue = (item) => {
    return (
      item.status !== "Returned" &&
      new Date(item.expectedReturnDate) < new Date()
    );
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
                Total Borrowings
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
                    {stats.totalBorrowings}
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
                  <PersonIcon sx={{ color: theme.palette.primary.main }} />
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
                Active Borrowings
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
                    {stats.activeBorrowings}
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
                Overdue Items
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
                    sx={{ fontWeight: "bold", color: "#f44336" }}
                  >
                    {stats.overdueItems}
                  </Typography>
                )}
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
                  <WarningIcon sx={{ color: "#f44336" }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Borrowings Management Section */}
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
            Borrowings Management
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
                backgroundColor: "#0000FF", // Blue color
                //bgcolor: "#8B4513",
                "&:hover": { bgcolor: "#704214" },
              }}
            >
              New Borrowing
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
            placeholder="Search borrowings..."
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
                    <TableCell>Borrower</TableCell>
                    <TableCell>Department</TableCell>
                    <TableCell>Borrow Date</TableCell>
                    <TableCell>Expected Return</TableCell>
                    <TableCell>Actual Return</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedBorrowings.length > 0 ? (
                    paginatedBorrowings.map((row) => (
                      <TableRow
                        key={row.id}
                        hover
                        sx={{
                          bgcolor:
                            isOverdue(row) && row.status !== "Returned"
                              ? alpha("#f44336", 0.05)
                              : "inherit",
                        }}
                      >
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
                                <PersonIcon sx={{ color: "#bdbdbd" }} />
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
                        <TableCell sx={{ fontWeight: "medium" }}>
                          {row.borrower || "N/A"}
                        </TableCell>
                        <TableCell>{row.department || "N/A"}</TableCell>
                        <TableCell>{formatDate(row.borrowDate)}</TableCell>
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            {formatDate(row.expectedReturnDate)}
                            {isOverdue(row) && row.status !== "Returned" && (
                              <Chip
                                label="Overdue"
                                size="small"
                                color="error"
                                sx={{ ml: 1, height: 20, fontSize: "0.7rem" }}
                              />
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          {row.actualReturnDate
                            ? formatDate(row.actualReturnDate)
                            : "—"}
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
                            {row.status !== "Returned" && (
                              <Button
                                size="small"
                                variant="outlined"
                                color="success"
                                onClick={() =>
                                  handleReturnEquipment(row.id, row.equipmentId)
                                }
                                sx={{ fontSize: "0.7rem", py: 0.5 }}
                              >
                                Return
                              </Button>
                            )}
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteBorrowing(row.id)}
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
                          No borrowings found
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
                {filteredBorrowings.length > 0
                  ? Math.min(
                      (page - 1) * rowsPerPage + 1,
                      filteredBorrowings.length
                    )
                  : 0}{" "}
                to {Math.min(page * rowsPerPage, filteredBorrowings.length)} of{" "}
                {filteredBorrowings.length} entries
              </Typography>
              <Pagination
                count={Math.max(
                  1,
                  Math.ceil(filteredBorrowings.length / rowsPerPage)
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

      {/* New Borrowing Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: "bold", pb: 1 }}>
          New Borrowing
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="equipment-label">Equipment *</InputLabel>
                <Select
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
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                margin="normal"
                label="Borrower Name *"
                name="borrower"
                value={formData.borrower}
                onChange={handleFormChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                margin="normal"
                label="Department *"
                name="department"
                value={formData.department}
                onChange={handleFormChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Borrow Date"
                  value={formData.borrowDate}
                  onChange={(date) => handleDateChange("borrowDate", date)}
                  renderInput={(params) => (
                    <TextField {...params} fullWidth margin="normal" />
                  )}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Expected Return Date"
                  value={formData.expectedReturnDate}
                  onChange={(date) =>
                    handleDateChange("expectedReturnDate", date)
                  }
                  renderInput={(params) => (
                    <TextField {...params} fullWidth margin="normal" />
                  )}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                margin="normal"
                label="Purpose"
                name="purpose"
                value={formData.purpose}
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

export default Borrowings;
