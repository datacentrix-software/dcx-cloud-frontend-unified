'use client';

import ServiceLayout from '../components/ServiceLayout';
import { Typography, Grid, Box, Card, CardContent, ListItem, List, ListItemText, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Paper, Stack, Link, Button, } from '@mui/material';
import SecurityIcon from '@mui/icons-material/Security';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import StorageIcon from '@mui/icons-material/Storage';
import CloudSyncIcon from '@mui/icons-material/CloudSync';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LanguageIcon from '@mui/icons-material/Language';
import EmailIcon from '@mui/icons-material/Email';
import GppGoodIcon from '@mui/icons-material/GppGood';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

const BackupDRPage = () => {
  return (
    <ServiceLayout title="Backup & Disaster Recovery">
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" gutterBottom>
          Datacentrix Backup & Disaster Recovery
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
          Your business doesn’t stop, and neither should your data protection.
        </Typography>
        <Typography variant="body1" paragraph>
          Datacentrix Backup and Disaster Recovery Services give you policy-driven, ransomware-resilient protection hosted in South African datacentres, with multi-region redundancy and no recovery-time surprises.
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
                <Typography variant="h6">Daily, Automated Backups You Can Trust</Typography>
              </Box>
              <Typography variant="body1" paragraph>
                Backups are not optional—they are your last line of defence. That is why <strong>Datacentrix</strong> delivers secure, verifiable backups every day, with automated retention policies to keep you compliant.
              </Typography>

              <List sx={{ listStyleType: 'disc', pl: 3 }}>
                <ListItem sx={{ display: 'list-item', py: 0 }}>
                  <ListItemText
                    primary={
                      <>
                        <strong>Immutable backups</strong> cannot be modified or deleted during the retention window
                      </>
                    }
                  />
                </ListItem>
                <ListItem sx={{ display: 'list-item', py: 0 }}>
                  <ListItemText
                    primary={
                      <>
                        <strong>Policy-based retention</strong> set by your business or regulatory needs
                      </>
                    }
                  />
                </ListItem>
                <ListItem sx={{ display: 'list-item', py: 0 }}>
                  <ListItemText
                    primary={
                      <>
                        <strong>Automated integrity checks</strong> verify recoverability with no manual effort
                      </>
                    }
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', bgcolor: 'grey.50' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AutoFixHighIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Disaster Recovery-as-a-Service (DRaaS) That Works When You Need It Most</Typography>
              </Box>
              <Typography variant="body1" paragraph>
                Disasters don’t wait. Neither do we.<strong>Datacentrix DRaaS</strong> delivers tiered recovery SLAs, preconfigured failover orchestration, and multi-region replication, so you’re back online with minimal downtime.
              </Typography>

              <List sx={{ listStyleType: 'disc', pl: 3 }}>
                <ListItem sx={{ display: 'list-item', py: 0 }}>
                  <ListItemText
                    primary={
                      <>
                        <strong>Recovery time objectives</strong> from 2 to 24 hours
                      </>
                    }
                  />
                </ListItem>
                <ListItem sx={{ display: 'list-item', py: 0 }}>
                  <ListItemText
                    primary={
                      <>
                        <strong>Failover orchestration</strong> managed and tested in advance
                      </>
                    }
                  />
                </ListItem>
                <ListItem sx={{ display: 'list-item', py: 0 }}>
                  <ListItemText
                    primary={
                      <>
                        <strong>Multi-region protection</strong> with data hosted in JHB and CPT
                      </>
                    }
                  />
                </ListItem>
                <ListItem sx={{ display: 'list-item', py: 0 }}>
                  <ListItemText
                    primary={
                      <>
                        <strong>On-demand recovery</strong> — pay only when you need it
                      </>
                    }
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', bgcolor: 'grey.50' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <StorageIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Built-in Ransomware Defence</Typography>
              </Box>
              <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                Ransomware Is Built to Disrupt. We’re Built to Recover.
              </Typography>

              <Typography variant="body1" paragraph>
                Our <strong>Rubrik-powered platform</strong> detects anomalies early and helps you isolate compromised data fast—without relying on infected systems.
              </Typography>

              <List sx={{ listStyleType: 'disc', pl: 3 }}>
                <ListItem sx={{ display: 'list-item', py: 0 }}>
                  <ListItemText
                    primary={
                      <>
                        <strong>Immutable file system</strong> — blocks unauthorised access and deletion
                      </>
                    }
                  />
                </ListItem>
                <ListItem sx={{ display: 'list-item', py: 0 }}>
                  <ListItemText
                    primary={
                      <>
                        <strong>Anomaly detection</strong> — highlights suspicious behaviour and blast radius
                      </>
                    }
                  />
                </ListItem>
                <ListItem sx={{ display: 'list-item', py: 0 }}>
                  <ListItemText
                    primary={
                      <>
                        <strong>Zero-trust access</strong> — no direct access from production environments
                      </>
                    }
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', bgcolor: 'grey.50' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CloudSyncIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Coverage for All Your Workloads </Typography>
              </Box>
              <Typography variant="body1" paragraph>
                Don’t Piece Together Multiple Tools <strong>Datacentrix</strong> supports full-stack protection, across cloud and on-premises.
              </Typography>

              <List sx={{ listStyleType: 'disc', pl: 3 }}>
                <ListItem sx={{ display: 'list-item', py: 0 }}>
                  <ListItemText
                    primary={
                      <>
                        <strong>Supports</strong> VMware, Hyper-V, Microsoft 365, SQL, NAS, and physical servers
                      </>
                    }
                  />
                </ListItem>
                <ListItem sx={{ display: 'list-item', py: 0 }}>
                  <ListItemText
                    primary={
                      <>
                        <strong>Archive tier</strong> available for long-term retention
                      </>
                    }
                  />
                </ListItem>
                <ListItem sx={{ display: 'list-item', py: 0 }}>
                  <ListItemText
                    primary={
                      <>
                        <strong>Hybrid protection</strong> — combine on-prem and cloud for full resilience
                      </>
                    }
                  />
                </ListItem>
                <ListItem sx={{ display: 'list-item', py: 0 }}>
                  <ListItemText
                    primary={
                      <>
                        <strong>Cloud backup support</strong> for Veeam and Rubrik
                      </>
                    }
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', bgcolor: 'grey.50' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <GppGoodIcon style={{ verticalAlign: 'middle', marginRight: 8 }} />
                <Typography variant="h6">Compliance-Ready, Built-In </Typography>
              </Box>
              <Typography variant="body1" paragraph>
                <strong>POPIA compliance</strong> isn’t a checkbox. It’s the foundation.
              </Typography>

              <List sx={{ listStyleType: 'disc', pl: 3 }}>
                <ListItem sx={{ display: 'list-item', py: 0 }}>
                  <ListItemText
                    primary={
                      <>
                        <strong>AES-256 encryption</strong> in transit and at rest
                      </>
                    }
                  />
                </ListItem>
                <ListItem sx={{ display: 'list-item', py: 0 }}>
                  <ListItemText
                    primary={
                      <>
                        <strong>Zero-trust architecture</strong> and strict access control
                      </>
                    }
                  />
                </ListItem>
                <ListItem sx={{ display: 'list-item', py: 0 }}>
                  <ListItemText
                    primary={
                      <>
                        <strong>Backup verification</strong> and optional DR testing with audit trails
                      </>
                    }
                  />
                </ListItem>
                <ListItem sx={{ display: 'list-item', py: 0 }}>
                  <ListItemText
                    primary={
                      <>
                        <strong>Local hosting</strong> in ISO-certified datacentres
                      </>
                    }
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>


      </Grid>
      <Grid item xs={12} md={6}>
        <Card sx={{ height: '100%', bgcolor: 'grey.50' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <AttachMoneyIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">Simple, Predictable Pricing  </Typography>
            </Box>
            <Typography variant="body1" paragraph>
              <strong>Datacentrix</strong> offers clear billing built around your data footprint and recovery needs.
            </Typography>

            <List sx={{ listStyleType: 'disc', pl: 3 }}>
              <ListItem sx={{ display: 'list-item', py: 0 }}>
                <ListItemText
                  primary={
                    <>
                      <strong>Per TB per month</strong> pricing, based on deduplicated and compressed size
                    </>
                  }
                />
              </ListItem>
              <ListItem sx={{ display: 'list-item', py: 0 }}>
                <ListItemText
                  primary={
                    <>
                      <strong>Pay-as-you-recover</strong> or <strong>fixed-cost subscription</strong> options
                    </>
                  }
                />
              </ListItem>
              <ListItem sx={{ display: 'list-item', py: 0 }}>
                <ListItemText
                  primary={
                    <>
                      <strong>Tiered SLA models</strong> so you only pay for the recovery window you require
                    </>
                  }
                />
              </ListItem>
            </List>

            <TableContainer component={Paper} sx={{ mt: 3 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f0f4f8' }}>
                    <TableCell><strong>Tier</strong></TableCell>
                    <TableCell><strong>Use Case</strong></TableCell>
                    <TableCell><strong>Recovery Time</strong></TableCell>
                    <TableCell><strong>Key Features</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>Backup Only</TableCell>
                    <TableCell>General workloads</TableCell>
                    <TableCell>24 hours</TableCell>
                    <TableCell>Single-region storage, ransomware protection</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Business DR</TableCell>
                    <TableCell>Mid-critical systems</TableCell>
                    <TableCell>6–12 hours</TableCell>
                    <TableCell>Multi-region replication, automated failover</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={6} sx={{ mt: 2 }}>
        <Card sx={{ height: '100%', bgcolor: 'grey.50' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Your Data Deserves Better Than “Good Enough” </Typography>
            </Box>

            <Typography variant="body1" paragraph>
              With <strong>Datacentrix</strong>, you get enterprise-grade recovery without enterprise-level complexity. Local support. Predictable pricing. And protection that does its job when it matters most.
            </Typography>

            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                Customer Testimonial
              </Typography>

              <Paper elevation={2} sx={{ p: 2, backgroundColor: '#f9fafb' }}>
                <Typography variant="body1" sx={{ fontStyle: 'italic', mb: 2 }}>
                  “With Datacentrix, we finally overcame the data corruption issues that plagued us for years. The backup and disaster recovery solution has delivered visibility, performance, and stability from day one. When our production environment went down, failover at the DR site worked exactly as expected — no disruption. Datacentrix remains a trusted partner who goes the extra mile, and we value their accountability and service-driven approach.”
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  - IT Infrastructure Manager, PPS (Professional Provident Society)
                </Typography>
              </Paper>
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1B5982', mb: 2, mt: 2 }}>
              Ready to Protect What Matters?
            </Typography>

            <Stack direction="column" spacing={1} mb={3}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <EmailIcon sx={{ color: '#1B5982' }} />
                <Link href="mailto:sales@datacentrix.co.za" underline="hover" color="inherit">
                  sales@datacentrix.co.za
                </Link>
              </Stack>

              <Stack direction="row" alignItems="center" spacing={1}>
                <LanguageIcon sx={{ color: '#1B5982' }} />
                <Link href="https://www.datacentrix.co.za" underline="hover" color="inherit" target="_blank" rel="noopener">
                  www.datacentrix.co.za
                </Link>
              </Stack>
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <CalendarMonthIcon sx={{ color: '#1B5982' }} />
              <Button
                variant="contained"
                color="primary"

                sx={{ textTransform: 'none' }}
              >
                Request a DR Assessment
              </Button>
              <Button
                variant="outlined"
                color="primary"
                sx={{ textTransform: 'none' }}
              >
                Talk to an Expert
              </Button>
              <Button
                variant="outlined"
                color="primary"
                sx={{ textTransform: 'none' }}
              >
                Download Solution Guide
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </ServiceLayout>
  );
};

export default BackupDRPage; 