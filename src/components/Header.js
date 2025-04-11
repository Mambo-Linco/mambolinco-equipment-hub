import React from "react";
import { Link } from "react-router-dom"; // Add this import
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  InputBase,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme,
  alpha,
} from "@mui/material";
import {
  Search as SearchIcon,
  Menu as MenuIcon,
  ExpandMore as ExpandMoreIcon,
} from "@mui/icons-material";

function Header() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [mobileMenuAnchorEl, setMobileMenuAnchorEl] = React.useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMobileMenuOpen = (event) => {
    setMobileMenuAnchorEl(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuAnchorEl(null);
  };

  return (
    <AppBar
      position="static"
      color="default"
      elevation={0}
      sx={{ borderBottom: "1px solid #e0e0e0", bgcolor: "white" }}
    >
      <Toolbar>
        <Typography
          variant="h6"
          component="div"
          sx={{
            display: "flex",
            alignItems: "center",
            fontWeight: "bold",
            color: theme.palette.primary.main,
            flexGrow: { xs: 1, md: 0 },
          }}
        >
          EquipTrack
        </Typography>

        {isMobile ? (
          <>
            <IconButton
              color="inherit"
              aria-label="open menu"
              edge="start"
              onClick={handleMobileMenuOpen}
              sx={{ ml: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Menu
              anchorEl={mobileMenuAnchorEl}
              open={Boolean(mobileMenuAnchorEl)}
              onClose={handleMobileMenuClose}
            >
              <MenuItem onClick={handleMobileMenuClose}>Dashboard</MenuItem>
              <MenuItem onClick={handleMobileMenuClose}>Equipment</MenuItem>
              <MenuItem onClick={handleMobileMenuClose}>Borrowings</MenuItem>
              <MenuItem onClick={handleMobileMenuClose}>Rentals</MenuItem>
              <MenuItem onClick={handleMobileMenuClose}>Reports</MenuItem>
            </Menu>
          </>
        ) : (
          <Box sx={{ display: "flex", ml: 4 }}>
            <Button
              color="inherit"
              sx={{ fontWeight: "bold" }}
              onClick={() => (window.location.href = "/")}
            >
              Dashboard
            </Button>
            <Button
              color="inherit"
              onClick={() => (window.location.href = "/equipment")}
            >
              Equipment
            </Button>
            {/*<Button color="inherit">Equipment</Button>*/}
            <Button
              color="inherit"
              onClick={() => (window.location.href = "/equipment")}
            >
              Borrowings
            </Button>
            <Button
              color="inherit"
              onClick={() => (window.location.href = "/equipment")}
            >
              Rentals
            </Button>
            <Button
              color="inherit"
              endIcon={<ExpandMoreIcon sx={{ fontSize: "1rem" }} />}
              onClick={handleMenuOpen}
            >
              Reports
            </Button>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={handleMenuClose}>Usage Reports</MenuItem>
              <MenuItem onClick={handleMenuClose}>Maintenance Reports</MenuItem>
              <MenuItem onClick={handleMenuClose}>Financial Reports</MenuItem>
            </Menu>
          </Box>
        )}

        <Box sx={{ flexGrow: 1 }} />

        <Box
          sx={{
            position: "relative",
            borderRadius: 1,
            bgcolor: alpha("#f5f5f5", 0.9),
            "&:hover": { bgcolor: alpha("#f5f5f5", 1) },
            mr: 2,
            width: { xs: "40%", sm: "auto" },
            maxWidth: { sm: 300 },
          }}
        >
          <Box
            sx={{
              position: "absolute",
              display: "flex",
              alignItems: "center",
              pl: 1,
              pointerEvents: "none",
              height: "100%",
            }}
          >
            <SearchIcon sx={{ color: "text.secondary", fontSize: "1.2rem" }} />
          </Box>
          <InputBase
            placeholder="Search equipment..."
            sx={{ pl: 4, pr: 1, py: 0.75, width: "100%" }}
          />
        </Box>

        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Typography
            variant="body2"
            sx={{ mr: 1, display: { xs: "none", sm: "block" } }}
          >
            Mambo Linco
          </Typography>
          <Avatar
            sx={{ width: 32, height: 32, bgcolor: theme.palette.primary.main }}
          >
            ML
          </Avatar>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Header;
