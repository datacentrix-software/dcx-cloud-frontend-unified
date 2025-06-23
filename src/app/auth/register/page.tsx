'use client'

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Container,
  Link,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Dialog,
  Grid,
  TextField,
  Checkbox,
  FormControlLabel,
  CircularProgress,
  Autocomplete,
} from '@mui/material';
import axiosServices from '@/utils/axios';
import { useRouter } from 'next/navigation';
import InfoCarousel from '../authForms/InfoCarousel';

export default function RegistrationPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [dialogMessage, setDialogMessage] = useState<string>('');
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [msaAccepted, setMsaAccepted] = useState<boolean>(false);
  const [isTermsLoading, setIsTermsLoading] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [organizations] = useState([
    "Datacentrix",
    "Kyoto",
    "TestUser",
    "Datacentrix pty",
    "Arcne Cope",
    "Acme Corp"
  ]);
  const [organizationTypes] = useState([
    "Private",
    "Public",
    "Government",
    "Non-Profit",
    "Educational"
  ]);

  const [formData, setFormData] = React.useState({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '+27',
    organisation: {
      organisation_name: '',
      organisation_type: '',
      msa_accepted: false
    }
  });

  const [errors, setErrors] = React.useState({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    organisation_name: '',
    organisation_type: '',
    msa_accepted: ''
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Ensure the value starts with +27
    if (!value.startsWith('+27')) {
      setFormData({ ...formData, mobile: '+27' });
      return;
    }
    // Only allow numbers after +27
    const numbersOnly = value.replace(/[^\d]/g, '');
    if (numbersOnly.length <= 11) { // +27 + 9 digits
      const newValue = '+27' + numbersOnly.slice(2);
      setFormData({ ...formData, mobile: newValue });
      setErrors({ ...errors, mobile: '' });
    }
  };

  const validateForm = () => {
    let tempErrors = {
      firstName: '',
      lastName: '',
      email: '',
      mobile: '',
      organisation_name: '',
      organisation_type: '',
      msa_accepted: ''
    };
    let isValid = true;

    // First Name validation
    if (!formData.firstName.trim()) {
      tempErrors.firstName = 'First name is required';
      isValid = false;
    }

    // Last Name validation
    if (!formData.lastName.trim()) {
      tempErrors.lastName = 'Last name is required';
      isValid = false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      tempErrors.email = 'Email is required';
      isValid = false;
    } else if (!emailRegex.test(formData.email)) {
      tempErrors.email = 'Please enter a valid email address';
      isValid = false;
    }

    // Mobile validation
    const mobileRegex = /^\+27\d{9}$/;
    if (!formData.mobile.trim()) {
      tempErrors.mobile = 'Contact number is required';
      isValid = false;
    } else if (!mobileRegex.test(formData.mobile)) {
      tempErrors.mobile = 'Please enter a valid contact number (Format: +27123456789)';
      isValid = false;
    }

    // Organisation Name validation
    if (!formData.organisation.organisation_name.trim()) {
      tempErrors.organisation_name = 'Organisation name is required';
      isValid = false;
    }

    // Organisation Type validation
    if (!formData.organisation.organisation_type.trim()) {
      tempErrors.organisation_type = 'Organisation type is required';
      isValid = false;
    }

    // MSA acceptance validation
    if (!msaAccepted) {
      tempErrors.msa_accepted = 'You must accept the Master Service Agreement';
      isValid = false;
    }


    setErrors(tempErrors);
    return isValid;
  };

  const isFormValid = () => {
    const valid = (
      formData.firstName.trim() !== '' &&
      formData.lastName.trim() !== '' &&
      formData.email.trim() !== '' &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) &&
      /^\+27\d{9}$/.test(formData.mobile) &&
      formData.organisation.organisation_name.trim() !== '' &&
      formData.organisation.organisation_type.trim() !== '' &&
      msaAccepted
    );


    return valid;
  };

  // Add useEffect to log form state changes
  useEffect(() => {
  }, [formData, msaAccepted, errors]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsRegistering(true);
    try {
      // Check if the organization exists
      const existingOrg = organizations.find(
        org => org.toLowerCase() === formData.organisation.organisation_name.toLowerCase()
      );

      let organizationId = existingOrg ? organizations.indexOf(existingOrg) : null;

      // If organization doesn't exist, create it
      if (!existingOrg) {
        try {
          const orgResponse = await axiosServices.post(
            `${process.env.NEXT_PUBLIC_BACK_END_BASEURL}/api/organisations/createorganisation`,
            {
              organisation_name: formData.organisation.organisation_name,
              organisation_type: formData.organisation.organisation_type,
            }
          );
          
          if (orgResponse.data && orgResponse.data.id) {
            organizationId = orgResponse.data.id;
          }
        } catch (orgError: any) {
          setDialogMessage(orgError.response?.data?.message || 'Error creating organization. Please try again.');
          setDialogOpen(true);
          setIsRegistering(false);
          return;
        }
      }

      const response = await axiosServices.post(`${process.env.NEXT_PUBLIC_BACK_END_BASEURL}/api/users/registercustomer`,
        {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          mobile: formData.mobile,
          organisation: {
            ...formData.organisation,
            msa_accepted: msaAccepted,
            id: organizationId
          },
          actionById: 1,
          role: "Customer",
          status: 'Active',
          msa_version_id: null,
        }
      );

      if (response.status === 200 || response.status === 201) {
        setDialogMessage('Successfully registered user. Please check your email for further instructions on completion registration.');
        setDialogOpen(true);

        setTimeout(() => {
          setDialogOpen(false);
          setIsLoading(true);
          setTimeout(() => {
            router.push('/auth/login');
          }, 1000);
        }, 1500);

        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          mobile: '+27',
          organisation: {
            organisation_name: '',
            organisation_type: '',
            msa_accepted: false
          }
        });
        setMsaAccepted(false);
      }
    } catch (error: any) {
      setDialogMessage(error.response?.data?.message || 'Network error. Please try again.');
      setDialogOpen(true);
    } finally {
      setIsRegistering(false);
    }
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
        <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Box sx={{ width: '100%', height: '100%' }}>
            <InfoCarousel />
          </Box>
        </Box>
      </Grid>

      {/* Right side - Registration Form */}
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
        position: { md: 'fixed' },
        right: { md: 0 },
        width: { md: '50%' }
      }}>
        <Container maxWidth="sm" sx={{ 
          py: 4,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          minHeight: '100vh'
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
            <Box textAlign="center" mb={3}>
              <Typography variant="h4" fontWeight="bold"  gutterBottom>
                Create Your Account
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Join us today and start your journey
              </Typography>
            </Box>

            <Box 
              component="form" 
              onSubmit={handleRegister}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                width: '100%'
              }}
            >
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    label="First Name"
                    value={formData.firstName}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      setFormData({ ...formData, firstName: newValue });
                      setErrors({ ...errors, firstName: '' });
                    }}
                    fullWidth
                    size="medium"
                    error={!!errors.firstName}
                    helperText={errors.firstName}
                    InputLabelProps={{
                      shrink: true,
                      sx: { 
                        position: 'static',
                        transform: 'none',
                        fontSize: '0.875rem',
                        color: 'text.secondary',
                        mb: 0.5,
                        '& .MuiFormLabel-asterisk': {
                          color: 'error.main'
                        }
                      }
                    }}
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
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    label="Last Name"
                    value={formData.lastName}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      setFormData({ ...formData, lastName: newValue });
                      setErrors({ ...errors, lastName: '' });
                    }}
                    fullWidth
                    size="medium"
                    error={!!errors.lastName}
                    helperText={errors.lastName}
                    InputLabelProps={{
                      shrink: true,
                      sx: { 
                        position: 'static',
                        transform: 'none',
                        fontSize: '0.875rem',
                        color: 'text.secondary',
                        mb: 0.5,
                        '& .MuiFormLabel-asterisk': {
                          color: 'error.main'
                        }
                      }
                    }}
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
                </Grid>
              </Grid>

              <TextField
                required
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => {
                  const newValue = e.target.value;
                  setFormData({ ...formData, email: newValue });
                  setErrors({ ...errors, email: '' });
                }}
                fullWidth
                size="medium"
                error={!!errors.email}
                helperText={errors.email}
                InputLabelProps={{
                  shrink: true,
                  sx: { 
                    position: 'static',
                    transform: 'none',
                    fontSize: '0.875rem',
                    color: 'text.secondary',
                    mb: 0.5,
                    '& .MuiFormLabel-asterisk': {
                      color: 'error.main'
                    }
                  }
                }}
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

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Autocomplete
                    freeSolo
                    options={organizations}
                    value={formData.organisation.organisation_name}
                    onChange={(event, newValue) => {
                      const newOrgData = {
                        ...formData.organisation,
                        organisation_name: newValue || ''
                      };

                      setFormData({
                        ...formData,
                        organisation: newOrgData
                      });
                      setErrors({ ...errors, organisation_name: '' });
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        required
                        label="Organisation Name"
                        error={!!errors.organisation_name}
                        helperText={errors.organisation_name}
                        fullWidth
                        size="medium"
                        InputLabelProps={{
                          shrink: true,
                          sx: { 
                            position: 'static',
                            transform: 'none',
                            fontSize: '0.875rem',
                            color: 'text.secondary',
                            mb: 0.5,
                            '& .MuiFormLabel-asterisk': {
                              color: 'error.main'
                            }
                          }
                        }}
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
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Autocomplete
                    freeSolo
                    options={organizationTypes}
                    value={formData.organisation.organisation_type}
                    onChange={(event, newValue) => {
                      const newOrgData = {
                        ...formData.organisation,
                        organisation_type: newValue || ''
                      };

                      setFormData({
                        ...formData,
                        organisation: newOrgData
                      });
                      setErrors({ ...errors, organisation_type: '' });
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        required
                        label="Organisation Type"
                        error={!!errors.organisation_type}
                        helperText={errors.organisation_type}
                        fullWidth
                        size="medium"
                        InputLabelProps={{
                          shrink: true,
                          sx: { 
                            position: 'static',
                            transform: 'none',
                            fontSize: '0.875rem',
                            color: 'text.secondary',
                            mb: 0.5,
                            '& .MuiFormLabel-asterisk': {
                              color: 'error.main'
                            }
                          }
                        }}
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
                    )}
                  />
                </Grid>
              </Grid>

              <TextField
                required
                label="Contact Number"
                value={formData.mobile}
                onChange={handleMobileChange}
                fullWidth
                size="medium"
                error={!!errors.mobile}
                inputProps={{
                  maxLength: 12,
                  pattern: "\\+27\\d{9}"
                }}
                InputLabelProps={{
                  shrink: true,
                  sx: { 
                    position: 'static',
                    transform: 'none',
                    fontSize: '0.875rem',
                    color: 'text.secondary',
                    mb: 0.5,
                    '& .MuiFormLabel-asterisk': {
                      color: 'error.main'
                    }
                  }
                }}
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

              <Box sx={{ mt: 1 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={msaAccepted}
                      onChange={(e) => {
                        const newValue = e.target.checked;
                        setMsaAccepted(newValue);
                        setErrors({ ...errors, msa_accepted: '' });
                      }}
                      sx={{
                        color: 'primary.main',
                        '&.Mui-checked': {
                          color: 'primary.main',
                        },
                      }}
                    />
                  }
                  label={
                    <Typography variant="body2" color={errors.msa_accepted ? 'error' : 'text.secondary'}>
                      I accept the Master Service Agreement
                      <Typography component="span" color="error.main" sx={{ ml: 0.5 }}>*</Typography>
                    </Typography>
                  }
                />
                {errors.msa_accepted && (
                  <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5, ml: 3 }}>
                    {errors.msa_accepted}
                  </Typography>
                )}
              </Box>

              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                disabled={!isFormValid() || isRegistering}
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
                  },
                  '&.Mui-disabled': {
                    backgroundColor: 'rgba(0, 0, 0, 0.12)',
                    color: 'rgba(0, 0, 0, 0.26)'
                  }
                }}
              >
                {isRegistering ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CircularProgress size={20} color="inherit" />
                    Creating Account...
                  </Box>
                ) : (
                  'Create Account'
                )}
              </Button>

              <Box textAlign="center" mt={2}>
                <Typography variant="body2" color="text.secondary">
                  Already have an account?{' '}
                  <Link 
                    href="/auth/login" 
                    underline="hover"
                    sx={{
                      color: 'primary.main',
                      fontWeight: 500,
                      '&:hover': {
                        color: 'primary.dark',
                      },
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      setIsLoading(true);
                      setTimeout(() => {
                        router.push('/auth/login');
                      }, 1000);
                    }}
                  >
                    Sign in
                  </Link>
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  By registering you agree to our{' '}
                  <Link
                    component="button"
                    variant="body2"
                    onClick={() => setShowTerms(true)}
                    sx={{
                      color: 'primary.main',
                      fontWeight: 500,
                      '&:hover': {
                        color: 'primary.dark',
                      },
                      border: 'none',
                      background: 'none',
                      padding: 0,
                      cursor: 'pointer',
                    }}
                  >
                    Terms and Conditions *
                  </Link>
                </Typography>
              </Box>
            </Box>
          </Box>
        </Container>

        <Dialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          maxWidth="xs"
          PaperProps={{
            sx: {
              minWidth: 'auto',
              maxWidth: '90vw',
              m: 1,
              '& .MuiDialogTitle-root': {
                py: 1
              },
              '& .MuiDialogContent-root': {
                py: 1,
                px: 2,
                minWidth: '200px'
              },
              '& .MuiDialogActions-root': {
                p: 1
              }
            }
          }}
        >
          <DialogTitle>Notification</DialogTitle>
          <DialogContent>
            <Typography>{dialogMessage}</Typography>
          </DialogContent>
          <DialogActions>
            <Button
              variant="contained"
              size="small"
              onClick={() => setDialogOpen(false)}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>

        {showTerms && (
          <Dialog
            open={showTerms}
            onClose={() => setShowTerms(false)}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>Terms and Conditions</DialogTitle>
            <DialogContent>
              <Box sx={{ p: 2 }}>
                <Typography variant="body1" paragraph>
                  Please read these terms and conditions carefully before using our service.
                </Typography>
                <Typography variant="body1" paragraph>
                  1. By accessing and using this service, you accept and agree to be bound by the terms and provision of this agreement.
                </Typography>
                <Typography variant="body1" paragraph>
                  2. All content included on this site is the property of our company or its content suppliers and protected by international copyright laws.
                </Typography>
                <Typography variant="body1" paragraph>
                  3. We reserve the right to modify these terms at any time. We do so by posting modified terms on this website.
                </Typography>
                <Typography variant="body1" paragraph>
                  4. Your use of the service is at your sole risk. The service is provided on an &quotas is&quot and &quotas available&quot basis.
                </Typography>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button
                variant="contained"
                onClick={() => setShowTerms(false)}
              >
                Close
              </Button>
            </DialogActions>
          </Dialog>
        )}
      </Grid>
    </Grid>
  );
}
