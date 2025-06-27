'use client';
import { useCallback, useEffect, useState } from 'react';
import { CreditCard } from '@mui/icons-material';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Divider,
  Alert,
  Stack
} from '@mui/material';
import { useAuthStore } from '@/store';
import axios, { AxiosError } from 'axios';
import { useQuoteStore } from '@/store/useQuoteStore';

const BalanceCard: React.FC = () => {
  const { token } = useAuthStore();
  const [amount, setAmount] = useState('');

  const [message, setMessage] = useState('');
  const { primaryOrgId } = useAuthStore();
  const { formatCurrency, } = useQuoteStore()

  const fetchCardDetails = useCallback(async () => {
    try {

      const walletResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_BACK_END_BASEURL}/api/wallet/${primaryOrgId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setAmount(walletResponse.data.balance)


    } catch (error: unknown) {
      let errorMessage = 'An error occurred while fetching card details';

      if (error instanceof AxiosError) {
        errorMessage = error.response?.data?.message || error.message || errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      // Swal.fire({
      //   icon: 'error',
      //   title: 'API Error',
      //   text: errorMessage,
      //   showConfirmButton: true
      // });
    }
  }, [primaryOrgId, token]);

  useEffect(() => {
    fetchCardDetails()
  }, [fetchCardDetails])

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack spacing={2}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Your balance </Typography>
            <Typography variant="h5" fontWeight="bold" sx={{ color: 'green' }}>
              {formatCurrency(Number(amount) / 100)}
            </Typography>


          </Box>
          <Typography variant="body2" color="text.secondary">
            No balance
          </Typography>
          <Box display="flex" alignItems="center">
            <CreditCard sx={{ mr: 1, color: 'text.secondary' }} />
            <Typography color="primary" fontWeight={500}>
              Automatic payments
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            You won&apos;t be charged until there&apos;s a balance due.
          </Typography>
          <Divider />
          {/* <Button variant="text" color="primary" fullWidth onClick={handlePayment}>
            Make a payment
          </Button> */}
          {message && <Alert severity={message.includes('successful') ? 'success' : 'error'}>{message}</Alert>}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default BalanceCard;
