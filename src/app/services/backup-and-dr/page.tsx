'use client';

import ServiceLayout from '../components/ServiceLayout';
import { Typography, Grid, Box, Card, CardContent } from '@mui/material';
import BackupIcon from '@mui/icons-material/Backup';
import SecurityIcon from '@mui/icons-material/Security';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import StorageIcon from '@mui/icons-material/Storage';
import CloudSyncIcon from '@mui/icons-material/CloudSync';

const BackupDRPage = () => {
  return (
    <ServiceLayout title="Backup & Disaster Recovery">
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" gutterBottom>
          Datacentrix Backup & Disaster Recovery
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
          Protect Your Business-Critical Data with Daily, Automated Backups
        </Typography>
        <Typography variant="body1" paragraph>
          Keep your workloads safe with a robust, policy-driven backup and DR solution powered by Rubrik. Whether you&apos;re running virtual machines,
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
                <SecurityIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Immutable Backups</Typography>
              </Box>
              <Typography variant="body1">
                Ensure backups can&apos;t be modified or deleted by attackers, thanks to Rubrik&apos;s write-once technology. This is your first line of defense against ransomware.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', bgcolor: 'grey.50' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AutoFixHighIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Policy-Based Automation</Typography>
              </Box>
              <Typography variant="body1">
                Set it and forget it. Define your backup SLAs and retention periods. Let the platform enforce compliance and keep your systems recoverable.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', bgcolor: 'grey.50' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <StorageIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Broad Platform Support</Typography>
              </Box>
              <Typography variant="body1">
                VMware, Hyper-V, physical servers, Microsoft 365, NAS systems, SQL databases - protect your full stack without complexity.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', bgcolor: 'grey.50' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CloudSyncIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Disaster Recovery-as-a-Service (DRaaS)</Typography>
              </Box>
              <Typography variant="body1">
                Failover capabilities that keep you up and running. Recover full environments or individual workloads from any supported site, from 2 to 24 hours.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </ServiceLayout>
  );
};

export default BackupDRPage; 