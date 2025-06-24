'use client';
import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Divider,
  Avatar,
  Stack,
} from '@mui/material';
import { useAuthStore } from '@/store';
import { useCreditCardStore } from '@/store/useCreditCardStore';
import AddCreditCardDialog from '@/app/(DashboardLayout)/(pages)/nlu/customer/virtual-machines/components/AddCreditCardDialog';

const PaymentMethodsCard: React.FC = () => {
  const [openAddCardDialog, setOpenAddCardDialog] = useState(false);
  const authUser: any = useAuthStore((state) => state.user);
  const { setPaymentCards, paymentCards, selectedCard, setSelectedCard, hasLinkedCreditCard, setField } = useCreditCardStore()
  const { token } = useAuthStore();

  useEffect(() => {
    const defaultCard = paymentCards.find((card) => card.isDefault)
    setSelectedCard(defaultCard || paymentCards[0])
  }, [paymentCards])

  return (
    <Box sx={{ backgroundColor: '#fff', p: 3, borderRadius: 2, border: '1px solid #ccc' }}>
      <Typography variant="h6">Card Payments</Typography>
      <Box mt={2} display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="body2" color="text.secondary">
            Primary
          </Typography>
          {selectedCard ? (
            <Stack direction="row" alignItems="center" mt={2} spacing={2}>
              <Avatar
                variant="square"
                src="https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg"
                sx={{ width: 48, height: 30 }}
              />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Visa **** {selectedCard?.last4}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Expires {selectedCard?.expMonth}/{selectedCard?.expYear}
                </Typography>
              </Box>
            </Stack>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              No card
            </Typography>
          )}
        </Box>
        {!selectedCard && (
          <Box display="flex" flexDirection="column" alignItems="flex-start">
            <Typography variant="body2" color="text.secondary">
              Card
            </Typography>
            <Button onClick={() => setOpenAddCardDialog(true)} sx={{ mt: 1 }} variant="outlined">
              Add a Card
            </Button>
          </Box>
        )}
      </Box>

      <Divider sx={{ my: 4 }} />

      <AddCreditCardDialog
        open={openAddCardDialog}
        onClose={() => setOpenAddCardDialog(false)}
        onSave={(data) => {
          setOpenAddCardDialog(false);
        }}
      />
    </Box>
  );
};

export default PaymentMethodsCard;

