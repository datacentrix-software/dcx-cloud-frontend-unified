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
  Chip,
  Divider,
  Alert
} from '@mui/material';
import {
  CreditCard,
  Receipt,
  AccountBalance,
  Business,
  SwapHoriz
} from '@mui/icons-material';
import WalletStatement from '@/app/components/wallet/WalletStatement';

const customerTypes = [
  {
    id: 'adcock-org-id',
    name: 'Adcock Ingram',
    type: 'credit_card',
    sector: 'Healthcare/Pharmaceutical',
    description: 'PAYG / Credit Card Customer - Steady Growth',
    features: [
      '6 months of transaction history',
      'VM provisioning, resizing, termination events',
      'Auto top-up when balance low',
      'Seasonal healthcare compliance peaks'
    ],
    icon: <CreditCard />,
    color: 'primary' as const,
    pattern: 'Steady Growth Pattern',
    status: 'Active - Pharmaceutical Company'
  },
  {
    id: 'vodacom-org-id', 
    name: 'Vodacom',
    type: 'invoice',
    sector: 'Telecommunications',
    description: 'Invoice Customer - High Utilization 24x7',
    features: [
      'R100,000+ credit facility',
      '8+ VMs per month provisioning',
      'High availability requirements',
      'December seasonal peaks'
    ],
    icon: <Receipt />,
    color: 'secondary' as const,
    pattern: 'High Utilization 24x7',
    status: 'Active - Telecom Infrastructure'
  },
  {
    id: 'manchest-org-id',
    name: 'Manchester University',
    type: 'credit_card',
    sector: 'Education',
    description: 'PAYG Customer - Academic Calendar Pattern',
    features: [
      'Academic calendar-based usage',
      'Low activity Dec-Jan periods',
      'High activity Feb-May, Aug-Nov',
      'Budget-conscious operations'
    ],
    icon: <CreditCard />,
    color: 'warning' as const,
    pattern: 'Academic Calendar',
    status: 'Active - Educational Institution'
  },
  {
    id: 'capitec-org-id',
    name: 'Capitec Bank',
    type: 'invoice',
    sector: 'Financial Services',
    description: 'Invoice Customer - High Availability Banking',
    features: [
      'Critical banking infrastructure',
      'Month-end processing peaks',
      'Compliance-driven provisioning',
      'Zero-downtime requirements'
    ],
    icon: <Receipt />,
    color: 'success' as const,
    pattern: 'High Availability Banking',
    status: 'Active - Banking Services'
  },
  {
    id: 'sanlam-org-id',
    name: 'Sanlam',
    type: 'invoice',
    sector: 'Financial Services',
    description: 'Invoice Customer - Compliance Driven',
    features: [
      'Quarter-end reporting peaks',
      'Regulatory compliance requirements',
      'Conservative termination policy',
      'Insurance industry patterns'
    ],
    icon: <Receipt />,
    color: 'info' as const,
    pattern: 'Compliance Driven',
    status: 'Active - Insurance Services'
  }
];

