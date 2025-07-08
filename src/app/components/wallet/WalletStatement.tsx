'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Divider,
  Badge
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  CreditCard,
  Receipt,
  Warning,
  CheckCircle,
  AccountBalance,
  Download
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

interface Transaction {
  id: string;
  amount: number;
  type: 'credit' | 'debit';
  description: string;
  createdAt: string;
  balanceAfter: number;
  formattedAmount: string;
  amountColor: 'success' | 'error';
  relativeTime: string;
  status?: 'failed' | 'completed';
  category?: 'deposit' | 'vm_provision' | 'vm_hourly' | 'vm_resize' | 'vm_terminate' | 'disk_provision' | 'auto_topup' | 'invoice_payment' | 'rollover_credit' | 'penalty' | 'refund';
  vmId?: string;
  vmType?: string;
  metadata?: any;
}

interface WalletData {
  organization: {
    name: string;
    billingType: 'credit_card' | 'invoice';
    paymentMethod: string | null;
    paymentTerms?: string;
    sector?: string;
    pattern?: string;
  };
  wallet: {
    currentBalance: number;
    creditLimit: number | null;
    creditUsed?: number;
    autoTopupEnabled: boolean;
    formattedBalance: string;
    balanceStatus: 'positive' | 'negative';
  };
  transactions: Transaction[];
  summary: {
    totalTransactions: number;
    totalCredits: string;
    totalDebits: string;
    netMovement: string;
    vmStats?: {
      provisioned: number;
      resized: number;
      terminated: number;
      activeEstimate: number;
    };
    simulationPeriod?: string;
  };
}

interface Props {
  organizationId: string;
  organizationName?: string;
}

