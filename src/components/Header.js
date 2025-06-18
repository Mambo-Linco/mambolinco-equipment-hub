// /*import React from "react";
// import { Link } from "react-router-dom"; // Add this import
// import {
//   AppBar,
//   Toolbar,
//   Typography,
//   Button,
//   Box,
//   InputBase,
//   Avatar,
//   IconButton,
//   Menu,
//   MenuItem,
//   useMediaQuery,
//   useTheme,
//   alpha,
// } from "@mui/material";
// import {
//   Search as SearchIcon,
//   Menu as MenuIcon,
//   ExpandMore as ExpandMoreIcon,
// } from "@mui/icons-material";

// function Header() {
//   const theme = useTheme();
//   const isMobile = useMediaQuery(theme.breakpoints.down("md"));
//   const [anchorEl, setAnchorEl] = React.useState(null);
//   const [mobileMenuAnchorEl, setMobileMenuAnchorEl] = React.useState(null);

//   const handleMenuOpen = (event) => {
//     setAnchorEl(event.currentTarget);
//   };

//   const handleMenuClose = () => {
//     setAnchorEl(null);
//   };

//   const handleMobileMenuOpen = (event) => {
//     setMobileMenuAnchorEl(event.currentTarget);
//   };

//   const handleMobileMenuClose = () => {
//     setMobileMenuAnchorEl(null);
//   };

//   return (
//     <AppBar
//       position="static"
//       color="default"
//       elevation={0}
//       sx={{ borderBottom: "1px solid #e0e0e0", bgcolor: "white" }}
//     >
//       <Toolbar>
//         <Typography
//           variant="h6"
//           component="div"
//           sx={{
//             display: "flex",
//             alignItems: "center",
//             fontWeight: "bold",
//             color: theme.palette.primary.main,
//             flexGrow: { xs: 1, md: 0 },
//           }}
//         >
//           EquipTrack
//         </Typography>

//         {isMobile ? (
//           <>
//             <IconButton
//               color="inherit"
//               aria-label="open menu"
//               edge="start"
//               onClick={handleMobileMenuOpen}
//               sx={{ ml: 2 }}
//             >
//               <MenuIcon />
//             </IconButton>
//             <Menu
//               anchorEl={mobileMenuAnchorEl}
//               open={Boolean(mobileMenuAnchorEl)}
//               onClose={handleMobileMenuClose}
//             >
//               <MenuItem onClick={handleMobileMenuClose}>Dashboard</MenuItem>
//               <MenuItem onClick={handleMobileMenuClose}>Equipment</MenuItem>
//               <MenuItem onClick={handleMobileMenuClose}>Borrowings</MenuItem>
//               <MenuItem onClick={handleMobileMenuClose}>Rentals</MenuItem>
//               <MenuItem onClick={handleMobileMenuClose}>Reports</MenuItem>
//             </Menu>
//           </>
//         ) : (
//           <Box sx={{ display: "flex", ml: 4 }}>
//             <Button
//               color="inherit"
//               sx={{ fontWeight: "bold" }}
//               onClick={() => (window.location.href = "/")}
//             >
//               Dashboard
//             </Button>
//             <Button
//               color="inherit"
//               onClick={() => (window.location.href = "/equipment")}
//             >
//               Equipment
//             </Button>
//             {/*<Button color="inherit">Equipment</Button>/}
//             <Button
//               color="inherit"
//               onClick={() => (window.location.href = "/equipment")}
//             >
//               Borrowings
//             </Button>
//             <Button
//               color="inherit"
//               onClick={() => (window.location.href = "/equipment")}
//             >
//               Rentals
//             </Button>
//             <Button
//               color="inherit"
//               endIcon={<ExpandMoreIcon sx={{ fontSize: "1rem" }} />}
//               onClick={handleMenuOpen}
//             >
//               Reports
//             </Button>
//             <Menu
//               anchorEl={anchorEl}
//               open={Boolean(anchorEl)}
//               onClose={handleMenuClose}
//             >
//               <MenuItem onClick={handleMenuClose}>Usage Reports</MenuItem>
//               <MenuItem onClick={handleMenuClose}>Maintenance Reports</MenuItem>
//               <MenuItem onClick={handleMenuClose}>Financial Reports</MenuItem>
//             </Menu>
//           </Box>
//         )}

