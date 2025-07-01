'use client';

import {
  Box, Typography, Container, Link, Grid, TextField,
  Checkbox, FormControlLabel, CircularProgress, Button,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Stack
} from '@mui/material';
import InfoCarousel from '../authForms/InfoCarousel';
import TermsDialog from './TermsDialog';
import LoadingPage from '@/app/components/LoadingPage';
import { useRegisterForm } from '@/hooks';
import { useRouter } from 'next/navigation';

export default function RegistrationForm() {
  const {
    isLoading, isRegistering, dialogMessage, dialogOpen, setDialogOpen,
    msaAccepted, setMsaAccepted, showTerms, setShowTerms,
    formData, setFormData, errors,
    handleMobileChange, handleRegister, isFormValid,
    touched, setTouched, validateField
  } = useRegisterForm();

  const router = useRouter();

  const renderLabel = (label: string, required = false) => (
    <Typography
      variant="subtitle2"
      sx={{ color: 'text.secondary', mb: 0.5 }}
    >
      {label}
      {required && <Typography component="span" color="error.main"> *</Typography>}
    </Typography>
  );

  if (isLoading) {
    return <LoadingPage title="Loading Registration" subtitle="Please wait while we prepare your registration form" />;
  }

  return (
    <Grid container sx={{ height: '100vh', overflow: 'hidden' }}>
      <Grid item xs={12} md={6} sx={{ display: { xs: 'none', md: 'flex' }, bgcolor: '#fff' }}>
        <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <InfoCarousel />
        </Box>
      </Grid>

      <Grid item xs={12} md={6} sx={{
        backgroundImage: 'url(/images/backgrounds/new-login-bg.jpeg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        p: 4, display: 'flex', alignItems: 'center'
      }}>
        <Container maxWidth="sm">
          <Box sx={{ background: '#fff', borderRadius: 2, boxShadow: 3, p: 4 }}>
            <Typography variant="h4" textAlign="center" fontWeight="bold">Create Your Account</Typography>
            <Typography variant="body1" color="text.secondary" textAlign="center" mb={3}>
              Join us today and start your journey
            </Typography>

            <Box component="form" onSubmit={handleRegister} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Grid container spacing={1}>
                <Grid item xs={12} sm={6}>
                  {renderLabel('First Name', true)}
                  <TextField
                    fullWidth
                    value={formData.firstName}
                    onChange={(e) => {
                      setFormData({ ...formData, firstName: e.target.value });
                      if (touched.firstName) validateField('firstName');
                    }}
                    onBlur={() => {
                      setTouched(prev => ({ ...prev, firstName: true }));
                      validateField('firstName');
                    }}
                    error={touched.firstName && !!errors.firstName}
                    helperText={touched.firstName ? errors.firstName : ''}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  {renderLabel('Last Name', true)}
                  <TextField
                    fullWidth
                    value={formData.lastName}
                    onChange={(e) => {
                      setFormData({ ...formData, lastName: e.target.value });
                      if (touched.lastName) validateField('lastName');
                    }}
                    onBlur={() => {
                      setTouched(prev => ({ ...prev, lastName: true }));
                      validateField('lastName');
                    }}
                    error={touched.lastName && !!errors.lastName}
                    helperText={touched.lastName ? errors.lastName : ''}
                  />
                </Grid>
              </Grid>

              <Stack>
                {renderLabel('Email', true)}
                <TextField
                  fullWidth
                  type="email"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    if (touched.email) validateField('email');
                  }}
                  onBlur={() => {
                    setTouched(prev => ({ ...prev, email: true }));
                    validateField('email');
                  }}
                  error={touched.email && !!errors.email}
                  helperText={touched.email ? errors.email : ''}
                />
              </Stack>

              <Stack>
                {renderLabel('Organisation Name', true)}
                <TextField
                  fullWidth
                  value={formData.organisation.organisation_name}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      organisation: {
                        ...formData.organisation,
                        organisation_name: e.target.value
                      }
                    });
                    if (touched.organisation_name) validateField('organisation_name');
                  }}
                  onBlur={() => {
                    setTouched(prev => ({ ...prev, organisation_name: true }));
                    validateField('organisation_name');
                  }}
                  error={touched.organisation_name && !!errors.organisation_name}
                  helperText={touched.organisation_name ? errors.organisation_name : ''}
                />
              </Stack>

              <Stack>
                {renderLabel('Contact Number', true)}
                <TextField
                  fullWidth
                  value={formData.mobile}
                  onChange={handleMobileChange}
                  onBlur={() => {
                    setTouched(prev => ({ ...prev, mobile: true }));
                    validateField('mobile');
                  }}
                  inputProps={{ maxLength: 12 }}
                  error={touched.mobile && !!errors.mobile}
                  helperText={touched.mobile ? errors.mobile : ''}
                />
              </Stack>

              <Stack>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={msaAccepted}
                      onChange={(e) => setMsaAccepted(e.target.checked)}
                    />
                  }
                  label={
                    <Typography variant="body2" color={errors.msa_accepted ? 'error' : 'text.secondary'}>
                      I accept the Master Service Agreement
                      <Typography component="span" color="error.main"> *</Typography>
                    </Typography>
                  }
                />
                {errors.msa_accepted && (
                  <Typography variant="caption" color="error" ml={3}>{errors.msa_accepted}</Typography>
                )}
              </Stack>

              <Button
                type="submit"
                variant="contained"
                fullWidth
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
                disabled={!isFormValid() || isRegistering}
              >
                {isRegistering ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CircularProgress size={20} color="inherit" /> Creating Account...
                  </Box>
                ) : 'Create Account'}
              </Button>

              <Typography variant="body2" color="text.secondary" textAlign="center">
                Already have an account?{' '}
                <Link href="/auth/login" onClick={(e) => {
                  e.preventDefault();
                  router.push('/auth/login');
                }}>
                  Sign in
                </Link>
              </Typography>

              <Typography variant="body2" color="text.secondary" textAlign="center">
                By registering you agree to our{' '}
                <Link component="button" onClick={() => setShowTerms(true)}>Terms and Conditions *</Link>
              </Typography>
            </Box>
          </Box>
        </Container>

        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
          <DialogTitle>Notification</DialogTitle>
          <DialogContent>
            <Typography>{dialogMessage}</Typography>
          </DialogContent>
          <DialogActions>
            <Button variant="contained" onClick={() => setDialogOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {showTerms && <TermsDialog showTerms={showTerms} setShowTerms={setShowTerms} />}
      </Grid>
    </Grid>
  );
}
