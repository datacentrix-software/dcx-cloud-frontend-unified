'use client';

import BalanceCard from '@/app/components/dashboard/nlu/cardpayments/Balance';
import PaymentMethodsCard from '@/app/components/dashboard/nlu/cardpayments/paymentmethod';
import ParentCard from '@/app/components/shared/ParentCard';
import { Box, Grid, Paper, Typography, Divider, Alert } from '@mui/material';
import { useCreditCardStore } from '@/store/useCreditCardStore';
import TransactionsCard from '@/app/components/dashboard/nlu/cardpayments/Transaction';

export default function Home() {

  const { hasLinkedCreditCard } = useCreditCardStore()

  return (
    <ParentCard title="Payments">
      <Box width="100%" py={4} px={{ sm: 3, md: 5 }}>
        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={3}>
          <Grid item xs={12} lg={8}>
            {hasLinkedCreditCard ? (
              <BalanceCard />
            ) : (
              <Paper elevation={3} sx={{ p: 3 }}>
                <Alert severity="info" variant="outlined">
                  <Typography variant="body1" gutterBottom>
                    Welcome, please set up card payment to start deploying virtual machines.
                  </Typography>
                  <Typography variant="body2">
                    Please note that R5000 will be billed as an initial payment which will be credited to your account.
                  </Typography>
                </Alert>
              </Paper>

            )}
          </Grid>

          <Grid item xs={12} lg={4}>
            <PaymentMethodsCard />
          </Grid>
        </Grid>

        {hasLinkedCreditCard && (
          <Grid container spacing={3} mt={4}>
            <Grid item xs={12}>
              <TransactionsCard />
            </Grid>
          </Grid>
        )}
      </Box>
    </ParentCard>
  );
}
