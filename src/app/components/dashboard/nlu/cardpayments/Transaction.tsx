'use client';
import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Button,
  Select,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Grid
} from '@mui/material';
import { IconFilter as FilterIcon } from '@tabler/icons-react';

import VMComponent from './pdfbutton';
import { useAuthStore } from '@/store';
import { fetchTransactionsApi } from './getTrasactions';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
interface Transaction {
  reference: string;
  amount: number;
  paidAt: string;
  status: string;
}

const formatDate = (date: Date) => {
  return date.toISOString().split('T')[0];
};

const TransactionsCard: React.FC = () => {
  const today = new Date();
  const pastDate = new Date(today);
  pastDate.setDate(today.getDate() - 35);

  const [fromDate, setFromDate] = useState(formatDate(pastDate));
  const [toDate, setToDate] = useState(formatDate(today));
  const [status, setStatus] = useState('success');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [vm, setVms] = useState([]);
  const [errors, setErrors] = useState({ fromDate: '', toDate: '' });
  const authUser: any = useAuthStore((state) => state.user);

  useEffect(() => {
    // fetchTransactions();
    // sessionStorage.setItem('fromDate', fromDate);
    // sessionStorage.setItem('toDate', toDate);
  }, []);

  const handleInputChange = (
    field: string,
    value: string,
    validateFn: (value: string) => boolean,
    errorMsg: string
  ) => {
    setErrors((prev) => ({
      ...prev,
      [field]: validateFn(value) ? '' : errorMsg
    }));
  };

  const fetchData = async () => {
    const email = sessionStorage.getItem('email');
    if (email) {
      try {
        const response = await fetch(
          `https://daas.dev.datacentrix.cloud/api/fetch_vm/?email=${encodeURIComponent(email)}`
        );
        const data = await response.json();
        setVms(data);
      } catch (error) {
        
      }
    }
  };

  const validateFromDate = (value: string) => !toDate || value <= toDate;
  const validateToDate = (value: string) => !fromDate || value >= fromDate;

  const fetchTransactions = async () => {


    setLoading(true);

    try {
      const transactions = await fetchTransactionsApi({
        email: authUser.email,
        fromDate: fromDate,
        toDate: toDate,
        status: status,
      });
      setTransactions(transactions.data)
      setLoading(false);

      return {
        props: {
          transactions,
        },
      };

    } catch (error: any) {
      return {
        props: {
          error: error.message,
        },
      };
    }
    setLoading(false);
  };

  const downloadPDF = () => {
    fetchData();
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Paper sx={{ p: 4, mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Transactions
        </Typography>

        {/* Filters */}
        <Grid container spacing={2} alignItems="center" mb={2}>
          <Grid item xs={12} sm={3}>
            <div>
              <DateTimePicker
                format="DD/MM/YYYY"
                value={fromDate ? dayjs(fromDate) : null}
                onChange={(value: any) => setFromDate(value)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    sx: {
                      '& .MuiInputBase-input': {
                        padding: '14px 18px',
                        fontSize: '16px',
                        borderRadius: '8px'
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#d1d5db',
                        borderRadius: '10px',
                      }
                    }
                  }
                }}
              />
            </div>
          </Grid>
          <Grid item xs={12} sm={3}>
            <div>
              <DateTimePicker
                format="DD/MM/YYYY"
                value={toDate ? dayjs(toDate) : null}
                onChange={(value: any) => setToDate(value)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    sx: {
                      '& .MuiInputBase-input': {
                        padding: '14px 18px',
                        fontSize: '16px',
                        borderRadius: '8px'
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#d1d5db',
                        borderRadius: '10px',
                      }
                    }
                  }
                }}
              />
            </div>

          </Grid>
          <Grid item xs={12} sm={2}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                label="Status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="success">Success</MenuItem>
                <MenuItem value="failed">Failed</MenuItem>
                <MenuItem value="abandoned">Abandoned</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={2}>
            <Button
              variant="contained"
              startIcon={<FilterIcon size={16} />}
              onClick={fetchTransactions}
              fullWidth
            >
              Apply Filter
            </Button>
          </Grid>
        </Grid>

        {/* Loading */}
        {loading ? (
          <Box display="flex" justifyContent="center" mt={4}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Amount</TableCell>
                  <TableCell>Reference</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      No transactions found.
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions.map((t) => (
                    <TableRow key={t.reference}>
                      <TableCell>
                        R{(t.amount / 100).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      </TableCell>
                      <TableCell>{t.reference}</TableCell>
                      <TableCell>
                        {new Date(t.paidAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell sx={{ textTransform: 'capitalize' }}>
                        {t.status}
                      </TableCell>
                      <TableCell>
                        <VMComponent />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </LocalizationProvider>
  );
};

export default TransactionsCard;