export default function WalletDemo() {
  const [selectedCustomer, setSelectedCustomer] = useState(customerTypes[0]);

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Comprehensive Wallet System - 6 Month Simulation
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Complete wallet logic demonstration with realistic 6-month transaction histories showing 
          VM lifecycle events, service changes, opening deposits, and industry-specific usage patterns
        </Typography>
        
        <Alert severity="success" sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>6-Month Comprehensive Simulation:</strong> Each customer shows realistic transaction 
            patterns including opening deposits, VM provisioning/resizing/termination, seasonal variations, 
            industry-specific usage patterns, and complete audit trails. This emulates the full-scale 
            testing system with 100+ companies across multiple economic sectors.
          </Typography>
        </Alert>

        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: 'primary.50' }}>
              <Typography variant="h6" color="primary">5 Companies</Typography>
              <Typography variant="caption">Across Multiple Sectors</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: 'success.50' }}>
              <Typography variant="h6" color="success.main">6 Months</Typography>
              <Typography variant="caption">Rich Transaction History</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: 'info.50' }}>
              <Typography variant="h6" color="info.main">100+ Transactions</Typography>
              <Typography variant="caption">Per Customer</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: 'warning.50' }}>
              <Typography variant="h6" color="warning.main">Full VM Lifecycle</Typography>
              <Typography variant="caption">Provision, Resize, Terminate</Typography>
            </Paper>
          </Grid>
        </Grid>
      </Paper>

      {/* Customer Type Selector */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Select Customer Type to View Statement
        </Typography>
        <Grid container spacing={2}>
          {customerTypes.map((customer) => (
            <Grid item xs={12} md={4} key={customer.id}>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  border: selectedCustomer.id === customer.id ? 2 : 1,
                  borderColor: selectedCustomer.id === customer.id ? 'primary.main' : 'divider',
                  '&:hover': { boxShadow: 3 }
                }}
                onClick={() => setSelectedCustomer(customer)}
              >
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                    {customer.icon}
                    <Box>
                      <Typography variant="h6">
                        {customer.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {customer.description}
                      </Typography>
                    </Box>
                  </Stack>
                  
                  <Stack direction="row" spacing={1} sx={{ mb: 2 }} flexWrap="wrap" gap={1}>
                    <Chip 
                      label={customer.sector}
                      color={customer.color}
                      size="small"
                    />
                    <Chip 
                      label={customer.type === 'credit_card' ? 'PAYG' : 'Invoice'}
                      variant="outlined"
                      size="small"
                    />
                  </Stack>

                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                    <strong>Pattern:</strong> {customer.pattern}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                    <strong>Status:</strong> {customer.status}
                  </Typography>

                  <Divider sx={{ my: 1 }} />
                  
                  <Typography variant="caption" color="text.secondary">
                    Key Features:
                  </Typography>
                  {customer.features.map((feature, index) => (
                    <Typography key={index} variant="caption" display="block" color="text.secondary">
                      • {feature}
                    </Typography>
                  ))}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Current Selection Info */}
      <Paper sx={{ p: 2, mb: 3, backgroundColor: 'primary.50' }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Business />
          <Typography variant="h6">
            Currently Viewing: {selectedCustomer.name}
          </Typography>
          <Chip 
            label={selectedCustomer.type === 'credit_card' ? 'PAYG / Credit Card' : 'Invoice Customer'}
            color={selectedCustomer.color}
          />
          <Box sx={{ flexGrow: 1 }} />
          <Button
            variant="outlined"
            startIcon={<SwapHoriz />}
            onClick={() => {
              const currentIndex = customerTypes.findIndex(c => c.id === selectedCustomer.id);
              const nextIndex = (currentIndex + 1) % customerTypes.length;
              setSelectedCustomer(customerTypes[nextIndex]);
            }}
          >
            Switch Customer
          </Button>
        </Stack>
      </Paper>

      {/* Key Differences Explanation */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                <CreditCard color="primary" />
                <Typography variant="h6">PAYG / Credit Card Customers</Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Immediate payment model requiring positive balance:
              </Typography>
              <Box component="ul" sx={{ pl: 2, mt: 1 }}>
                <Typography component="li" variant="body2">
                  Must maintain positive wallet balance for VM operations
                </Typography>
                <Typography component="li" variant="body2">
                  Automatic or manual credit card top-ups
                </Typography>
                <Typography component="li" variant="body2">
                  Immediate disk charges at VM provisioning
                </Typography>
                <Typography component="li" variant="body2">
                  Hourly billing for compute resources
                </Typography>
                <Typography component="li" variant="body2">
                  VM operations halt on insufficient funds
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                <Receipt color="secondary" />
                <Typography variant="h6">Invoice Customers</Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Credit-based model with extended payment terms:
              </Typography>
              <Box component="ul" sx={{ pl: 2, mt: 1 }}>
                <Typography component="li" variant="body2">
                  Can operate with negative balance (within credit limit)
                </Typography>
                <Typography component="li" variant="body2">
                  Monthly invoicing with NET30/60/90 payment terms
                </Typography>
                <Typography component="li" variant="body2">
                  Pre-authorized credit limits (e.g., R100,000)
                </Typography>
                <Typography component="li" variant="body2">
                  Month-end reconciliation with rollover credits
                </Typography>
                <Typography component="li" variant="body2">
                  EFT/Wire transfer payments against invoices
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Wallet Statement Component */}
      <WalletStatement 
        organizationId={selectedCustomer.id}
        organizationName={selectedCustomer.name}
      />
    </Box>
  );
}