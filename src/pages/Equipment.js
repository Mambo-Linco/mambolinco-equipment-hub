/*import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  TextField,
  InputAdornment,
  AppBar,
  Toolbar,
  List,
  ListItem,
  ListItemText,
  useTheme,
  useMediaQuery,
  IconButton,
} from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";

function Equipment() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [searchTerm, setSearchTerm] = useState("");

  // Equipment data
  const equipmentData = [
    {
      id: 1,
      name: "Industrial Robot Arm",
      description: "High-precision robotic arm for industrial automation",
      image:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Aequipmet-WqW0eIAmbAnHsH4PM9QmeBhaVLkNUh.png", // In a real app, use a specific image for each equipment
      specs: ["6 axis movement", "Payload: 120kg", "Precision: ±0.1mm"],
      price: 45000,
    },
    {
      id: 2,
      name: "CNC Milling Machine",
      description: "Advanced precision milling system for complex parts",
      image:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Aequipmet-WqW0eIAmbAnHsH4PM9QmeBhaVLkNUh.png", // In a real app, use a specific image for each equipment
      specs: [
        "Working area: 800×400mm",
        "4-axis capability",
        "High-speed spindle",
      ],
      price: 28000,
    },
    // You can add more equipment items here
  ];

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredEquipment = equipmentData.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* Header/AppBar /}
      <AppBar position="static" color="default" elevation={0} sx={{ borderBottom: '1px solid #e0e0e0', bgcolor: 'white' }}>
        <Toolbar>
          <Typography
            variant="h6"
            component="div"
            sx={{
              display: 'flex',
              alignItems: 'center',
              fontWeight: 'bold',
              color: '#333',
              mr: 4
            }}
          >
            EquipHub
          </Typography>

          <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
            <Button color="inherit">Home</Button>
            <Button color="inherit" sx={{ fontWeight: 'bold' }}>Products</Button>
            <Button color="inherit">Solutions</Button>
            <Button color="inherit">Contact</Button>
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          <TextField
            size="small"
            placeholder="Search equipment..."
            variant="outlined"
            value={searchTerm}
            onChange={handleSearchChange}
            sx={{
              width: { xs: 150, sm: 250 },
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              }
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton edge="end" size="small">
                    <SearchIcon />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
        </Toolbar>
      </AppBar>/}

      {/* Main Content /}
      <Container maxWidth="lg" sx={{ mt: 6, mb: 8, flexGrow: 1 }}>
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{
            fontWeight: "bold",
            mb: 4,
            color: "#333",
          }}
        >
          Equipment Catalog
        </Typography>

        <Grid container spacing={4}>
          {filteredEquipment.map((equipment) => (
            <Grid item xs={12} md={6} key={equipment.id}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: 2,
                  border: "1px solid #e0e0e0",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <CardMedia
                  component="img"
                  height={300}
                  image={equipment.image}
                  alt={equipment.name}
                  sx={{ objectFit: "cover" }}
                />
                <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                  <Typography
                    variant="h6"
                    component="h2"
                    sx={{ fontWeight: "bold", mb: 1 }}
                  >
                    {equipment.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    {equipment.description}
                  </Typography>

                  <List dense disablePadding>
                    {equipment.specs.map((spec, index) => (
                      <ListItem key={index} disablePadding sx={{ pb: 0.5 }}>
                        <ListItemText
                          primary={spec}
                          primaryTypographyProps={{
                            variant: "body2",
                            color: "text.secondary",
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    px: 2,
                    pb: 2,
                  }}
                >
                  <Typography
                    variant="h6"
                    component="p"
                    sx={{ color: "#1976d2", fontWeight: "bold" }}
                  >
                    ${equipment.price.toLocaleString()}
                  </Typography>
                  <Button
                    variant="contained"
                    size="small"
                    sx={{
                      bgcolor: "#1976d2",
                      "&:hover": {
                        bgcolor: "#1565c0",
                      },
                      borderRadius: 1,
                    }}
                  >
                    View Details
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={4}>
          {filteredEquipment.map((equipment) => (
            <Grid item xs={12} md={6} key={equipment.id}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: 2,
                  border: "1px solid #e0e0e0",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <CardMedia
                  component="img"
                  height={300}
                  image={equipment.image}
                  alt={equipment.name}
                  sx={{ objectFit: "cover" }}
                />
                <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                  <Typography
                    variant="h6"
                    component="h2"
                    sx={{ fontWeight: "bold", mb: 1 }}
                  >
                    {equipment.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    {equipment.description}
                  </Typography>

                  <List dense disablePadding>
                    {equipment.specs.map((spec, index) => (
                      <ListItem key={index} disablePadding sx={{ pb: 0.5 }}>
                        <ListItemText
                          primary={spec}
                          primaryTypographyProps={{
                            variant: "body2",
                            color: "text.secondary",
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    px: 2,
                    pb: 2,
                  }}
                >
                  <Typography
                    variant="h6"
                    component="p"
                    sx={{ color: "#1976d2", fontWeight: "bold" }}
                  >
                    ${equipment.price.toLocaleString()}
                  </Typography>
                  <Button
                    variant="contained"
                    size="small"
                    sx={{
                      bgcolor: "#1976d2",
                      "&:hover": {
                        bgcolor: "#1565c0",
                      },
                      borderRadius: 1,
                    }}
                  >
                    View Details
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={4}>
          {filteredEquipment.map((equipment) => (
            <Grid item xs={12} md={6} key={equipment.id}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: 2,
                  border: "1px solid #e0e0e0",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <CardMedia
                  component="img"
                  height={300}
                  image={equipment.image}
                  alt={equipment.name}
                  sx={{ objectFit: "cover" }}
                />
                <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                  <Typography
                    variant="h6"
                    component="h2"
                    sx={{ fontWeight: "bold", mb: 1 }}
                  >
                    {equipment.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    {equipment.description}
                  </Typography>

                  <List dense disablePadding>
                    {equipment.specs.map((spec, index) => (
                      <ListItem key={index} disablePadding sx={{ pb: 0.5 }}>
                        <ListItemText
                          primary={spec}
                          primaryTypographyProps={{
                            variant: "body2",
                            color: "text.secondary",
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    px: 2,
                    pb: 2,
                  }}
                >
                  <Typography
                    variant="h6"
                    component="p"
                    sx={{ color: "#1976d2", fontWeight: "bold" }}
                  >
                    ${equipment.price.toLocaleString()}
                  </Typography>
                  <Button
                    variant="contained"
                    size="small"
                    sx={{
                      bgcolor: "#1976d2",
                      "&:hover": {
                        bgcolor: "#1565c0",
                      },
                      borderRadius: 1,
                    }}
                  >
                    View Details
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
        <Grid container spacing={4}>
          {filteredEquipment.map((equipment) => (
            <Grid item xs={12} md={6} key={equipment.id}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: 2,
                  border: "1px solid #e0e0e0",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <CardMedia
                  component="img"
                  height={300}
                  image={equipment.image}
                  alt={equipment.name}
                  sx={{ objectFit: "cover" }}
                />
                <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                  <Typography
                    variant="h6"
                    component="h2"
                    sx={{ fontWeight: "bold", mb: 1 }}
                  >
                    {equipment.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    {equipment.description}
                  </Typography>

                  <List dense disablePadding>
                    {equipment.specs.map((spec, index) => (
                      <ListItem key={index} disablePadding sx={{ pb: 0.5 }}>
                        <ListItemText
                          primary={spec}
                          primaryTypographyProps={{
                            variant: "body2",
                            color: "text.secondary",
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    px: 2,
                    pb: 2,
                  }}
                >
                  <Typography
                    variant="h6"
                    component="p"
                    sx={{ color: "#1976d2", fontWeight: "bold" }}
                  >
                    ${equipment.price.toLocaleString()}
                  </Typography>
                  <Button
                    variant="contained"
                    size="small"
                    sx={{
                      bgcolor: "#1976d2",
                      "&:hover": {
                        bgcolor: "#1565c0",
                      },
                      borderRadius: 1,
                    }}
                  >
                    View Details
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Footer /}
      <Box
        component="footer"
        sx={{
          py: 3,
          px: 2,
          mt: "auto",
          bgcolor: "#f5f5f5",
          borderTop: "1px solid #e0e0e0",
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="body2" color="text.secondary" align="center">
            © {new Date().getFullYear()} EquipHub. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}

export default Equipment;*/