export default function WalletStatement({ organizationId, organizationName }: Props) {
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [startDate, setStartDate] = useState<dayjs.Dayjs | null>(dayjs().subtract(30, 'day'));
  const [endDate, setEndDate] = useState<dayjs.Dayjs | null>(dayjs());

  useEffect(() => {
    fetchWalletStatement();
  }, [organizationId, filterType]);

  const fetchWalletStatement = async () => {
    setLoading(true);
    setError(null);

    try {
      // Use enhanced statement API (now powered by simulation engine)
      console.log('WalletStatement - Fetching for organizationId:', organizationId);
      const queryParams = new URLSearchParams({
        organizationId,
        months: '6',
        limit: '100' // Get more transactions for better filtering
      });
      
      if (filterType !== 'all') {
        queryParams.append('type', filterType);
      }
      
      const response = await fetch(`/api/wallet/statement?${queryParams}&_t=${Date.now()}`);
      const result = await response.json();

      if (result.success) {
        // Debug: Log first few transactions to verify order in frontend
        const firstThree = result.data.transactions.slice(0, 3).map(tx => ({
          id: tx.id,
          date: tx.createdAt,
          description: tx.description.substring(0, 50)
        }));
        // Simple debug - force display in console
        console.log('=== TRANSACTION ORDER DEBUG ===');
        console.log('Total transactions:', result.data.transactions.length);
        const first = result.data.transactions[0];
        const second = result.data.transactions[1]; 
        const third = result.data.transactions[2];
        console.log('1st transaction:', first?.id, first?.createdAt, first?.description?.substring(0, 30));
        console.log('2nd transaction:', second?.id, second?.createdAt, second?.description?.substring(0, 30));
        console.log('3rd transaction:', third?.id, third?.createdAt, third?.description?.substring(0, 30));
        
        // Check order
        const firstDate = new Date(first?.createdAt).getTime();
        const secondDate = new Date(second?.createdAt).getTime();
        console.log('Is 1st newer than 2nd?', firstDate > secondDate);
        console.log('================================');
        setWalletData(result.data);
      } else {
        setError(result.error || 'Failed to fetch wallet statement');
      }
    } catch (err) {
      setError('Network error while fetching wallet statement');
      console.error('Wallet statement fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getCustomerTypeIcon = (billingType: string) => {
    return billingType === 'credit_card' ? <CreditCard /> : <Receipt />;
  };

  const getCustomerTypeColor = (billingType: string) => {
    return billingType === 'credit_card' ? 'primary' : 'secondary';
  };

  const getBalanceColor = (balanceStatus: string, billingType: string) => {
    if (billingType === 'invoice') {
      return balanceStatus === 'positive' ? 'success' : 'warning'; // Negative OK for invoice
    }
    return balanceStatus === 'positive' ? 'success' : 'error'; // Negative bad for credit card
  };

  const getTransactionIcon = (type: string, status?: string) => {
    if (status === 'failed') return <Warning color="error" />;
    return type === 'credit' ? <TrendingUp color="success" /> : <TrendingDown color="error" />;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!walletData) {
    return (
      <Alert severity="info" sx={{ mb: 2 }}>
        No wallet data available for this organization.
      </Alert>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ p: 3 }}>
        {/* Header with Organization Info */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Grid container alignItems="center" spacing={2}>
            <Grid item>
              {getCustomerTypeIcon(walletData.organization.billingType)}
            </Grid>
            <Grid item xs>
              <Typography variant="h5" component="h1" gutterBottom>
                {walletData.organization.name} - Wallet Statement
              </Typography>
              <Stack direction="row" spacing={2}>
                <Chip
                  icon={getCustomerTypeIcon(walletData.organization.billingType)}
                  label={walletData.organization.billingType === 'credit_card' ? 'PAYG / Credit Card Customer' : 'Invoice Customer'}
                  color={getCustomerTypeColor(walletData.organization.billingType)}
                  variant="outlined"
                />
                {walletData.organization.paymentTerms && (
                  <Chip
                    label={`Payment Terms: ${walletData.organization.paymentTerms.toUpperCase()}`}
                    color="info"
                    variant="outlined"
                  />
                )}
                {walletData.wallet.autoTopupEnabled && (
                  <Chip
                    icon={<CheckCircle />}
                    label="Auto Top-up Enabled"
                    color="success"
                    variant="outlined"
                  />
                )}
              </Stack>
            </Grid>
          </Grid>
        </Paper>

        {/* Wallet Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <AccountBalance 
                    color={getBalanceColor(walletData.wallet.balanceStatus, walletData.organization.billingType)} 
                  />
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Current Balance
                    </Typography>
                    <Typography 
                      variant="h6" 
                      color={getBalanceColor(walletData.wallet.balanceStatus, walletData.organization.billingType)}
                    >
                      {walletData.wallet.balanceStatus === 'negative' && walletData.organization.billingType === 'credit_card' ? '-' : ''}
                      {walletData.wallet.formattedBalance}
                    </Typography>
                  </Box>
                </Stack>
                {walletData.wallet.creditLimit && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      Credit Limit: R{(walletData.wallet.creditLimit / 100).toFixed(2)}
                    </Typography>
                    {walletData.wallet.creditUsed && (
                      <Typography variant="caption" display="block" color="text.secondary">
                        Credit Used: R{(walletData.wallet.creditUsed / 100).toFixed(2)}
                      </Typography>
                    )}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <TrendingUp color="success" />
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Total Credits
                    </Typography>
                    <Typography variant="h6" color="success.main">
                      {walletData.summary.totalCredits}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <TrendingDown color="error" />
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Total Debits
                    </Typography>
                    <Typography variant="h6" color="error.main">
                      {walletData.summary.totalDebits}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Receipt />
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Total Transactions
                    </Typography>
                    <Typography variant="h6">
                      {walletData.summary.totalTransactions}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Filters */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Transaction Type</InputLabel>
                <Select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  label="Transaction Type"
                >
                  <MenuItem value="all">All Transactions</MenuItem>
                  <MenuItem value="credit">Credits Only</MenuItem>
                  <MenuItem value="debit">Debits Only</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <DatePicker
                label="Start Date"
                value={startDate}
                onChange={setStartDate}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <DatePicker
                label="End Date"
                value={endDate}
                onChange={setEndDate}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Button
                variant="outlined"
                startIcon={<Download />}
                fullWidth
                onClick={() => alert('Export functionality would be implemented here')}
              >
                Export Statement
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Transactions Table */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Type</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell align="right">Balance After</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {walletData.transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                      No transactions found for the selected filters.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                walletData.transactions.map((transaction) => (
                  <TableRow 
                    key={transaction.id}
                    sx={{ 
                      '&:hover': { backgroundColor: 'action.hover' },
                      ...(transaction.status === 'failed' && { 
                        backgroundColor: 'error.light',
                        opacity: 0.7 
                      })
                    }}
                  >
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        {getTransactionIcon(transaction.type, transaction.status)}
                        <Typography 
                          variant="body2" 
                          sx={{ textTransform: 'capitalize' }}
                        >
                          {transaction.type}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {transaction.description}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography 
                        variant="body2" 
                        color={transaction.amountColor}
                        fontWeight={600}
                      >
                        {transaction.type === 'credit' ? '+' : '-'}{transaction.formattedAmount}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2">
                        R{(Math.abs(transaction.balanceAfter) / 100).toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {transaction.relativeTime}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {transaction.status === 'failed' ? (
                        <Chip 
                          label="Failed" 
                          color="error" 
                          size="small" 
                          variant="outlined"
                        />
                      ) : (
                        <Chip 
                          label="Success" 
                          color="success" 
                          size="small" 
                          variant="outlined"
                        />
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Customer Type Explanation */}
        <Paper sx={{ p: 3, mt: 3, backgroundColor: 'grey.50' }}>
          <Typography variant="h6" gutterBottom>
            Customer Type Information
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          {walletData.organization.billingType === 'credit_card' ? (
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                PAYG / Credit Card Customer
              </Typography>
              <Typography variant="body2">
                • Requires positive wallet balance for VM operations<br />
                • Automatic top-ups {walletData.wallet.autoTopupEnabled ? 'enabled' : 'disabled'}<br />
                • Immediate charges for disk provisioning<br />
                • Hourly billing for compute resources
              </Typography>
            </Alert>
          ) : (
            <Alert severity="success" sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Invoice Customer (Account-Based)
              </Typography>
              <Typography variant="body2">
                • Credit limit: R{walletData.wallet.creditLimit ? (walletData.wallet.creditLimit / 100).toFixed(2) : 'No limit'}<br />
                • Payment terms: {walletData.organization.paymentTerms || 'Not specified'}<br />
                • Can operate with negative balance (within credit limit)<br />
                • Monthly invoicing for all charges<br />
                • Rollover credits for unused reservations
              </Typography>
            </Alert>
          )}
        </Paper>
      </Box>
    </LocalizationProvider>
  );
}