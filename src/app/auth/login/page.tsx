'use client'
import { useState, useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import { useAuthStore } from '@/store';
import { useRouter } from 'next/navigation';
import { LoadingPage } from '@/app/components/'
import axiosServices from '@/utils/axios';
import GitHubIcon from '@mui/icons-material/GitHub';
import Link from '@mui/material/Link';
import { decoder } from '@/utils'
import { IToken } from '@/types'
import Image from 'next/image';
import CloudIcon from '@mui/icons-material/Cloud';
import BackupIcon from '@mui/icons-material/Backup';
import StorageIcon from '@mui/icons-material/Storage';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import LoginForm from '../authForms/LoginForm'
import OtpVerification from '../authForms/OtpVerification'
import PasswordReset from '../authForms/PasswordReset'
import LoginInfoCarousel from '../authForms/LoginInfoCarousel'
import AuthDialogs from '../authForms/AuthDialogs'
import { Key } from '@mui/icons-material';

const AuthLogin = () => {
    const { setToken, setUser, token } = useAuthStore();
    const [step, setStep] = useState(0);
    const [email, setEmail] = useState('');
    const [openSuccessDialog, setOpenSuccessDialog] = useState<boolean>(false)
    const [openErrorDialog, setOpenErrorDialog] = useState<boolean>(false)
    const [errorMessage, setErrorMessage] = useState<string>('')
    const [userName, setUserName] = useState<string>('')
    const [isRedirecting, setIsRedirecting] = useState(false);
    const [showRightSide, setShowRightSide] = useState(false);
    const [showSSOOptions, setShowSSOOptions] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSSOLoading, setIsSSOLoading] = useState(false);
    const router = useRouter();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchSingleUser = async (userId: number) => {
            return await axiosServices.get(
                `${process.env.NEXT_PUBLIC_BACK_END_BASEURL}/api/users/getuser?userId=${userId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
        }

        const handleGitHubSession = async () => {
            const token = new URLSearchParams(window.location.search)?.get('accessToken');
            const refreshToken = new URLSearchParams(window.location.search)?.get('refreshToken');

            try {
                setIsLoading(true);
                if (!token || !refreshToken) return
                setToken(token, refreshToken);

                const { id } = decoder(token) as IToken;
                const userDetails = await fetchSingleUser(id as number);

                if (!userDetails.data) {
                    setErrorMessage('Failed to fetch user details');
                    setOpenErrorDialog(true);
                    throw new Error('Failed to fetch user details');
                }

                setUser(userDetails.data || null);

                const redirectRoute = userDetails.data?.role?.name === 'SDM' ? '/nlu/sdm/dashboard' : '/';
                window.location.href = redirectRoute;
            } catch (error) {
                setErrorMessage('Failed to initiate GitHub login. Please try again.');
                setOpenErrorDialog(true);
            } finally {
                setIsLoading(false);
            }
        }

        handleGitHubSession();
    }, []);


    useEffect(() => {
        // Simulate initial loading
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                handleMenuClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleEmailPasswordClick = () => {
        setShowRightSide(true);
        setTimeout(() => {
            setStep(1);
        }, 300); // Delay the step change to allow for animation
    };

    const handleBackToOptions = () => {
        setShowRightSide(false);
    };

    const handleSSOClick = () => {
        setShowSSOOptions(!showSSOOptions);
    };

    const triggerGitHubSignIn = () => {
        window.open(`${process.env.NEXT_PUBLIC_BACK_END_BASEURL}/auth/github`, '_self');
    }

    const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(open ? null : event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleServiceClick = (service: string) => {
        handleMenuClose();
        // Convert service name to URL-friendly format
        const urlPath = service.toLowerCase()
            .replace(/[&]/g, 'and')  // Replace & with 'and'
            .replace(/\s+/g, '-');   // Replace spaces with hyphens
        router.push(`/services/${urlPath}`);
    };

    // Add error boundary
    if (status === 'loading' || isRedirecting || isLoading || isSSOLoading) {
        return <LoadingPage />;
    }

    // Show login options when not authenticated
    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            overflow: 'hidden'
        }}>
            {/* Navbar */}
            <AppBar
                position="fixed"
                sx={{
                    backgroundColor: 'white',
                    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                }}
            >
                <Toolbar sx={{ justifyContent: 'space-between' }}>
                    <Box>
                        <Image
                            src="/images/logos/dark-logo.svg"
                            alt="Logo"
                            width={150}
                            height={40}
                            priority
                        />
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                            onClick={() => handleServiceClick('Cloud')}
                            startIcon={<CloudIcon sx={{ color: 'black' }} />}
                            sx={{
                                color: 'black',
                                textTransform: 'none',
                                fontWeight: 500,
                                backgroundColor: 'transparent',
                                '&:hover': {
                                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                                    color: 'black'
                                },
                            }}
                        >
                            Cloud
                        </Button>
                        <Button
                            onClick={() => handleServiceClick('Backup & DR')}
                            startIcon={<BackupIcon sx={{ color: 'black' }} />}
                            sx={{
                                color: 'black',
                                textTransform: 'none',
                                fontWeight: 500,
                                backgroundColor: 'transparent',
                                '&:hover': {
                                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                                    color: 'black'
                                },
                            }}
                        >
                            Backup & DR
                        </Button>
                        <Button
                            onClick={() => handleServiceClick('Colocation')}
                            startIcon={<StorageIcon sx={{ color: 'black' }} />}
                            sx={{
                                color: 'black',
                                textTransform: 'none',
                                fontWeight: 500,
                                backgroundColor: 'transparent',
                                '&:hover': {
                                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                                    color: 'black'
                                },
                            }}
                        >
                            Colocation
                        </Button>
                    </Box>
                </Toolbar>
            </AppBar>

            {/* Add Toolbar spacing to prevent content from being hidden under navbar */}
            <Toolbar />

            {/* Main Content */}
            <Grid container sx={{
                flex: 1,
                overflow: 'hidden',
                position: 'relative',
                height: 'calc(100vh - 64px)' // Subtract navbar height
            }}>
                {/* Dashboard Screenshot Preview - Overlapping Image */}
                <Image
                    src="/images/assets/hero-image-old.png"
                    alt="Hero Image"
                    width={0}
                    height={0}
                    sizes="100vw"
                    style={{
                        position: 'absolute',
                        top: '13em',
                        right: '28em',
                        transform: 'translateX(40%)',
                        width: '55vw',
                        height: 'auto',
                        zIndex: 2,
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
                        borderRadius: '12px',
                        pointerEvents: 'none'
                    }}
                    quality={100}
                    priority
                />
                {/* Left side - Login Form */}
                <Grid item xs={12} md={6} sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'start',
                    p: 4,
                    transition: 'all 0.5s ease-in-out',
                    overflow: 'hidden'
                }}>

                    <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'start' }}>
                        <Box sx={{ width: '100%' }}>
                            <LoginInfoCarousel />
                        </Box>
                    </Box>

                    <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingRight: 4 }}>
                        {/* Add AuthDialogs component */}
                        <AuthDialogs
                            openSuccessDialog={openSuccessDialog}
                            openErrorDialog={openErrorDialog}
                            errorMessage={errorMessage}
                            userName={userName}
                            onCloseError={() => {
                                setOpenErrorDialog(false);
                                setErrorMessage('');
                            }}
                        />

                        <Box
                            width="100%"
                            maxWidth={400}
                            sx={{
                                background: '#ffffff',
                                borderRadius: '12px',
                                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
                                padding: 2,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                position: 'relative',
                                zIndex: 0
                            }}
                        >
                            {/* Registration Link */}
                            <Typography
                                variant="body1"
                                textAlign="center"
                                mb={2}
                                sx={{
                                    color: 'text.secondary',
                                    '& a': {
                                        color: 'primary.main',
                                        textDecoration: 'none',
                                        fontWeight: 500,
                                        '&:hover': {
                                            textDecoration: 'underline'
                                        }
                                    }
                                }}
                            >
                                Don&apos;t have an account?{' '}
                                <Link href="/auth/register" color="primary">
                                    Register here
                                </Link>
                            </Typography>

                            {/* Logo */}
                            <Box display='flex' justifyContent='center' mb={2}>
                                <Image
                                    src="/images/logos/dark-logo.svg"
                                    alt="Logo"
                                    width={150}
                                    height={40}
                                    priority
                                />
                            </Box>

                            {/* Login Options */}
                            <Stack spacing={2} width="100%">
                                {step === 0 ? (
                                    <>
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            color="primary"
                                            onClick={handleEmailPasswordClick}
                                            size="large"
                                            sx={{
                                                transition: '0.3s',
                                                '&:hover': {
                                                    transform: 'scale(1.05)',
                                                    boxShadow: '0 4px 12px rgba(0, 123, 255, 0.3)'
                                                }
                                            }}
                                        >
                                            Sign in with Email and Password
                                        </Button>

                                        <Box sx={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: 2,
                                            transition: 'all 0.3s ease-in-out',
                                            height: showSSOOptions ? 'auto' : '56px',
                                            overflow: 'hidden'
                                        }}>
                                            <Button
                                                fullWidth
                                                variant="outlined"
                                                color="primary"
                                                onClick={handleSSOClick}
                                                size="large"
                                                sx={{
                                                    transition: '0.3s',
                                                    '&:hover': {
                                                        transform: 'scale(1.05)',
                                                        boxShadow: '0 4px 12px rgba(0, 123, 255, 0.3)'
                                                    }
                                                }}
                                            >
                                                Sign in with Single Sign-On (SSO)
                                            </Button>

                                            <Box sx={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: 2,
                                                transition: 'all 0.3s ease-in-out',
                                                opacity: showSSOOptions ? 1 : 0,
                                                transform: showSSOOptions ? 'translateY(0)' : 'translateY(-20px)',
                                                pointerEvents: showSSOOptions ? 'auto' : 'none'
                                            }}>
                                                <Button
                                                    fullWidth
                                                    variant="contained"
                                                    color="primary"
                                                    onClick={triggerGitHubSignIn}
                                                    size="large"
                                                    startIcon={<GitHubIcon />}
                                                    sx={{
                                                        transition: '0.3s',
                                                        backgroundColor: '#24292e',
                                                        '&:hover': {
                                                            backgroundColor: '#1b1f23',
                                                            transform: 'scale(1.02)',
                                                            boxShadow: '0 4px 12px rgba(36, 41, 46, 0.3)'
                                                        }
                                                    }}
                                                >
                                                    Sign in with GitHub
                                                </Button>

                                                <Button
                                                    fullWidth
                                                    variant="outlined"
                                                    color="primary"
                                                    onClick={triggerGitHubSignIn}
                                                    startIcon={<Key />}
                                                    size="large"
                                                    sx={{
                                                        transition: '0.3s',
                                                        '&:hover': {
                                                            transform: 'scale(1.05)',
                                                            boxShadow: '0 4px 12px rgba(0, 123, 255, 0.3)'
                                                        }
                                                    }}
                                                >
                                                    Sign in with Single Sign-On (SSO)
                                                </Button>
                                            </Box>
                                        </Box>
                                    </>
                                ) : step === 1 ? (
                                    <LoginForm
                                        onOtpSent={(email) => {
                                            setEmail(email);
                                            setStep(2);
                                        }}
                                        onError={(message) => {
                                            setErrorMessage(message);
                                            setOpenErrorDialog(true);
                                        }}
                                        onBackToOptions={() => setStep(0)}
                                    />
                                ) : step === 2 ? (
                                    <OtpVerification
                                        email={email}
                                        onStepChange={setStep}
                                        onError={(message) => {
                                            setErrorMessage(message);
                                            setOpenErrorDialog(true);
                                        }}
                                        onSuccess={(name) => {
                                            setUserName(name);
                                            setOpenSuccessDialog(true);
                                        }}
                                    />
                                ) : step === 3 ? (
                                    <PasswordReset
                                        email={email}
                                        // onStepChange={setStep}
                                        onError={(message) => {
                                            setErrorMessage(message);
                                            setOpenErrorDialog(true);
                                        }}
                                        onSuccess={() => {
                                            setOpenSuccessDialog(true);
                                        }}
                                    />
                                ) : null}
                            </Stack>
                        </Box>
                    </Box>
                </Grid>

                {/* Right side - Carousel */}
                <Grid item xs={12} md={6} sx={{
                    display: { xs: 'none', md: 'flex' },
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    bgcolor: '#ffffff',
                    color: 'black',
                    height: '100%',
                    overflow: 'hidden',
                    backgroundImage: 'url(/images/backgrounds/new-login-bg.jpeg)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                }}>

                </Grid>
            </Grid>
        </Box>
    );
}

export default AuthLogin;