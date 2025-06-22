'use client';

import ServiceLayout from '../components/ServiceLayout';
import { Typography, Grid, Box, Card, CardContent } from '@mui/material';
import StorageIcon from '@mui/icons-material/Storage';
import DnsIcon from '@mui/icons-material/Dns';
import RouterIcon from '@mui/icons-material/Router';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import PowerIcon from '@mui/icons-material/Power';

const ColocationPage = () => {
  return (
    <ServiceLayout title="Colocation Services">
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" gutterBottom>
          Datacentrix Colocation Services
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
          Enterprise-Grade Hosting in Teraco Data Centres
        </Typography>
        <Typography variant="body1" paragraph>
          Deploy your critical infrastructure in South Africa's most secure, connected data centre ecosystem. Datacentrix colocation services offer the power, resilience, and flexibility your business needs - all with integrated access to our cloud, DRaaS, and network offerings.
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
                <DnsIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Flexible Rack Options</Typography>
              </Box>
              <Typography variant="body1">
                Choose between full, half, or custom rack configurations to suit your scale, budget, and security profile.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', bgcolor: 'grey.50' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <RouterIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Carrier-Neutral Interconnects</Typography>
              </Box>
              <Typography variant="body1">
                Bring your own ISP or connect via NAPAfrica to any number of cloud, telco, or peering partners.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', bgcolor: 'grey.50' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <SupportAgentIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Remote Hands & Eyes</Typography>
              </Box>
              <Typography variant="body1">
                Onsite Datacentrix teams are available 24/7 to assist with hardware resets, device swaps, and physical inspection tasks.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', bgcolor: 'grey.50' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PowerIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Power & Cooling Resilience</Typography>
              </Box>
              <Typography variant="body1">
                Hosted in Teraco CPT and JHB on resilient infrastructure with N+1 power and cooling redundancy.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </ServiceLayout>
  );
};

export default ColocationPage; 