//         <Box sx={{ flexGrow: 1 }} />

//         <Box
//           sx={{
//             position: "relative",
//             borderRadius: 1,
//             bgcolor: alpha("#f5f5f5", 0.9),
//             "&:hover": { bgcolor: alpha("#f5f5f5", 1) },
//             mr: 2,
//             width: { xs: "40%", sm: "auto" },
//             maxWidth: { sm: 300 },
//           }}
//         >
//           <Box
//             sx={{
//               position: "absolute",
//               display: "flex",
//               alignItems: "center",
//               pl: 1,
//               pointerEvents: "none",
//               height: "100%",
//             }}
//           >
//             <SearchIcon sx={{ color: "text.secondary", fontSize: "1.2rem" }} />
//           </Box>
//           <InputBase
//             placeholder="Search equipment..."
//             sx={{ pl: 4, pr: 1, py: 0.75, width: "100%" }}
//           />
//         </Box>

//         <Box sx={{ display: "flex", alignItems: "center" }}>
//           <Typography
//             variant="body2"
//             sx={{ mr: 1, display: { xs: "none", sm: "block" } }}
//           >
//             Mambo Linco
//           </Typography>
//           <Avatar
//             sx={{ width: 32, height: 32, bgcolor: theme.palette.primary.main }}
//           >
//             ML
//           </Avatar>
//         </Box>
//       </Toolbar>
//     </AppBar>
//   );
// }

// export default Header;*/

// import React, { useState } from "react";
// import {
//   AppBar,
//   Toolbar,
//   Typography,
//   Button,
//   IconButton,
//   Box,
//   Menu,
//   MenuItem,
//   Drawer,
//   List,
//   ListItem,
//   ListItemIcon,
//   ListItemText,
//   Divider,
//   Avatar,
//   useMediaQuery,
//   useTheme,
// } from "@mui/material";
// import {
//   Menu as MenuIcon,
//   Dashboard as DashboardIcon,
//   Build as BuildIcon,
//   Person as PersonIcon,
//   Settings as SettingsIcon,
//   Logout as LogoutIcon,
//   Add as AddIcon,
//   BarChart as BarChartIcon,
//   Receipt as ReceiptIcon,
//   AttachMoney as MoneyIcon,
// } from "@mui/icons-material";
// import { Link, useLocation } from "react-router-dom";

// function Header() {
//   const theme = useTheme();
//   const isMobile = useMediaQuery(theme.breakpoints.down("md"));
//   const location = useLocation();
//   const [drawerOpen, setDrawerOpen] = useState(false);
//   const [anchorEl, setAnchorEl] = useState(null);

//   const handleProfileMenuOpen = (event) => {
//     setAnchorEl(event.currentTarget);
//   };

//   const handleProfileMenuClose = () => {
//     setAnchorEl(null);
//   };

//   const toggleDrawer = (open) => (event) => {
//     if (
//       event.type === "keydown" &&
//       (event.key === "Tab" || event.key === "Shift")
//     ) {
//       return;
//     }
//     setDrawerOpen(open);
//   };

//   // Check if the current path matches the given path
//   const isActive = (path) => {
//     return (
//       location.pathname === path || location.pathname.startsWith(`${path}/`)
//     );
//   };

//   const menuItems = [
//     { text: "Dashboard", icon: <DashboardIcon />, path: "/" },
//     { text: "Equipment", icon: <BuildIcon />, path: "/equipment" },
//     { text: "Borrowings", icon: <PersonIcon />, path: "/borrowings" },
//     { text: "Rentals", icon: <MoneyIcon />, path: "/rentals" },
//     { text: "Reports", icon: <BarChartIcon />, path: "/reports" },
//   ];

