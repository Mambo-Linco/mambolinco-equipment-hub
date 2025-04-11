import React, { useState } from "react";
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Tabs,
  Tab,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  IconButton,
  Pagination,
  CircularProgress,
  alpha,
  useTheme,
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
} from "@mui/icons-material";
import { Link } from "react-router-dom";
import AddEquipment from "./AddEquipment"; // Assuming you have an AddEquipment component

function Dashboard({ equipmentData, loading, stats }) {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Function to get chip color based on status
  const getStatusColor = (status) => {
    switch (status) {
      case "Available":
        return "success";
      case "Borrowed":
        return "warning";
      case "Rented":
        return "info";
      default:
        return "default";
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card elevation={0} sx={{ borderRadius: 2, height: "100%" }}>
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
                  {stats.totalEquipment.toLocaleString()}
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
          <Card elevation={0} sx={{ borderRadius: 2, height: "100%" }}>
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
                  {stats.currentlyBorrowed.toLocaleString()}
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
          <Card elevation={0} sx={{ borderRadius: 2, height: "100%" }}>
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
                  {stats.activeRentals.toLocaleString()}
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
      <Paper elevation={0} sx={{ borderRadius: 2, overflow: "hidden", mb: 4 }}>
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
            onClick={() => (window.location.href = "/equipment/add")}
            sx={{ borderRadius: 50, px: 2 }}
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
                    <TableCell>In Stock</TableCell>
                    <TableCell>Equipment ID</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Serial Number</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>Value</TableCell>
                    <TableCell>Power Voltage</TableCell>
                    <TableCell>Voltage</TableCell>
                    <TableCell>Last Updated</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {equipmentData.map((row) => (
                    <TableRow key={row.id} hover>
                      <TableCell component="th" scope="row">
                        {row.id}
                      </TableCell>
                      <TableCell sx={{ fontWeight: "medium" }}>
                        {row.name}
                      </TableCell>
                      <TableCell>{row.category}</TableCell>
                      <TableCell>
                        <Chip
                          label={row.status}
                          size="small"
                          color={getStatusColor(row.status)}
                          sx={{
                            borderRadius: 1,
                            fontWeight: "medium",
                            fontSize: "0.75rem",
                          }}
                        />
                      </TableCell>
                      <TableCell>{row.location}</TableCell>
                      <TableCell>{row.lastUpdated}</TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "center",
                            gap: 1,
                          }}
                        >
                          <IconButton size="small">
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small">
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small">
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
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
                Showing 1 to 5 of 100 entries
              </Typography>
              <Pagination count={10} shape="rounded" size="small" />
            </Box>
          </>
        )}
      </Paper>
    </Container>
  );
}

export default Dashboard;
