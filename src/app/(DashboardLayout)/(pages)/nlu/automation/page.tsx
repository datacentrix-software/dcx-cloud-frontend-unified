'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Card,
  CardContent,
  Stack,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider
} from '@mui/material';
import {
  PlayArrow,
  Stop,
  Download,
  Dashboard,
  AccountBalance,
  Computer,
  Assessment,
  ExpandMore,
  CheckCircle,
  Error,
  Info,
  Schedule
} from '@mui/icons-material';

interface AutomationResult {
  type: string;
  data?: any;
  screenshot?: string;
  timestamp: string;
  success?: boolean;
  error?: string;
}

const automationTypes = [
  {
    id: 'comprehensive',
    name: 'Comprehensive Audit',
    description: 'Full system audit including dashboard, wallets, and VM inventory',
    icon: <Assessment />,
    color: 'primary'
  },
  {
    id: 'dashboard',
    name: 'Dashboard Metrics',
    description: 'Capture current dashboard metrics and KPIs',
    icon: <Dashboard />,
    color: 'info'
  },
  {
    id: 'wallet',
    name: 'Wallet Report',
    description: 'Generate detailed wallet transaction report',
    icon: <AccountBalance />,
    color: 'success'
  },
  {
    id: 'vm-inventory',
    name: 'VM Inventory',
    description: 'Capture complete virtual machine inventory',
    icon: <Computer />,
    color: 'warning'
  }
];

const organizationOptions = [
  { id: 'adcock-org-id', name: 'Adcock Ingram', type: 'PAYG/Credit Card' },
  { id: 'vodacom-org-id', name: 'Vodacom', type: 'Invoice Customer' },
  { id: 'manchest-org-id', name: 'Manchester University', type: 'Education' },
  { id: 'capitec-org-id', name: 'Capitec Bank', type: 'Financial Services' },
  { id: 'sanlam-org-id', name: 'Sanlam', type: 'Insurance' }
];