//   const drawer = (
//     <Box
//       sx={{ width: 250 }}
//       role="presentation"
//       onClick={toggleDrawer(false)}
//       onKeyDown={toggleDrawer(false)}
//     >
//       <Box
//         sx={{
//           p: 2,
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "center",
//         }}
//       >
//         <Typography
//           variant="h6"
//           component="div"
//           sx={{ fontWeight: "bold", color: theme.palette.primary.main }}
//         >
//           EquipTrack
//         </Typography>
//       </Box>
//       <Divider />
//       <List>
//         {menuItems.map((item) => (
//           <ListItem
//             button
//             key={item.text}
//             component={Link}
//             to={item.path}
//             sx={{
//               bgcolor: isActive(item.path)
//                 ? alpha(theme.palette.primary.main, 0.1)
//                 : "transparent",
//               color: isActive(item.path)
//                 ? theme.palette.primary.main
//                 : "inherit",
//               "&:hover": {
//                 bgcolor: alpha(theme.palette.primary.main, 0.05),
//               },
//             }}
//           >
//             <ListItemIcon
//               sx={{
//                 color: isActive(item.path)
//                   ? theme.palette.primary.main
//                   : "inherit",
//                 minWidth: 40,
//               }}
//             >
//               {item.icon}
//             </ListItemIcon>
//             <ListItemText primary={item.text} />
//           </ListItem>
//         ))}
//       </List>
//       <Divider />
//       <List>
//         <ListItem button>
//           <ListItemIcon sx={{ minWidth: 40 }}>
//             <SettingsIcon />
//           </ListItemIcon>
//           <ListItemText primary="Settings" />
//         </ListItem>
//       </List>
//     </Box>
//   );

//   // Helper function for alpha color
//   function alpha(color, opacity) {
//     return color + opacity.toString(16).padStart(2, "0");
//   }

//   return (
//     <>
//       <AppBar
//         position="static"
//         color="default"
//         elevation={0}
//         sx={{ bgcolor: "white", borderBottom: "1px solid #e0e0e0" }}
//       >
//         <Toolbar>
//           {isMobile ? (
//             <IconButton
//               edge="start"
//               color="inherit"
//               aria-label="menu"
//               onClick={toggleDrawer(true)}
//               sx={{ mr: 2 }}
//             >
//               <MenuIcon />
//             </IconButton>
//           ) : (
//             <Typography
//               variant="h6"
//               component="div"
//               sx={{
//                 flexGrow: 0,
//                 fontWeight: "bold",
//                 color: theme.palette.primary.main,
//                 mr: 4,
//               }}
//             >
//               MAMBO LINCO EQUIPMENT HUB
//             </Typography>
//           )}

//           {!isMobile && (
//             <Box sx={{ flexGrow: 1, display: "flex" }}>
//               {menuItems.map((item) => (
//                 <Button
//                   key={item.text}
//                   component={Link}
//                   to={item.path}
//                   startIcon={item.icon}
//                   sx={{
//                     mr: 1,
//                     color: isActive(item.path)
//                       ? theme.palette.primary.main
//                       : "text.primary",
//                     fontWeight: isActive(item.path) ? "bold" : "medium",
//                     "&:hover": {
//                       bgcolor: alpha(theme.palette.primary.main, 0.05),
//                     },
//                   }}
//                 >
//                   {item.text}
//                 </Button>
//               ))}
//             </Box>
//           )}

//           <Box sx={{ flexGrow: 0 }}>
//             <Button
//               variant="contained"
//               startIcon={<AddIcon />}
//               component={Link}
//               to="/equipment/add"
//               sx={{
//                 mr: 2,
//                 bgcolor: theme.palette.primary.main,
//                 "&:hover": {
//                   bgcolor: theme.palette.primary.dark,
//                 },
//               }}
//             >
//               Add Equipment
//             </Button>

//             <IconButton onClick={handleProfileMenuOpen} sx={{ p: 0 }}>
//               <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
//                 <PersonIcon />
//               </Avatar>
//             </IconButton>

