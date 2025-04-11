import React from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Stack,
  Divider,
  IconButton
} from '@mui/material';
import {
  Twitter as TwitterIcon,
  Facebook as FacebookIcon,
  LinkedIn as LinkedInIcon
} from '@mui/icons-material';

function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        bgcolor: 'white',
        borderTop: '1px solid #e0e0e0'
      }}
    >
      <Container maxWidth="xl">
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              © {new Date().getFullYear()} EquipTrack. All rights reserved.
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Stack
              direction="row"
              spacing={2}
              divider={<Divider orientation="vertical" flexItem />}
              justifyContent={{ xs: 'flex-start', md: 'flex-end' }}
              alignItems="center"
            >
              <Typography variant="body2" component="a" href="#" sx={{ color: 'text.secondary', textDecoration: 'none' }}>
                Privacy Policy
              </Typography>
              <Typography variant="body2" component="a" href="#" sx={{ color: 'text.secondary', textDecoration: 'none' }}>
                Terms of Service
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton size="small">
                  <TwitterIcon fontSize="small" />
                </IconButton>
                <IconButton size="small">
                  <FacebookIcon fontSize="small" />
                </IconButton>
                <IconButton size="small">
                  <LinkedInIcon fontSize="small" />
                </IconButton>
              </Box>
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default Footer;