import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Button,
  TextField,
  InputAdornment,
  AppBar,
  Toolbar,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Paper,
  InputBase,
  Divider,
  Stack,
} from "@mui/material";
import {
  Search as SearchIcon,
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  LinkedIn as LinkedInIcon,
  Instagram as InstagramIcon,
  Send as SendIcon,
} from "@mui/icons-material";
import { Link } from "react-router-dom";

function Equipment() {
  const [searchTerm, setSearchTerm] = useState("");

  // Equipment data
  const equipmentData = [
    {
      id: 1,
      name: "Industrial Robot Arm",
      description: "High-precision robotic arm for industrial automation",
      image:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Can%20you%20design%20a%20web%20page%20for%20equipment%20where%20i%20can%20view%20equipment%20image%20with%20their%20discriptions.%20Th-aGMuMuINwZLrwdO3NiMriZ2Cey94JN.png", // In a real app, use specific images for each item
      specs: ["6-axis movement", "Payload: 120kg", "Precision: ±0.1mm"],
      price: 45000,
    },
    {
      id: 2,
      name: "CNC Milling Machine",
      description: "Advanced precision milling system for complex parts",
      image:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Can%20you%20design%20a%20web%20page%20for%20equipment%20where%20i%20can%20view%20equipment%20image%20with%20their%20discriptions.%20Th-aGMuMuINwZLrwdO3NiMriZ2Cey94JN.png",
      specs: [
        "Working area: 800×600mm",
        "4-axis capability",
        "High-speed spindle",
      ],
      price: 28000,
    },
    {
      id: 3,
      name: "3D Printer Pro",
      description: "Industrial grade printer for professional prototyping",
      image:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Can%20you%20design%20a%20web%20page%20for%20equipment%20where%20i%20can%20view%20equipment%20image%20with%20their%20discriptions.%20Th-aGMuMuINwZLrwdO3NiMriZ2Cey94JN.png",
      specs: [
        "Build volume: 300×300×400mm",
        "Dual extruder system",
        "Heated chamber",
      ],
      price: 12500,
    },
    {
      id: 4,
      name: "Laser Cutting System",
      description: "High-power CO2 laser cutter for precise cutting",
      image:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Can%20you%20design%20a%20web%20page%20for%20equipment%20where%20i%20can%20view%20equipment%20image%20with%20their%20discriptions.%20Th-aGMuMuINwZLrwdO3NiMriZ2Cey94JN.png",
      specs: ["Cutting area: 1300×900mm", "Power: 150W", "Auto-focus system"],
      price: 35000,
    },
    {
      id: 5,
      name: "Automated Conveyor",
      description: "Modular belt system for efficient material handling",
      image:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Can%20you%20design%20a%20web%20page%20for%20equipment%20where%20i%20can%20view%20equipment%20image%20with%20their%20discriptions.%20Th-aGMuMuINwZLrwdO3NiMriZ2Cey94JN.png",
      specs: ["Length: 10 meters", "Speed: 0.5-2 m/s", "Modular design"],
      price: 8900,
    },
    {
      id: 6,
      name: "Packaging Machine",
      description: "Automatic box sealer for high-volume packaging",
      image:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Can%20you%20design%20a%20web%20page%20for%20equipment%20where%20i%20can%20view%20equipment%20image%20with%20their%20discriptions.%20Th-aGMuMuINwZLrwdO3NiMriZ2Cey94JN.png",
      specs: [
        "Capacity: 1200 boxes/hour",
        "Size range: 200-600mm",
        "Auto-adjustment",
      ],
      price: 15800,
    },
  ];

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredEquipment = equipmentData.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        bgcolor: "#fff",
      }}
    >
      {/* Header/AppBar /}
      <AppBar
        position="static"
        color="default"
        elevation={0}
        sx={{ borderBottom: "1px solid #e0e0e0", bgcolor: "white" }}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ py: 1 }}>
            <Typography
              variant="h6"
              component={Link}
              to="/"
              sx={{
                display: "flex",
                alignItems: "center",
                fontWeight: "bold",
                color: "#333",
                mr: 4,
                textDecoration: "none",
              }}
            >
              EquipHub
            </Typography>

            <Box sx={{ display: "flex" }}>
              <Button component={Link} to="/" color="inherit">
                Home
              </Button>
              <Button component={Link} to="/products" color="inherit">
                Products
              </Button>
              <Button component={Link} to="/solutions" color="inherit">
                Solutions
              </Button>
              <Button component={Link} to="/contact" color="inherit">
                Contact
              </Button>
            </Box>

            <Box sx={{ flexGrow: 1 }} />

            <Paper
              component="form"
              sx={{
                p: "2px 4px",
                display: "flex",
                alignItems: "center",
                width: 250,
                border: "1px solid #e0e0e0",
                borderRadius: 2,
              }}
            >
              <InputBase
                sx={{ ml: 1, flex: 1 }}
                placeholder="Search equipment..."
                value={searchTerm}
                onChange={handleSearchChange}
              />
              <IconButton type="submit" sx={{ p: "10px" }} aria-label="search">
                <SearchIcon />
              </IconButton>
            </Paper>
          </Toolbar>
        </Container>
      </AppBar>*/}

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ mt: 5, mb: 8, flexGrow: 1 }}>
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{
            fontWeight: "bold",
            mb: 4,
            color: "#333",
          }}
        >
          Equipment Catalog
        </Typography>

        <Grid container spacing={3}>
          {filteredEquipment.map((equipment) => (
            <Grid item xs={12} md={6} key={equipment.id}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: 2,
                  border: "1px solid #e0e0e0",
                  mb: 2,
                  overflow: "visible",
                }}
              >
                <CardMedia
                  component="img"
                  height={250}
                  image={equipment.image}
                  alt={equipment.name}
                  sx={{ objectFit: "cover" }}
                />
                <CardContent sx={{ pt: 2, pb: 1 }}>
                  <Typography
                    variant="h6"
                    component="h2"
                    sx={{ fontWeight: "bold", mb: 0.5 }}
                  >
                    {equipment.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 1.5 }}
                  >
                    {equipment.description}
                  </Typography>

                  <List dense disablePadding>
                    {equipment.specs.map((spec, index) => (
                      <ListItem key={index} disablePadding sx={{ pb: 0.5 }}>
                        <ListItemText
                          primary={spec}
                          primaryTypographyProps={{
                            variant: "body2",
                            color: "text.secondary",
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    px: 2,
                    pb: 2,
                  }}
                >
                  <Typography
                    variant="h6"
                    component="p"
                    sx={{ color: "#1976d2", fontWeight: "bold" }}
                  >
                    ##{equipment.price.toLocaleString()}
                  </Typography>
                  <Button
                    variant="contained"
                    size="small"
                    sx={{
                      bgcolor: "#1976d2",
                      "&:hover": {
                        bgcolor: "#1565c0",
                      },
                      borderRadius: 1,
                    }}
                  >
                    View Details
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          py: 6,
          px: 2,
          mt: "auto",
          bgcolor: "#fff",
          borderTop: "1px solid #e0e0e0",
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={3}>
              <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
                EquipHub
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Leading provider of Streaming Services
              </Typography>
            </Grid>

            <Grid item xs={12} md={3}>
              <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
                Quick Links
              </Typography>
              <List dense disablePadding>
                <ListItem disablePadding sx={{ pb: 0.5 }}>
                  <ListItemText
                    primary="About Us"
                    primaryTypographyProps={{
                      variant: "body2",
                      component: Link,
                      to: "/about",
                      sx: { textDecoration: "none", color: "text.secondary" },
                    }}
                  />
                </ListItem>
                <ListItem disablePadding sx={{ pb: 0.5 }}>
                  <ListItemText
                    primary="Products"
                    primaryTypographyProps={{
                      variant: "body2",
                      component: Link,
                      to: "/products",
                      sx: { textDecoration: "none", color: "text.secondary" },
                    }}
                  />
                </ListItem>
                <ListItem disablePadding sx={{ pb: 0.5 }}>
                  <ListItemText
                    primary="Services"
                    primaryTypographyProps={{
                      variant: "body2",
                      component: Link,
                      to: "/services",
                      sx: { textDecoration: "none", color: "text.secondary" },
                    }}
                  />
                </ListItem>
                <ListItem disablePadding sx={{ pb: 0.5 }}>
                  <ListItemText
                    primary="Support"
                    primaryTypographyProps={{
                      variant: "body2",
                      component: Link,
                      to: "/support",
                      sx: { textDecoration: "none", color: "text.secondary" },
                    }}
                  />
                </ListItem>
              </List>
            </Grid>

            <Grid item xs={12} md={3}>
              <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
                Contact
              </Typography>
              <List dense disablePadding>
                <ListItem disablePadding sx={{ pb: 0.5 }}>
                  <ListItemText
                    primary="46B Mt Pleasant Drive"
                    primaryTypographyProps={{
                      variant: "body2",
                      color: "text.secondary",
                    }}
                  />
                </ListItem>
                <ListItem disablePadding sx={{ pb: 0.5 }}>
                  <ListItemText
                    primary="Mt Pleasant Drive, Mt Pleasant Harare"
                    primaryTypographyProps={{
                      variant: "body2",
                      color: "text.secondary",
                    }}
                  />
                </ListItem>
                <ListItem disablePadding sx={{ pb: 0.5 }}>
                  <ListItemText
                    primary="+1 (555) 123-4567"
                    primaryTypographyProps={{
                      variant: "body2",
                      color: "text.secondary",
                    }}
                  />
                </ListItem>
                <ListItem disablePadding sx={{ pb: 0.5 }}>
                  <ListItemText
                    primary="mambolinco@gmail.com"
                    primaryTypographyProps={{
                      variant: "body2",
                      color: "text.secondary",
                    }}
                  />
                </ListItem>
              </List>
            </Grid>

            <Grid item xs={12} md={3}>
              <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
                Newsletter
              </Typography>
              <Box sx={{ display: "flex", mb: 2 }}>
                <TextField
                  size="small"
                  placeholder="Enter your email"
                  variant="outlined"
                  sx={{ mr: 1 }}
                />
                <Button
                  variant="contained"
                  sx={{ minWidth: "auto", bgcolor: "#1976d2" }}
                >
                  <SendIcon fontSize="small" />
                </Button>
              </Box>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <Typography variant="body2" color="text.secondary">
              © {new Date().getFullYear()} Muzukuru. All rights reserved.
            </Typography>
            <Stack direction="row" spacing={1}>
              <IconButton size="small" sx={{ color: "#1976d2" }}>
                <FacebookIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" sx={{ color: "#1976d2" }}>
                <TwitterIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" sx={{ color: "#1976d2" }}>
                <LinkedInIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" sx={{ color: "#1976d2" }}>
                <InstagramIcon fontSize="small" />
              </IconButton>
            </Stack>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}

export default Equipment;
