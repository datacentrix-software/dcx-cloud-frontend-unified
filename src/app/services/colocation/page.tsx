'use client';

import ServiceLayout from '../components/ServiceLayout';
import { Typography, Grid, Box, Card, CardContent, List, ListItem, ListItemText, TableContainer, Table, TableHead, TableCell, TableRow, TableBody, Paper, Stack, Link, Button } from '@mui/material';
import DnsIcon from '@mui/icons-material/Dns';
import RouterIcon from '@mui/icons-material/Router';
import PowerIcon from '@mui/icons-material/Power';
import EmailIcon from '@mui/icons-material/Email';
import LanguageIcon from '@mui/icons-material/Language';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import IntegrationInstructionsIcon from '@mui/icons-material/IntegrationInstructions';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import CloudDoneIcon from '@mui/icons-material/CloudDone';
import FactoryIcon from '@mui/icons-material/Factory';
import HardwareIcon from '@mui/icons-material/Hardware';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

const ColocationPage = () => {
  return (
    <ServiceLayout title="Colocation Services">
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" gutterBottom>
          Datacentrix Colocation Services: Your Infrastructure. Our Tiered Facilities.
        </Typography>
        <Typography variant="body1" paragraph>
          Host your infrastructure in Africa’s most connected, resilient, and secure data centre environments without giving up control.
          Datacentrix Colocation keeps your hardware in your hands, while we deliver the power, connectivity, and compliance you need to stay online and audit-ready.      </Typography>
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
                <Typography variant="h6">Total Control. Zero Compromise</Typography>
              </Box>
              <Typography variant="body1" paragraph>
                Whether you’re placing a single server or filling high-density racks, <strong>Datacentrix</strong> offers colocation solutions that scale with your business and security profile.
              </Typography>

              <List sx={{ listStyleType: 'disc', pl: 3 }}>
                <ListItem sx={{ display: 'list-item', py: 0 }}>
                  <ListItemText
                    primary="Full, half, or custom rack configurations"
                  />
                </ListItem>
                <ListItem sx={{ display: 'list-item', py: 0 }}>
                  <ListItemText
                    primary="Private caged environments for isolation and compliance"
                  />
                </ListItem>
                <ListItem sx={{ display: 'list-item', py: 0 }}>
                  <ListItemText
                    primary="High-density power setups for GPU and AI hardware"
                  />
                </ListItem>
                <ListItem sx={{ display: 'list-item', py: 0 }}>
                  <ListItemText
                    primary="Structured cabling for clean, scalable deployments"
                  />
                </ListItem>
                <ListItem sx={{ display: 'list-item', py: 0 }}>
                  <ListItemText
                    primary="Redundant power feeds (A+B) for uninterrupted uptime"
                  />
                </ListItem>
                <ListItem sx={{ display: 'list-item', py: 0 }}>
                  <ListItemText
                    primary="Guaranteed 99.999% uptime SLA backed by infrastructure resilience"
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
                <RouterIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Carrier-Neutral and Cloud-Connected </Typography>
              </Box>
              <Typography variant="body1" paragraph>
                We don’t lock you into any one network. Our colocation is carrier-neutral with high-speed access to fibre, peering, and major cloud platforms.
              </Typography>

              <List sx={{ listStyleType: 'disc', pl: 3 }}>
                <ListItem sx={{ display: 'list-item', py: 0 }}>
                  <ListItemText
                    primary={
                      <>
                        <strong>Cross-connects</strong> for direct links to ISPs, services, and partners
                      </>
                    }
                  />
                </ListItem>
                <ListItem sx={{ display: 'list-item', py: 0 }}>
                  <ListItemText
                    primary={
                      <>
                        <strong>Direct cloud on-ramps</strong> to AWS, Azure, Google, Oracle, and Datacentrix Cloud
                      </>
                    }
                  />
                </ListItem>
                <ListItem sx={{ display: 'list-item', py: 0 }}>
                  <ListItemText
                    primary={
                      <>
                        <strong>Peering</strong> at all major NAP and INX exchange points
                      </>
                    }
                  />
                </ListItem>
                <ListItem sx={{ display: 'list-item', py: 0 }}>
                  <ListItemText
                    primary={
                      <>
                        <strong>Over 550 network interconnects</strong> available through our facilities
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
                <LockOutlinedIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Security and Compliance, Built In</Typography>
              </Box>
              <Typography variant="body1" paragraph>
                <strong>Datacentrix</strong> colocates only in certified, physically secure datacentres — ensuring your systems meet the highest standards for access, safety, and compliance.
              </Typography>

              <List sx={{ listStyleType: 'disc', pl: 3 }}>
                <ListItem sx={{ display: 'list-item', py: 0 }}>
                  <ListItemText
                    primary={
                      <>
                        <strong>ISO 27001, ISO 9001, ISO 14001,</strong> and <strong>PCI-DSS</strong> compliant
                      </>
                    }
                  />
                </ListItem>
                <ListItem sx={{ display: 'list-item', py: 0 }}>
                  <ListItemText
                    primary={
                      <>
                        <strong>24/7 biometric access control, CCTV,</strong> on-site security
                      </>
                    }
                  />
                </ListItem>
                <ListItem sx={{ display: 'list-item', py: 0 }}>
                  <ListItemText
                    primary={
                      <>
                        <strong>Fire suppression, climate control,</strong> and environmental monitoring
                      </>
                    }
                  />
                </ListItem>
                <ListItem sx={{ display: 'list-item', py: 0 }}>
                  <ListItemText
                    primary={
                      <>
                        <strong>Key vaults</strong> and physically segmented customer zones
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
                <PowerIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">On-the-Ground Support. Always Available.</Typography>
              </Box>


              <Typography variant="body1" paragraph>
                Can’t be on-site? We can. <strong>Datacentrix Remote Hands &amp; Eyes</strong> gives you 24/7 access to certified technicians who act on your behalf — saving you time and travel.
              </Typography>

              <List sx={{ listStyleType: 'disc', pl: 3 }}>
                <ListItem sx={{ display: 'list-item', py: 0 }}>
                  <ListItemText
                    primary={
                      <>
                        <strong>Smart hands support</strong> for restarts, patching, cabling, diagnostics
                      </>
                    }
                  />
                </ListItem>
                <ListItem sx={{ display: 'list-item', py: 0 }}>
                  <ListItemText
                    primary={
                      <>
                        <strong>Visual inspection</strong> and photo reporting on request
                      </>
                    }
                  />
                </ListItem>
                <ListItem sx={{ display: 'list-item', py: 0 }}>
                  <ListItemText
                    primary={
                      <>
                        <strong>Certified rack and cable management</strong> by Datacentre engineers
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
                <IntegrationInstructionsIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Integrated with the Datacentrix Infrastructure Stack.</Typography>
              </Box>

              <Typography variant="body1" paragraph>
                <strong>Colocation</strong> does not stand alone. It integrates seamlessly with <strong>Datacentrix’s</strong> broader offerings—including cloud, DRaaS, and backup.
              </Typography>

              <List sx={{ listStyleType: 'disc', pl: 3 }}>
                <ListItem sx={{ display: 'list-item', py: 0 }}>
                  <ListItemText primary="Private fibre links into Datacentrix Cloud and Backup environments" />
                </ListItem>
                <ListItem sx={{ display: 'list-item', py: 0 }}>
                  <ListItemText primary="Hybrid IT support with on-prem and offsite integration" />
                </ListItem>
                <ListItem sx={{ display: 'list-item', py: 0 }}>
                  <ListItemText primary="Unified SLA and infrastructure monitoring across your stack" />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', bgcolor: 'grey.50' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CloudDoneIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Deployment Options</Typography>
              </Box>

              <List sx={{ listStyleType: 'disc', pl: 3 }}>
                <ListItem sx={{ display: 'list-item', py: 0 }}>
                  <ListItemText primary="Single-Site Hosting in JHB, CPT, or Durban for local presence" />
                </ListItem>
                <ListItem sx={{ display: 'list-item', py: 0 }}>
                  <ListItemText primary="Geographic Redundancy via multi-site DR and replication" />
                </ListItem>
                <ListItem sx={{ display: 'list-item', py: 0 }}>
                  <ListItemText primary="NLD (National Long-Distance) Fibre Connectivity between sites" />
                </ListItem>
                <ListItem sx={{ display: 'list-item', py: 0 }}>
                  <ListItemText primary="Hybrid Integration with cross-connects to customer systems and hyperscalers" />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', bgcolor: 'grey.50' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <FactoryIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Industry Use Cases</Typography>
              </Box>

              <TableContainer component={Paper} sx={{ mb: 3 }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f0f4f8' }}>
                      <TableCell><strong>Sector</strong></TableCell>
                      <TableCell><strong>Use Case</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell><strong>Financial Services</strong></TableCell>
                      <TableCell>Hosting for banking and secure finance systems</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><strong>Healthcare</strong></TableCell>
                      <TableCell>EMR and compliance-driven data platforms</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><strong>Retail & eCommerce</strong></TableCell>
                      <TableCell>Fast-response platforms for customer transactions</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><strong>Manufacturing</strong></TableCell>
                      <TableCell>Reliable infrastructure for automation and plant control</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><strong>Public Sector</strong></TableCell>
                      <TableCell>Secure, compliant infrastructure for government workloads</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>

            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', bgcolor: 'grey.50' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <HardwareIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Your Hardware. Our Reliability</Typography>
              </Box>

              <Typography variant="body1" paragraph>
                <strong>Datacentrix Colocation</strong> gives you enterprise-grade hosting without losing visibility or control.
              </Typography>

              <Typography variant="body1" paragraph>
                Whether you are running critical apps or building a hybrid stack, we give you the space, security, and services to stay in charge—locally and reliably.
              </Typography>

            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Grid item xs={12} md={6}>
        <Card sx={{ height: '100%', bgcolor: 'grey.50' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <RequestQuoteIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">Clear, Predictable Billing</Typography>
            </Box>
            <TableContainer component={Paper} sx={{ mb: 3 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f0f4f8' }}>
                    <TableCell><strong>Option</strong></TableCell>
                    <TableCell><strong>Rack Size</strong></TableCell>
                    <TableCell><strong>Power Model</strong></TableCell>
                    <TableCell><strong>Included Services</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell><strong>Half Rack</strong></TableCell>
                    <TableCell>~20U</TableCell>
                    <TableCell>Metered (per 1.1kVA)</TableCell>
                    <TableCell>Cooling, Remote Hands &amp; Eyes</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Full Rack</strong></TableCell>
                    <TableCell>~42U</TableCell>
                    <TableCell>Metered / High-density</TableCell>
                    <TableCell>Access control, cabling, SLA-backed uptime</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Caged Space</strong></TableCell>
                    <TableCell>Per metre</TableCell>
                    <TableCell>Custom config</TableCell>
                    <TableCell>Enhanced security, isolated zones</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Cross-Connects</strong></TableCell>
                    <TableCell>Per cable run</TableCell>
                    <TableCell>Fibre/Copper</TableCell>
                    <TableCell>Direct interconnectivity</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>

            <List sx={{ listStyleType: 'disc', pl: 3 }}>
              <ListItem sx={{ display: 'list-item', py: 0 }}>
                <ListItemText primary="Fixed-term contracts (12+ months) for pricing stability" />
              </ListItem>
              <ListItem sx={{ display: 'list-item', py: 0 }}>
                <ListItemText primary="Transparent, Rand-based billing—no forex surprises" />
              </ListItem>
              <ListItem sx={{ display: 'list-item', py: 0 }}>
                <ListItemText primary="Power usage charged on actual metered consumption" />
              </ListItem>
            </List>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={6} sx={{ mt: 2 }}>
        <Card sx={{ height: '100%', bgcolor: 'grey.50' }}>
          <CardContent>

            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                Customer Testimonial
              </Typography>

              <Paper elevation={2} sx={{ p: 2, backgroundColor: '#f9fafb' }}>
                <Typography variant="body1" sx={{ fontStyle: 'italic', mb: 2 }}>
                  “Datacentrix has a clear understanding of where we want to be as a company, and they have aligned themselves with our goals every step of the way. Their colocation solution gave us the resilient infrastructure we needed — without losing ownership or control of our hardware. It’s a partnership built on reliability and mutual commitment.”
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  - Technology Executive, Exxaro
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
                Request a Demo
              </Button>
              <Button
                variant="outlined"
                color="primary"
                sx={{ textTransform: 'none' }}
              >
                Book a Consultation
              </Button>
              <Button
                variant="outlined"
                color="primary"
                sx={{ textTransform: 'none' }}
              >
                Explore Services
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </ServiceLayout>
  );
};

export default ColocationPage; 