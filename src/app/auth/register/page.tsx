'use client';

import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Container, Link, Dialog, DialogTitle,
    DialogContent, DialogActions, Button, Grid, TextField, Checkbox,
    FormControlLabel, CircularProgress, Autocomplete
} from '@mui/material';
import { useRouter } from 'next/navigation';
import axiosServices from '@/utils/axios';
import LoadingPage from '@/app/components/LoadingPage';
import InfoCarousel from '../authForms/InfoCarousel';


const organizations = [
    "Datacentrix", "Kyoto", "TestUser", "Datacentrix pty", "Arcne Cope", "Acme Corp"
];

const organizationTypes = [
    "Private", "Public", "Government", "Non-Profit", "Educational"
];

const initialForm = {
    firstName: '', lastName: '', email: '', mobile: '+27',
    organisation: { organisation_name: '', organisation_type: '', msa_accepted: false }
};

const initialErrors = {
    firstName: '', lastName: '', email: '', mobile: '',
    organisation_name: '', organisation_type: '', msa_accepted: ''
};

export default function RegistrationPage() {
    const router = useRouter();

    const [formData, setFormData] = useState(initialForm);
    const [errors, setErrors] = useState(initialErrors);
    const [msaAccepted, setMsaAccepted] = useState(false);
    const [dialogMessage, setDialogMessage] = useState('');
    const [showTerms, setShowTerms] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 1000);
        return () => clearTimeout(timer);
    }, []);

    const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/[^\d+]/g, '');
        if (!val.startsWith('+27')) return setFormData(prev => ({ ...prev, mobile: '+27' }));
        setFormData(prev => ({ ...prev, mobile: val.slice(0, 12) }));
        setErrors(prev => ({ ...prev, mobile: '' }));
    };

    const validateForm = () => {
        const temp = { ...initialErrors };
        let valid = true;

        if (!formData.firstName) { temp.firstName = 'Required'; valid = false; }
        if (!formData.lastName) { temp.lastName = 'Required'; valid = false; }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) { temp.email = 'Invalid email'; valid = false; }
        if (!/^\+27\d{9}$/.test(formData.mobile)) { temp.mobile = 'Format: +27123456789'; valid = false; }
        if (!formData.organisation.organisation_name) { temp.organisation_name = 'Required'; valid = false; }
        if (!formData.organisation.organisation_type) { temp.organisation_type = 'Required'; valid = false; }
        if (!msaAccepted) { temp.msa_accepted = 'Required'; valid = false; }

        setErrors(temp);
        return valid;
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsRegistering(true);
        let orgId = null;

        try {
            const existingOrg = organizations.find(o =>
                o.toLowerCase() === formData.organisation.organisation_name.toLowerCase()
            );

            if (!existingOrg) {
                const { data } = await axiosServices.post(`${process.env.NEXT_PUBLIC_BACK_END_BASEURL}/api/organisations/createorganisation`, {
                    organisation_name: formData.organisation.organisation_name,
                    organisation_type: formData.organisation.organisation_type
                });
                orgId = data.id;
            }

            await axiosServices.post(`${process.env.NEXT_PUBLIC_BACK_END_BASEURL}/api/users/registercustomer`, {
                ...formData,
                organisation: { ...formData.organisation, id: orgId, msa_accepted: msaAccepted },
                actionById: 1,
                role: 'Customer',
                status: 'Active',
                msa_version_id: null
            });

            setDialogMessage('Registration successful. Please check your email.');
            setDialogOpen(true);
            setTimeout(() => {
                setDialogOpen(false);
                setIsLoading(true);
                router.push('/auth/login');
            }, 1500);

            setFormData(initialForm);
            setMsaAccepted(false);
        } catch (err: any) {
            setDialogMessage(err.response?.data?.message || 'Registration failed. Try again.');
            setDialogOpen(true);
        } finally {
            setIsRegistering(false);
        }
    };

    if (isLoading) {
        return <LoadingPage title="Preparing Registration..." subtitle="Hang tight" />;
    }

    return (
        <Grid container sx={{ height: '100vh', overflow: 'hidden' }}>
            {/* Left: Carousel */}
            <Grid item xs={12} md={6} sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', justifyContent: 'center' }}>
                <InfoCarousel />
            </Grid>

            {/* Right: Form */}
            <Grid item xs={12} md={6} sx={{
                p: 4, minHeight: '100vh', backgroundImage: 'url(/images/backgrounds/new-login-bg.jpeg)',
                backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
                <Container maxWidth="sm">
                    <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
                        <Typography variant="h4" fontWeight={600} gutterBottom textAlign="center">Create Account</Typography>

                        <Box component="form" onSubmit={handleRegister} sx={{ mt: 3 }}>
                            {/* First/Last Name */}
                            <Grid container spacing={2}>
                                {['firstName', 'lastName'].map((field, i) => (
                                    <Grid item xs={12} sm={6} key={field}>
                                        <TextField
                                            label={field === 'firstName' ? 'First Name' : 'Last Name'}
                                            value={formData[field as keyof typeof formData]}
                                            onChange={(e) => setFormData(prev => ({ ...prev, [field]: e.target.value }))}
                                            fullWidth required size="medium"
                                            error={!!errors[field as keyof typeof errors]}
                                            helperText={errors[field as keyof typeof errors]}
                                        />
                                    </Grid>
                                ))}
                            </Grid>

                            {/* Email */}
                            <TextField
                                sx={{ mt: 2 }}
                                label="Email"
                                value={formData.email}
                                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                fullWidth required size="medium"
                                error={!!errors.email}
                                helperText={errors.email}
                            />

                            {/* Organisation Name / Type */}
                            <Grid container spacing={2} mt={0.5}>
                                <Grid item xs={12} sm={6}>
                                    <Autocomplete
                                        freeSolo
                                        options={organizations}
                                        value={formData.organisation.organisation_name}
                                        onChange={(e, val) =>
                                            setFormData(prev => ({ ...prev, organisation: { ...prev.organisation, organisation_name: val || '' } }))
                                        }
                                        renderInput={(params) => (
                                            <TextField {...params} label="Organisation Name" required error={!!errors.organisation_name} helperText={errors.organisation_name} />
                                        )}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Autocomplete
                                        freeSolo
                                        options={organizationTypes}
                                        value={formData.organisation.organisation_type}
                                        onChange={(e, val) =>
                                            setFormData(prev => ({ ...prev, organisation: { ...prev.organisation, organisation_type: val || '' } }))
                                        }
                                        renderInput={(params) => (
                                            <TextField {...params} label="Organisation Type" required error={!!errors.organisation_type} helperText={errors.organisation_type} />
                                        )}
                                    />
                                </Grid>
                            </Grid>

                            {/* Mobile */}
                            <TextField
                                sx={{ mt: 2 }}
                                label="Contact Number"
                                value={formData.mobile}
                                onChange={handleMobileChange}
                                fullWidth required
                                error={!!errors.mobile}
                                helperText={errors.mobile}
                                inputProps={{ maxLength: 12 }}
                            />

                            {/* MSA Agreement */}
                            <FormControlLabel
                                control={
                                    <Checkbox checked={msaAccepted} onChange={(e) => setMsaAccepted(e.target.checked)} />
                                }
                                label={
                                    <Typography variant="body2" color={errors.msa_accepted ? 'error' : 'text.secondary'}>
                                        I accept the Master Service Agreement
                                    </Typography>
                                }
                                sx={{ mt: 1 }}
                            />
                            {errors.msa_accepted && <Typography variant="caption" color="error" sx={{ ml: 3 }}>{errors.msa_accepted}</Typography>}

                            {/* Submit */}
                            <Button
                                type="submit"
                                variant="contained"
                                fullWidth
                                size="large"
                                disabled={isRegistering}
                                sx={{ mt: 3 }}
                            >
                                {isRegistering ? <CircularProgress size={24} color="inherit" /> : 'Register'}
                            </Button>

                            <Box textAlign="center" mt={2}>
                                <Typography variant="body2">
                                    Already have an account?{' '}
                                    <Link href="/auth/login" underline="hover" onClick={(e) => {
                                        e.preventDefault();
                                        setIsLoading(true);
                                        setTimeout(() => router.push('/auth/login'), 500);
                                    }}>Sign in</Link>
                                </Typography>
                            </Box>
                        </Box>
                    </Paper>
                </Container>

                {/* Dialogs */}
                <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
                    <DialogTitle>Notice</DialogTitle>
                    <DialogContent><Typography>{dialogMessage}</Typography></DialogContent>
                    <DialogActions>
                        <Button variant="contained" onClick={() => setDialogOpen(false)}>Close</Button>
                    </DialogActions>
                </Dialog>

                <Dialog open={showTerms} onClose={() => setShowTerms(false)} maxWidth="md" fullWidth>
                    <DialogTitle>Terms & Conditions</DialogTitle>
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
                        <Button onClick={() => setShowTerms(false)}>Close</Button>
                    </DialogActions>
                </Dialog>
            </Grid>
        </Grid>
    );
}
