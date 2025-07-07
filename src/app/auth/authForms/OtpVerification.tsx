import { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  CircularProgress,
} from '@mui/material';
import ArrowBack from '@mui/icons-material/ArrowBack';
import axiosServices from '@/utils/axios';
import { AxiosError } from 'axios';
import { decoder } from '@/utils/';
import { useAuthStore } from '@/store/';
import { useRouter } from 'next/navigation';

interface OtpVerificationProps {
  email: string;
  onStepChange: (step: number) => void;
  onError: (message: string) => void;
  onSuccess: (userName: string) => void;
}

const OtpVerification = ({ email, onError, onSuccess }: OtpVerificationProps) => {
  const [otp, setOtp] = useState('');
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const setToken = useAuthStore((state) => state.setToken);
  const setUser = useAuthStore((state) => state.setUser);
  const router = useRouter();

  const handleVerifyOtp = async () => {
    setIsVerifyingOtp(true);
    try {
      const loginResponse = await axiosServices.post(
        `/api/users/login/verify`,
        { email, otp }
      );
      
      if (loginResponse.data.success) {
        const token = loginResponse.data.token;
        setToken(token);

        const decodedToken = decoder(token);
        const usersResponse = await axiosServices.get(
          `/api/users/getuser?userId=${decodedToken?.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (usersResponse.data) {
          setUser(usersResponse.data);
          onSuccess(usersResponse.data.firstName);
          window.location.href = "/nlu/dashboards/customer";
        }
      } else {
        onError(loginResponse.data.message);
      }
    } catch (error: unknown) {
      let errorMessage = 'An error occurred during login.';
      
      if (error instanceof AxiosError) {
        errorMessage = error.response?.data?.message || error.message || errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      onError(errorMessage);
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  return (
    <Box>
      {/* Back Button */}
      <Box mb={2}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => router.push('/')}
          color="primary"
        >
          Back to Login
        </Button>
      </Box>

      <Typography variant="h6" fontWeight="bold" color="textSecondary" gutterBottom>
        An OTP has been sent to your email address
      </Typography>
      <Typography variant="h6" fontWeight="bold" color="textSecondary" gutterBottom>
        ({email})
      </Typography>
      <Box component="form" mt={2} onSubmit={(e) => {
        e.preventDefault();
        handleVerifyOtp();
      }}>
        <TextField
          fullWidth
          label="OTP"
          variant="outlined"
          margin="normal"
          required
          onChange={(e) => setOtp(e.target.value)}
          placeholder="Enter OTP"
          disabled={isVerifyingOtp}
        />

        <Button
          fullWidth
          variant="contained"
          color="primary"
          type="submit"
          disabled={isVerifyingOtp}
          sx={{ mt: 2 }}
        >
          {isVerifyingOtp ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            'Verify OTP'
          )}
        </Button>
      </Box>
    </Box>
  );
};

export default OtpVerification; 