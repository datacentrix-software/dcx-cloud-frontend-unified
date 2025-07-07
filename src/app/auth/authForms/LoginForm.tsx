'use client';

import { useState, ChangeEvent, FormEvent } from 'react';
import {
  Box,
  Button,
  Stack,
  Typography,
  Link,
  CircularProgress,
} from '@mui/material';
import ArrowBack from '@mui/icons-material/ArrowBack';
import { useRouter } from 'next/navigation';
import CustomTextField from '@/app/components/forms/theme-elements/CustomTextField';
import CustomFormLabel from '@/app/components/forms/theme-elements/CustomFormLabel';
import axiosServices from '@/utils/axios';
import { AxiosError } from 'axios';

interface LoginFormProps {
  onOtpSent: (email: string) => void;
  onError: (message: string) => void;
  onBackToOptions: () => void;
}

const LoginForm = ({ onOtpSent, onError, onBackToOptions }: LoginFormProps) => {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data } = await axiosServices.post(
        `/api/users/login`,
        { email, password }
      );

      if (data) {
        if (data.isFirstLogin === true) {
          router.push(`/auth/reset-password?email=${encodeURIComponent(email)}`);
        } else {
          onOtpSent(email);
          
          // Development workaround: Show OTP until Mimecast is configured
          if (process.env.NODE_ENV === 'development' && data.devOtp) {
            setTimeout(() => {
              alert(`DEVELOPMENT MODE\n\nOTP Code: ${data.devOtp}\n\nEmail: ${email}\n\nNote: This popup will be removed when Mimecast email is configured.`);
            }, 500);
          }
        }
      }
    } catch (error: unknown) {
      let errorMsg = 'An error occurred during login';
      
      if (error instanceof AxiosError) {
        errorMsg = error.response?.data?.message || error.message || errorMsg;
      } else if (error instanceof Error) {
        errorMsg = error.message;
      }
      
      onError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box>
      {/* Back Button */}
      <Box mb={2}>
        <Button startIcon={<ArrowBack />} onClick={onBackToOptions} color="primary">
          Back to Login Options
        </Button>
      </Box>

      <form onSubmit={handleLogin}>
        <Stack spacing={2}>
          {/* Email Field */}
          <Box>
            <CustomFormLabel htmlFor="email">Email Address</CustomFormLabel>
            <CustomTextField
              id="email"
              type="email"
              variant="outlined"
              size="small"
              fullWidth
              required
              placeholder="Enter your email"
              onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              sx={{
                transition: '0.3s',
                '&:focus-within': {
                  borderColor: 'primary.main',
                  boxShadow: '0 0 8px rgba(0, 123, 255, 0.5)',
                },
              }}
            />
          </Box>

          {/* Password Field */}
          <Box>
            <CustomFormLabel htmlFor="password">Password</CustomFormLabel>
            <CustomTextField
              id="password"
              type="password"
              variant="outlined"
              size="small"
              fullWidth
              required
              placeholder="Enter your password"
              onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              sx={{
                transition: '0.3s',
                '&:focus-within': {
                  borderColor: 'primary.main',
                  boxShadow: '0 0 8px rgba(0, 123, 255, 0.5)',
                },
              }}
            />
          </Box>

          {/* Forgot Password */}
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Link href="/auth/forgetpassword" color="primary" underline="hover">
              Forgot password?
            </Link>
          </Box>

          {/* Submit Button */}
          <Button
            color="primary"
            variant="contained"
            fullWidth
            type="submit"
            size="large"
            disabled={isLoading}
            sx={{
              transition: '0.3s',
              '&:hover': {
                transform: 'scale(1.05)',
                boxShadow: '0 4px 12px rgba(0, 123, 255, 0.3)',
              },
            }}
          >
            {isLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Sign In'
            )}
          </Button>
        </Stack>
      </form>
    </Box>
  );
};

export default LoginForm;
