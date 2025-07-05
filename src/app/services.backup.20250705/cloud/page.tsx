'use client';

import ServiceLayout from '../components/ServiceLayout';
import { Typography, Grid, Box, Card, CardContent } from '@mui/material';
import CloudIcon from '@mui/icons-material/Cloud';
import PaymentIcon from '@mui/icons-material/Payment';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import SecurityIcon from '@mui/icons-material/Security';
import NetworkCheckIcon from '@mui/icons-material/NetworkCheck';

const CloudPage = () => {
  return (
    <ServiceLayout title="Cloud Services">
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" gutterBottom>
          Datacentrix Cloud Services
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
          Flexible, Secure Cloud Infrastructure - Built for South Africa
        </Typography>
        <Typography variant="body1" paragraph>
          Datacentrix Cloud gives you full control over your compute, storage, and networking resources - backed by local support, rand-based pricing, and POPIA-compliant architecture. Built on enterprise-grade platforms, this is the cloud that aligns with your business, not the other way around.
        </Typography>
      </Box>

      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        Key Benefits
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', bgcolor: 'grey.50' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PaymentIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Pay-as-you-go Flexibility</Typography>
              </Box>
              <Typography variant="body1">
                Provision only the resources you need, when you need them. No long-term lock-in, no overspend.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', bgcolor: 'grey.50' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CurrencyExchangeIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Rand-Based Pricing & No Egress Fees</Typography>
              </Box>
              <Typography variant="body1">
                Transparent local pricing shields you from forex volatility. And there are no fees to retrieve your own data.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', bgcolor: 'grey.50' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <SecurityIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">POPIA-Aligned Data Sovereignty</Typography>
              </Box>
              <Typography variant="body1">
                Your data stays in South Africa, always. All workloads are hosted across our JHB and CPT data centres.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', bgcolor: 'grey.50' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <NetworkCheckIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Integrated Networking & FortiGate Security</Typography>
              </Box>
              <Typography variant="body1">
                Secure your infrastructure with next-gen firewalls, software-defined networking, and private routing options.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </ServiceLayout>
  );
};

export default CloudPage; 