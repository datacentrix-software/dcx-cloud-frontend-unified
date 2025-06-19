import { useState, ChangeEvent } from 'react';
import {
  Box,
  Button,
  Stack,
  Grid,
  Typography,
} from '@mui/material';
import ArrowBack from '@mui/icons-material/ArrowBack';
import CustomTextField from '@/app/components/forms/theme-elements/CustomTextField';
import CustomFormLabel from '@/app/components/forms/theme-elements/CustomFormLabel';
import axiosServices from '@/utils/axios';
import { useAuthStore } from '@/store/';
import { decoder } from '@/utils/';
import InfoCarousel from './InfoCarousel';
import { useRouter } from 'next/navigation';
import { IToken } from '@/types';

interface PasswordResetProps {
  email: string;
  onError: (message: string) => void;
  onSuccess: () => void;
}

const PasswordReset = ({ email: initialEmail, onError, onSuccess }: PasswordResetProps) => {
  const router = useRouter();
  const [email, setEmail] = useState(initialEmail);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const { setToken, setUser } = useAuthStore();

  const handleReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      onError("Passwords do not match!");
      return;
    }

    try {
      const loginResponse = await axiosServices.post(
        `${process.env.NEXT_PUBLIC_BACK_END_BASEURL}/api/users/change-password`,
        { email, oldPassword, newPassword }
      );

      // If we get here, the request was successful (200/201)
      if (loginResponse.data) {
        // Check if we have token data
        if (loginResponse.data.token) {
          const { token, refreshToken } = loginResponse.data;
          
          // Set the token in the auth store
          setToken(token, refreshToken);

          // Get user details using the token
          const { id } = decoder(token) as IToken;
          const userDetails = await axiosServices.get(
            `${process.env.NEXT_PUBLIC_BACK_END_BASEURL}/api/users/getuser?userId=${id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );

          if (userDetails.data) {
            setUser(userDetails.data);
            onSuccess();
            
            // Redirect based on user role
            const redirectRoute = userDetails.data?.role?.name === 'SDM' ? '/nlu/sdm/dashboard' : '/';
            window.location.href = redirectRoute;
          }
        } else {
          // If no token but successful response, just show success
          onSuccess();
        }
      }
    } catch (error: any) {
      onError(error.response?.data?.message || 'An error occurred.');
    }
  };

  const handleNewPasswordChange = (e: { target: { value: string } }) => {
    const password = e.target.value;
    const passwordPattern = /^(?=.*\d)(?=.*[\W_]).{8,16}$/;
    setNewPassword(password);
    setPasswordError(!passwordPattern.test(password));
  };

  return (
    <Grid container sx={{ height: '100vh', overflow: 'hidden' }}>
      {/* Left side - Carousel */}
      <Grid item xs={12} md={6} sx={{ 
        display: { xs: 'none', md: 'flex' },
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        bgcolor: '#ffffff',
        color: 'black',
        minHeight: '100vh',
      }}>
        <Box sx={{ 
          width: '100%', 
          height: '100%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center'
        }}>
          <Box sx={{ 
            width: '100%', 
            height: '100%'
          }}>
            <InfoCarousel />
          </Box>
        </Box>
      </Grid>

      {/* Right side - Password Reset Form */}
      <Grid item xs={12} md={6} sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        p: 4,
        minHeight: '100vh',
        backgroundImage: 'url(/images/backgrounds/new-login-bg.jpeg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}>
        <Box
          width="100%"
          maxWidth={500}
          sx={{
            background: '#ffffff',
            borderRadius: '12px',
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
            padding: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          <Typography variant="h4" fontWeight="bold" textAlign="center" gutterBottom>
            Set Your Password
          </Typography>
          <Typography variant="body1" textAlign="center" color="textSecondary" mb={3}>
            Please enter your details below
          </Typography>

          <form onSubmit={handleReset} style={{ width: '100%' }}>
            <Stack spacing={2}>
              <Box>
                <CustomFormLabel htmlFor='email'>Email Address</CustomFormLabel>
                <CustomTextField
                  id='email'
                  type='email'
                  variant='outlined'
                  required
                  size='medium'
                  fullWidth
                  value={email}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 1,
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      '&:hover fieldset': {
                        borderColor: 'primary.main',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'primary.main',
                      },
                    },
                  }}
                />
              </Box>

              <Box>
                <CustomFormLabel htmlFor='password'>Temporary Password</CustomFormLabel>
                <CustomTextField
                  id='password'
                  type='password'
                  variant='outlined'
                  required
                  size='medium'
                  fullWidth
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setOldPassword(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 1,
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      '&:hover fieldset': {
                        borderColor: 'primary.main',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'primary.main',
                      },
                    },
                  }}
                />
              </Box>

              <Box>
                <CustomFormLabel htmlFor='password'>New Password</CustomFormLabel>
                <CustomTextField
                  id='password'
                  type='password'
                  variant='outlined'
                  size='medium'
                  required
                  fullWidth
                  error={passwordError}
                  helperText={passwordError ? "Must be 8-16 characters, include one number & one special character." : ""}
                  onChange={handleNewPasswordChange}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 1,
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      '&:hover fieldset': {
                        borderColor: 'primary.main',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'primary.main',
                      },
                    },
                  }}
                />
              </Box>

              <Box>
                <CustomFormLabel htmlFor='password'>Confirm Password</CustomFormLabel>
                <CustomTextField
                  id='password'
                  type='password'
                  variant='outlined'
                  size='medium'
                  required
                  fullWidth
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 1,
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      '&:hover fieldset': {
                        borderColor: 'primary.main',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'primary.main',
                      },
                    },
                  }}
                />
              </Box>

              <Button
                color='primary'
                variant='contained'
                fullWidth
                type="submit"
                size="large"
                sx={{
                  mt: 2,
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '1rem',
                  transition: '0.3s',
                  '&:hover': {
                    transform: 'scale(1.02)',
                    boxShadow: '0 4px 12px rgba(0, 123, 255, 0.3)'
                  }
                }}
              >
                Set Password
              </Button>

              <Button
                startIcon={<ArrowBack />}
                onClick={() => router.push('/auth/login')}
                color="primary"
                sx={{
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: 'transparent',
                    textDecoration: 'underline'
                  }
                }}
              >
                Back to Login
              </Button>
            </Stack>
          </form>
        </Box>
      </Grid>
    </Grid>
  );
};

export default PasswordReset; 