//             <Menu
//               anchorEl={anchorEl}
//               open={Boolean(anchorEl)}
//               onClose={handleProfileMenuClose}
//               PaperProps={{
//                 elevation: 0,
//                 sx: {
//                   overflow: "visible",
//                   filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.1))",
//                   mt: 1.5,
//                   "& .MuiMenuItem-root": {
//                     px: 2,
//                     py: 1,
//                   },
//                 },
//               }}
//               transformOrigin={{ horizontal: "right", vertical: "top" }}
//               anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
//             >
//               <MenuItem onClick={handleProfileMenuClose}>
//                 <ListItemIcon>
//                   <PersonIcon fontSize="small" />
//                 </ListItemIcon>
//                 <ListItemText>Profile</ListItemText>
//               </MenuItem>
//               <MenuItem onClick={handleProfileMenuClose}>
//                 <ListItemIcon>
//                   <SettingsIcon fontSize="small" />
//                 </ListItemIcon>
//                 <ListItemText>Settings</ListItemText>
//               </MenuItem>
//               <Divider />
//               <MenuItem onClick={handleProfileMenuClose}>
//                 <ListItemIcon>
//                   <LogoutIcon fontSize="small" />
//                 </ListItemIcon>
//                 <ListItemText>Logout</ListItemText>
//               </MenuItem>
//             </Menu>
//           </Box>
//         </Toolbar>
//       </AppBar>

//       <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
//         {drawer}
//       </Drawer>
//     </>
//   );
// }

// export default Header;
// src/components/Header.js
import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Menu,
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Build as BuildIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Add as AddIcon,
  BarChart as BarChartIcon,
  Receipt as ReceiptIcon,
  AttachMoney as MoneyIcon,
} from "@mui/icons-material";
import { Link, useLocation, useNavigate } from "react-router-dom"; // <-- Import useNavigate

import { useAuth } from '../AuthContext'; // <-- Import the useAuth hook

// Helper function for alpha color (already present in your code, keeping it)
function alpha(color, opacity) {
  // Basic implementation, replace with theme.palette.augmentColor if needed for complex cases
  const opacityHex = Math.round(opacity * 255).toString(16);
  return color + opacityHex.padStart(2, '0');
}


