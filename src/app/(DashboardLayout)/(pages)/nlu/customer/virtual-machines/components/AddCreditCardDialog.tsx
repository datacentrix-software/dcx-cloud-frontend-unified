import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Button,
  Box,
  Grid,
  Paper,
  InputAdornment,
  IconButton,
  Card,
  CardContent,
  useTheme,
  alpha,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useAuthStore } from '@/store';
import axios, { AxiosError } from 'axios';
import Swal from 'sweetalert2';
import { useCreditCardStore } from '@/store/useCreditCardStore';
import { IPaymentCard } from '@/types';
import { CreditCard, Visibility, VisibilityOff, Person } from '@mui/icons-material';
import { format, addMonths, startOfMonth } from 'date-fns';

interface AddCreditCardDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (cardData: {
    cardNumber: string;
    cardName: string;
    expiryDate: Date;
    cvv: string;
    pin: string;
  }) => void;
}

const AddCreditCardDialog: React.FC<AddCreditCardDialogProps> = ({ open, onClose, onSave }) => {
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryDate, setExpiryDate] = useState<Date | null>(null);
  const [cvv, setCvv] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const theme = useTheme();

  const { user: authUser, token, primaryOrgId } = useAuthStore();

  const {
    setPaymentCards,
    paymentCards,
    setSelectedCard,
    setField
  } = useCreditCardStore();

  const [errors, setErrors] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    pin: ''
  });

  const validate = () => {
    const newErrors: typeof errors = {
      cardNumber: '',
      cardName: '',
      expiryDate: '',
      cvv: '',
      pin: ''
    };

    if (!/^\d{16}$/.test(cardNumber)) {
      newErrors.cardNumber = 'Card number must be 16 digits';
    }

    if (!cardName.trim()) {
      newErrors.cardName = 'Name is required';
    }

    if (!expiryDate) {
      newErrors.expiryDate = 'Expiry date is required';
    }

    if (!/^\d{3,4}$/.test(cvv)) {
      newErrors.cvv = 'CVV must be 3 or 4 digits';
    }

    if (!/^\d{4,}$/.test(pin)) {
      newErrors.pin = 'PIN must be at least 4 digits';
    }

    setErrors(newErrors);
    return Object.values(newErrors).every(val => val === '');
  };

  useEffect(() => {
    const defaultCard = paymentCards.find((card) => card.isDefault)
    setSelectedCard(defaultCard || paymentCards[0])
  }, [paymentCards])

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      const payload = {
        email: authUser?.email,
        organisationId: primaryOrgId,
        pin,
        card: {
          number: cardNumber,
          expiry_month: format(expiryDate!, 'MM'),
          expiry_year: format(expiryDate!, 'yy'),
          cvv: cvv,
          name: cardName,
        },
      };

      const saveCardResponse = await axios.post(
        `${process.env.NEXT_PUBLIC_BACK_END_BASEURL}/api/payment/savecard`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!saveCardResponse.data.card) {
        const text = saveCardResponse.data.message || "Error saving card"
        Swal.fire({
          icon: 'error',
          text,
          showConfirmButton: true,
        })
      } else {
        Swal.fire({
          icon: 'success',
          text: saveCardResponse.data.message,
          showConfirmButton: true,
        });

        const newCard: IPaymentCard = saveCardResponse.data.card;
        setPaymentCards([...paymentCards, newCard]);
        setField('hasLinkedCreditCard', Object.keys(newCard).length > 0);
        handleClose();
      }
    } catch (error: unknown) {
      const text = error instanceof AxiosError && error.response?.data?.message 
        ? error.response.data.message 
        : "Error saving card";
      Swal.fire({
        icon: 'error',
        text,
        showConfirmButton: true,
      });
    }

    onSave({
      cardNumber,
      cardName,
      expiryDate: expiryDate!,
      cvv,
      pin
    });
  };

  const resetForm = () => {
    setCardNumber('');
    setCardName('');
    setExpiryDate(null);
    setCvv('');
    setPin('');
    setErrors({
      cardNumber: '',
      cardName: '',
      expiryDate: '',
      cvv: '',
      pin: ''
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join('-');
    } else {
      return value;
    }
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 16);
    setCardNumber(value);
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
        }
      }}
    >
      <DialogTitle sx={{ 
        pb: 1,
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`
      }}>
        <CreditCard sx={{ color: theme.palette.primary.main }} />
        Add Payment Method
      </DialogTitle>
      
      <DialogContent sx={{ pt: 3 }}>
        <Card 
          elevation={0}
          sx={{ 
            mb: 3,
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
            color: 'white',
            borderRadius: 2,
          }}
        >
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 500 }}>
                  Credit Card
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  {cardNumber ? formatCardNumber(cardNumber) : '**** **** **** ****'}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1, opacity: 0.8 }}>
                  {cardName || 'CARD HOLDER NAME'}
                </Typography>
              </Box>
              <CreditCard sx={{ fontSize: 40, opacity: 0.8 }} />
            </Box>
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>Expires</Typography>
                <Typography variant="body2">
                  {expiryDate ? format(expiryDate, 'MM/yy') : 'MM/YY'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>CVV</Typography>
                <Typography variant="body2">
                  {cvv ? '***' : '***'}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Please enter your credit card details to continue
        </Typography>

        <Box sx={{ mb: 3 }}>
          <Typography 
            variant="subtitle2" 
            sx={{ 
              mb: 1,
              color: 'text.secondary',
              fontWeight: 500,
            }}
          >
            Card Number
          </Typography>
          <TextField
            fullWidth
            placeholder="1234-5678-9012-3456"
            value={formatCardNumber(cardNumber)}
            onChange={handleCardNumberChange}
            error={!!errors.cardNumber}
            helperText={errors.cardNumber}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <CreditCard sx={{ color: 'action.active' }} />
                </InputAdornment>
              ),
            }}
            variant="outlined"
          />
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Box>
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  mb: 1,
                  color: 'text.secondary',
                  fontWeight: 500,
                }}
              >
                Expiry Date
              </Typography>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  value={expiryDate}
                  onChange={(newValue) => setExpiryDate(newValue)}
                  minDate={startOfMonth(addMonths(new Date(), 1))}
                  views={['month', 'year']}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      variant: 'outlined',
                      error: !!errors.expiryDate,
                      helperText: errors.expiryDate,
                    },
                  }}
                />
              </LocalizationProvider>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box>
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  mb: 1,
                  color: 'text.secondary',
                  fontWeight: 500,
                }}
              >
                CVV
              </Typography>
              <TextField
                placeholder="123"
                value={cvv}
                onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                fullWidth
                error={!!errors.cvv}
                helperText={errors.cvv}
                type="password"
                variant="outlined"
              />
            </Box>
          </Grid>
        </Grid>

        <Box display="flex" gap={2} mt={2}>
          <Box flex={1}>
            <Typography 
              variant="subtitle2" 
              sx={{ 
                mb: 1,
                color: 'text.secondary',
                fontWeight: 500,
              }}
            >
              Card Name
            </Typography>
            <TextField
              placeholder="Enter card name"
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              fullWidth
              error={!!errors.cardName}
              helperText={errors.cardName}
              variant="outlined"
            />
          </Box>
          <Box flex={1}>
            <Typography 
              variant="subtitle2" 
              sx={{ 
                mb: 1,
                color: 'text.secondary',
                fontWeight: 500,
              }}
            >
              Card PIN
            </Typography>
            <TextField
              placeholder="Enter 4-6 digits"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
              fullWidth
              type={showPin ? 'text' : 'password'}
              error={!!errors.pin}
              helperText={errors.pin}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPin(!showPin)}
                      edge="end"
                    >
                      {showPin ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              variant="outlined"
            />
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
        <Button 
          onClick={handleClose} 
          variant="outlined"
          sx={{ 
            borderRadius: 2,
            textTransform: 'none',
            px: 3
          }}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained"
          sx={{ 
            borderRadius: 2,
            textTransform: 'none',
            px: 3
          }}
        >
          Save Card
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddCreditCardDialog;
