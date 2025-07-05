'use client';

import ServiceLayout from '../components/ServiceLayout';
import { Typography, Grid, Box, Card, CardContent, List, ListItem, ListItemText, TableContainer, Table, TableHead, TableCell, TableRow, TableBody, Paper, Stack, Link, Button, } from '@mui/material';
import PaymentIcon from '@mui/icons-material/Payment';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import SecurityIcon from '@mui/icons-material/Security';
import CloudQueueIcon from '@mui/icons-material/CloudQueue';
import LanguageIcon from '@mui/icons-material/Language';
import EmailIcon from '@mui/icons-material/Email';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import VerifiedIcon from '@mui/icons-material/Verified';

const CloudPage = () => {
  return (
    <ServiceLayout title="Cloud Services">
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" gutterBottom>
          Datacentrix Cloud Services: Take Control of Your Infrastructure
        </Typography>

        <Typography variant="body1" paragraph>
          This isn’t just another cloud. This is your cloud, running on local infrastructure, supported by real people, and built around how South African businesses actually work.
          No overseas call centres. No foreign billing. No surprises.
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
                <Typography variant="h6">No Lock-In. No Guesswork. Just Clear, Usage-Based Cloud </Typography>
              </Box>
              <Typography variant="body1" paragraph>
                We know how frustrating unpredictable cloud billing can be. With <strong>Datacentrix</strong>, you only pay for what you use – and you’ll know exactly what that means.
              </Typography>

              <List sx={{ listStyleType: 'disc', pl: 3 }}>
                <ListItem sx={{ display: 'list-item', py: 0 }}>
                  <ListItemText
                    primary={
                      <>
                        <strong>Pay per hour</strong> for virtual machines based on vCPU, memory, and storage
                      </>
                    }
                  />
                </ListItem>
                <ListItem sx={{ display: 'list-item', py: 0 }}>
                  <ListItemText
                    primary={
                      <>
                        <strong>Pay monthly per GB</strong> for storage you’ve allocated
                      </>
                    }
                  />
                </ListItem>
                <ListItem sx={{ display: 'list-item', py: 0 }}>
                  <ListItemText
                    primary={
                      <>
                        <strong>Pay per Mbps per month</strong> for network bandwidth
                      </>
                    }
                  />
                </ListItem>
                <ListItem sx={{ display: 'list-item', py: 0 }}>
                  <ListItemText
                    primary={
                      <>
                        <strong>Choose from</strong> on-demand, reserved instances, or hybrid pricing models
                      </>
                    }
                  />
                </ListItem>
                <ListItem sx={{ display: 'list-item', py: 0 }}>
                  <ListItemText
                    primary={
                      <>
                        <strong>Optional:</strong> Add dedicated connectivity when needed
                      </>
                    }
                  />
                </ListItem>
              </List>

              <Typography variant="body1" paragraph sx={{ mt: 2 }}>
                Whether you need flexibility or cost predictability, we’ve got the billing model to match.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', bgcolor: 'grey.50' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <VerifiedIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Compliance You Can Actually Rely On</Typography>
              </Box>
              <Typography variant="body1" paragraph>
                Your data stays right here — in South Africa — protected by ISO 27001-certified facilities and POPIA-ready practices.
                That’s not marketing spin. That’s peace of mind.
              </Typography>

              <List sx={{ listStyleType: 'disc', pl: 3 }}>
                <ListItem sx={{ display: 'list-item', py: 0 }}>
                  <ListItemText
                    primary={
                      <>
                        <strong>POPIA aligned hosting</strong> in Johannesburg and Cape Town
                      </>
                    }
                  />
                </ListItem>
                <ListItem sx={{ display: 'list-item', py: 0 }}>
                  <ListItemText
                    primary={
                      <>
                        <strong>AES-256 encryption</strong> at rest and in transit
                      </>
                    }
                  />
                </ListItem>
                <ListItem sx={{ display: 'list-item', py: 0 }}>
                  <ListItemText
                    primary={
                      <>
                        <strong>Zero Trust Architecture</strong> for continuous identity-based access control
                      </>
                    }
                  />
                </ListItem>
                <ListItem sx={{ display: 'list-item', py: 0 }}>
                  <ListItemText
                    primary={
                      <>
                        <strong>Role-based access control (RBAC)</strong> for fine-grained security
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
                <SecurityIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Security? It is Already Built In </Typography>
              </Box>
              <Typography variant="body1" paragraph>
                We do not believe you should have to pay extra for basic protection. That is why <strong>Datacentrix Cloud</strong> includes serious, enterprise-grade security from the start.
              </Typography>

              <List sx={{ listStyleType: 'disc', pl: 3 }}>
                <ListItem sx={{ display: 'list-item', py: 0 }}>
                  <ListItemText
                    primary={
                      <>
                        <strong>FortiGate firewalls</strong> and policy-based controls
                      </>
                    }
                  />
                </ListItem>
                <ListItem sx={{ display: 'list-item', py: 0 }}>
                  <ListItemText
                    primary={
                      <>
                        <strong>Static IPs</strong> and tenant isolation
                      </>
                    }
                  />
                </ListItem>
                <ListItem sx={{ display: 'list-item', py: 0 }}>
                  <ListItemText
                    primary={
                      <>
                        <strong>VPN</strong> and private network access
                      </>
                    }
                  />
                </ListItem>
                <ListItem sx={{ display: 'list-item', py: 0 }}>
                  <ListItemText
                    primary={
                      <>
                        <strong>Firewall-as-a-Service</strong> and secure cloud edge
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
                <CloudQueueIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Built for Hybrid and Multi-Cloud Use</Typography>
              </Box>
              <Typography variant="body1" paragraph>
                Already using <strong>Datacentrix</strong> for backup or disaster recovery? Good news – your cloud workloads plug straight in.
                Want to build a hybrid model across colocation and IaaS? We’re ready.
              </Typography>

              <List sx={{ listStyleType: 'disc', pl: 3 }}>
                <ListItem sx={{ display: 'list-item', py: 0 }}>
                  <ListItemText
                    primary={
                      <>
                        <strong>Public Cloud:</strong> Fully managed, multi-tenant infrastructure hosted in local data centres
                      </>
                    }
                  />
                </ListItem>
                <ListItem sx={{ display: 'list-item', py: 0 }}>
                  <ListItemText
                    primary={
                      <>
                        <strong>Private Cloud:</strong> Dedicated environments for sensitive workloads
                      </>
                    }
                  />
                </ListItem>
                <ListItem sx={{ display: 'list-item', py: 0, fontStyle: 'italic' }}>
                  <ListItemText
                    primary={
                      <>
                        <em>Note: Delivered as an ancillary service via a separate business unit</em>
                      </>
                    }
                  />
                </ListItem>
                <ListItem sx={{ display: 'list-item', py: 0 }}>
                  <ListItemText
                    primary={
                      <>
                        <strong>Hybrid Cloud:</strong> Seamless integration with your on-prem systems
                      </>
                    }
                  />
                </ListItem>
                <ListItem sx={{ display: 'list-item', py: 0 }}>
                  <ListItemText
                    primary={
                      <>
                        <strong>Multi-Cloud:</strong> Workload portability with AWS, Azure, and Google Cloud
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
                <CurrencyExchangeIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Why Keep Paying for Cloud That Doesn’t Fit You</Typography>
              </Box>
              <Typography variant="body1" paragraph>
                With <strong>Datacentrix</strong>, you get local, compliant, cost-efficient cloud that does exactly what you need – nothing more, nothing less. Our teams speak your language, know your pain points, and back every claim with action.
              </Typography>

              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f0f4f8' }}>
                      <TableCell><strong>What You Need</strong></TableCell>
                      <TableCell><strong>What We Deliver</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell><strong>ZAR Billing</strong></TableCell>
                      <TableCell>Quoted and billed in South African Rand</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><strong>Local Hosting</strong></TableCell>
                      <TableCell>Your data never leaves the country</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><strong>No Egress Fees</strong></TableCell>
                      <TableCell>Retrieve your data with no hidden charges</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><strong>Integrated Backup & DRaaS</strong></TableCell>
                      <TableCell>Native Rubrik integration, hosted locally</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><strong>Custom Contracts</strong></TableCell>
                      <TableCell>SLAs, billing, and support tailored to you</TableCell>
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
                <TrendingUpIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Real Use Cases, Real Business Impact</Typography>
              </Box>


              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f0f4f8' }}>
                      <TableCell><strong>Industry</strong></TableCell>
                      <TableCell><strong>Example</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell><strong>Financial Services</strong></TableCell>
                      <TableCell>Secure, compliant cloud workloads</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><strong>Healthcare</strong></TableCell>
                      <TableCell>Protected EMR data and backups</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><strong>Retail &amp; eCommerce</strong></TableCell>
                      <TableCell>Scalable platforms for online demand</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><strong>Manufacturing</strong></TableCell>
                      <TableCell>IoT cloud for supply chains and smart factories</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><strong>Education &amp; Research</strong></TableCell>
                      <TableCell>High-performance computing environments</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><strong>Legal</strong></TableCell>
                      <TableCell>Secure document storage and archiving</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><strong>Agriculture</strong></TableCell>
                      <TableCell>Smart farming with cloud-connected analytics</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><strong>Logistics</strong></TableCell>
                      <TableCell>Cloud-based tracking and operations systems</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
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
                  “Datacentrix has fundamentally changed the way we manage infrastructure. With their cloud services, we’ve cut voice costs by nearly 40%, improved mobility for our hybrid workforce, and gained a level of control and visibility we never had before. The migration was seamless, the support is local, and the results speak for themselves.”
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  - IT Operations Manager, Axiz
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

export default CloudPage; 