export default function AutomationPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [selectedType, setSelectedType] = useState('comprehensive');
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [selectedOrg, setSelectedOrg] = useState('adcock-org-id');
  const [results, setResults] = useState<AutomationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runAutomation = async () => {
    if (!credentials.email || !credentials.password) {
      setError('Email and password are required');
      return;
    }

    setIsRunning(true);
    setError(null);
    setResults(null);

    try {
      const requestBody = {
        email: credentials.email,
        password: credentials.password,
        type: selectedType,
        ...(selectedType === 'wallet' && { organizationId: selectedOrg })
      };

      const response = await fetch('/api/automation/audit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      const result = await response.json();

      if (result.success) {
        setResults(result.results);
      } else {
        setError(result.error || 'Automation failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error occurred');
    } finally {
      setIsRunning(false);
    }
  };

  const downloadResults = () => {
    if (!results) return;

    const dataStr = JSON.stringify(results, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dcx-automation-${results.type}-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const renderResults = () => {
    if (!results) return null;

    const { data } = results;

    return (
      <Paper sx={{ p: 3, mt: 3 }}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
          <CheckCircle color="success" />
          <Typography variant="h6">
            Automation Results - {results.type}
          </Typography>
          <Chip 
            label={`Completed at ${new Date(results.timestamp).toLocaleString()}`}
            color="success"
            size="small"
          />
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={downloadResults}
          >
            Download Results
          </Button>
        </Stack>

        {results.type === 'dashboard' && data && (
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="h6">Dashboard Metrics</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={12} md={3}>
                  <Card>
                    <CardContent>
                      <Typography variant="h4" color="primary">{data.totalVMs}</Typography>
                      <Typography variant="body2">Total VMs</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Card>
                    <CardContent>
                      <Typography variant="h4" color="info.main">{data.totalCPUs}</Typography>
                      <Typography variant="body2">Total CPUs</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Card>
                    <CardContent>
                      <Typography variant="h4" color="warning.main">{data.totalRAM}GB</Typography>
                      <Typography variant="body2">Total RAM</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Card>
                    <CardContent>
                      <Typography variant="h4" color="success.main">{data.activeCustomers}</Typography>
                      <Typography variant="body2">Active Customers</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
              {data.topCustomers && data.topCustomers.length > 0 && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" gutterBottom>Top Customers</Typography>
                  <List>
                    {data.topCustomers.map((customer: any, index: number) => (
                      <ListItem key={index}>
                        <ListItemText
                          primary={customer.name}
                          secondary={`Usage: ${customer.usage} | Revenue: ${customer.revenue}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </AccordionDetails>
          </Accordion>
        )}

        {results.type === 'wallet' && data && (
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="h6">Wallet Report - {data.organizationName}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={4}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" color="primary">{data.currentBalance}</Typography>
                      <Typography variant="body2">Current Balance</Typography>
                      <Chip 
                        label={data.billingType === 'credit_card' ? 'PAYG/Credit Card' : 'Invoice Customer'}
                        color={data.billingType === 'credit_card' ? 'primary' : 'secondary'}
                        size="small"
                        sx={{ mt: 1 }}
                      />
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" color="success.main">{data.totalCredits}</Typography>
                      <Typography variant="body2">Total Credits</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" color="error.main">{data.totalDebits}</Typography>
                      <Typography variant="body2">Total Debits</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
              {data.recentTransactions && data.recentTransactions.length > 0 && (
                <Box>
                  <Typography variant="h6" gutterBottom>Recent Transactions</Typography>
                  <List>
                    {data.recentTransactions.slice(0, 10).map((transaction: any, index: number) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          {transaction.type === 'credit' ? 
                            <TrendingUp color="success" /> : 
                            <TrendingDown color="error" />
                          }
                        </ListItemIcon>
                        <ListItemText
                          primary={transaction.description}
                          secondary={`${transaction.amount} - ${transaction.date}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </AccordionDetails>
          </Accordion>
        )}

        {results.type === 'vm-inventory' && data && (
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="h6">VM Inventory ({data.length} VMs)</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <List>
                {data.slice(0, 10).map((vm: any, index: number) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <Computer />
                    </ListItemIcon>
                    <ListItemText
                      primary={vm.name || vm.vmId}
                      secondary={`${vm.cpu} | ${vm.memory} | ${vm.storage} | ${vm.status} | ${vm.organization}`}
                    />
                  </ListItem>
                ))}
              </List>
              {data.length > 10 && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  Showing first 10 of {data.length} VMs. Download full results for complete inventory.
                </Typography>
              )}
            </AccordionDetails>
          </Accordion>
        )}

        {results.type === 'comprehensive' && data && (
          <Box>
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="h6">Comprehensive Audit Summary</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" gutterBottom>Dashboard Metrics</Typography>
                    <Typography>Total VMs: {data.dashboard?.totalVMs || 0}</Typography>
                    <Typography>Total CPUs: {data.dashboard?.totalCPUs || 0}</Typography>
                    <Typography>Total RAM: {data.dashboard?.totalRAM || 0}GB</Typography>
                    <Typography>Active Customers: {data.dashboard?.activeCustomers || 0}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" gutterBottom>Audit Results</Typography>
                    <Typography>Wallet Reports: {data.walletReports?.length || 0} organizations</Typography>
                    <Typography>VM Inventory: {data.vmInventory?.length || 0} VMs</Typography>
                    <Typography>Screenshots: {data.screenshots?.length || 0} files</Typography>
                    <Typography>Timestamp: {new Date(data.timestamp).toLocaleString()}</Typography>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          </Box>
        )}

        {results.screenshot && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>Screenshot Captured</Typography>
            <Alert severity="info">
              Screenshot saved to: {results.screenshot}
            </Alert>
          </Box>
        )}
      </Paper>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          DCX Cloud Automation Center
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Automated testing, monitoring, and reporting for the entire DCX Cloud platform
        </Typography>
      </Paper>

      {/* Automation Type Selection */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Select Automation Type
        </Typography>
        <Grid container spacing={2}>
          {automationTypes.map((type) => (
            <Grid item xs={12} md={6} lg={3} key={type.id}>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  border: selectedType === type.id ? 2 : 1,
                  borderColor: selectedType === type.id ? `${type.color}.main` : 'divider',
                  '&:hover': { boxShadow: 3 }
                }}
                onClick={() => setSelectedType(type.id)}
              >
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                    {type.icon}
                    <Typography variant="h6">
                      {type.name}
                    </Typography>
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    {type.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Configuration */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Authentication & Configuration
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={credentials.email}
              onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
              placeholder="user@datacentrix.co.za"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
              placeholder="Enter your password"
            />
          </Grid>
          {selectedType === 'wallet' && (
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Organization</InputLabel>
                <Select
                  value={selectedOrg}
                  onChange={(e) => setSelectedOrg(e.target.value)}
                  label="Organization"
                >
                  {organizationOptions.map((org) => (
                    <MenuItem key={org.id} value={org.id}>
                      {org.name} ({org.type})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}
        </Grid>
      </Paper>

      {/* Action Buttons */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            size="large"
            startIcon={isRunning ? <CircularProgress size={20} color="inherit" /> : <PlayArrow />}
            onClick={runAutomation}
            disabled={isRunning || !credentials.email || !credentials.password}
          >
            {isRunning ? 'Running Automation...' : 'Run Automation'}
          </Button>
          {isRunning && (
            <Button
              variant="outlined"
              startIcon={<Stop />}
              disabled
            >
              Stop
            </Button>
          )}
        </Stack>
      </Paper>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="body2">{error}</Typography>
        </Alert>
      )}

      {/* Results */}
      {renderResults()}

      {/* Help Section */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Command Line Usage
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          You can also run automation via command line:
        </Typography>
        <Box sx={{ backgroundColor: 'grey.100', p: 2, borderRadius: 1, fontFamily: 'monospace' }}>
          <Typography variant="body2">
            # Run comprehensive audit<br />
            npm run automation:full -- --email=user@example.com --password=mypass<br /><br />
            # Capture dashboard only<br />
            npm run automation:dashboard -- --email=user@example.com --password=mypass<br /><br />
            # Generate wallet report<br />
            npm run automation:wallet -- --email=user@example.com --password=mypass --org=adcock-org-id
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}

// Import for icons
import { TrendingUp, TrendingDown } from '@mui/icons-material';