function Header() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const location = useLocation();
  const navigate = useNavigate(); // <-- Get the navigate function
  const { currentUser, signout } = useAuth(); // <-- Get the currentUser and signout function from auth context

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  // --- Add the handleLogout function ---
  const handleLogout = async () => {
    handleProfileMenuClose(); // Close the profile menu
    try {
      await signout(); // Call the signout function from AuthContext
      console.log("User logged out successfully.");
      // Firebase onAuthStateChanged listener will fire, updating currentUser to null
      // PrivateRoute will detect this and redirect the user to /signin
      // However, explicitly navigating here ensures the redirection happens immediately
      // after the signout call completes, providing a smoother experience.
      navigate('/signin'); // <-- Redirect to the sign-in page

    } catch (error) {
      console.error("Error during logout:", error);
      // Optionally, display an error message to the user (e.g., using ToastProvider)
    }
  };
  // -------------------------------------

  const toggleDrawer = (open) => (event) => {
    if (
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }
    setDrawerOpen(open);
  };

  // Check if the current path matches the given path
  const isActive = (path) => {
    // Handle root path specifically to avoid partial matches on other paths
    if (path === '/') {
      return location.pathname === '/';
    }
    // For other paths, check if the current path starts with the item's path
    return location.pathname.startsWith(path);
  };

  const menuItems = [
    { text: "Dashboard", icon: <DashboardIcon />, path: "/" },
    { text: "Equipment", icon: <BuildIcon />, path: "/equipment" },
    { text: "Borrowings", icon: <PersonIcon />, path: "/borrowings" },
    { text: "Rentals", icon: <MoneyIcon />, path: "/rentals" },
    { text: "Reports", icon: <BarChartIcon />, path: "/reports" },
  ];

  const drawer = (
    <Box
      sx={{ width: 250 }}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <Box
        sx={{
          p: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography
          variant="h6"
          component="div"
          sx={{ fontWeight: "bold", color: theme.palette.primary.main }}
        >
          EquipTrack
        </Typography>
      </Box>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            component={Link}
            to={item.path}
            sx={{
              bgcolor: isActive(item.path)
                ? alpha(theme.palette.primary.main, 0.1)
                : "transparent",
              color: isActive(item.path)
                ? theme.palette.primary.main
                : "inherit",
              "&:hover": {
                bgcolor: alpha(theme.palette.primary.main, 0.05),
              },
            }}
          >
            <ListItemIcon
              sx={{
                color: isActive(item.path)
                  ? theme.palette.primary.main
                  : "inherit",
                minWidth: 40,
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        <ListItem button>
          <ListItemIcon sx={{ minWidth: 40 }}>
            <SettingsIcon />
          </ListItemIcon>
          <ListItemText primary="Settings" />
        </ListItem>
         {/* Add Logout to Mobile Drawer if needed */}
         <ListItem button onClick={handleLogout}>
          <ListItemIcon sx={{ minWidth: 40 }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItem>
      </List>
    </Box>
  );


  return (
    <>
      <AppBar
        position="static"
        color="default"
        elevation={0}
        sx={{ bgcolor: "white", borderBottom: "1px solid #e0e0e0" }}
      >
        <Toolbar>
          {isMobile ? (
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={toggleDrawer(true)}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          ) : (
            <Typography
              variant="h6"
              component="div"
              sx={{
                flexGrow: 0,
                fontWeight: "bold",
                color: theme.palette.primary.main,
                mr: 4,
              }}
            >
              MAMBO LINCO EQUIPMENT HUB
            </Typography>
          )}

          {!isMobile && (
            <Box sx={{ flexGrow: 1, display: "flex" }}>
              {menuItems.map((item) => (
                <Button
                  key={item.text}
                  component={Link}
                  to={item.path}
                  startIcon={item.icon}
                  sx={{
                    mr: 1,
                    color: isActive(item.path)
                      ? theme.palette.primary.main
                      : "text.primary",
                    fontWeight: isActive(item.path) ? "bold" : "medium",
                    "&:hover": {
                      bgcolor: alpha(theme.palette.primary.main, 0.05),
                    },
                  }}
                >
                  {item.text}
                </Button>
              ))}
            </Box>
          )}

          <Box sx={{ flexGrow: 0 }}>
            {/* Only show Add Equipment button if user is logged in (optional check) /}
            {currentUser && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                component={Link}
                to="/equipment/add"
                sx={{
                  mr: 2,
                  bgcolor: theme.palette.primary.main,
                  "&:hover": {
                    bgcolor: theme.palette.primary.dark,
                  },
                }}
              >
               {/*} Add Equipment/}
              </Button>
            )*/}


             {/* Only show Avatar/Profile menu if user is logged in (optional check) */}
            {currentUser && (
              <IconButton onClick={handleProfileMenuOpen} sx={{ p: 0 }}>
                <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                  {/* You might use user's initials here if available */}
                  {currentUser.email ? currentUser.email[0].toUpperCase() : <PersonIcon />}
                </Avatar>
              </IconButton>
            )}


            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleProfileMenuClose}
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
              transformOrigin={{ horizontal: "right", vertical: "top" }}
              anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            >
              {/* Optional: Show user email or display name */}
               {currentUser && (
                 <MenuItem disabled>
                    <Typography variant="body2" color="text.secondary">
                      {currentUser.email}
                    </Typography>
                 </MenuItem>
               )}
               {currentUser && <Divider />}

              <MenuItem onClick={handleProfileMenuClose}>
                <ListItemIcon>
                  <PersonIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Profile</ListItemText>
              </MenuItem>
              <MenuItem onClick={handleProfileMenuClose}>
                <ListItemIcon>
                  <SettingsIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Settings</ListItemText>
              </MenuItem>
              <Divider />
              {/* --- Modified Logout MenuItem --- */}
              <MenuItem onClick={handleLogout}> {/* <-- Call handleLogout */}
                <ListItemIcon>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Logout</ListItemText>
              </MenuItem>
               {/* --------------------------------- */}
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
        {drawer}
      </Drawer>
    </>
  );
}

export default Header;
