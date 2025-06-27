import React, { useCallback, useEffect, useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import useMediaQuery from '@mui/material/useMediaQuery';
import { styled } from '@mui/material/styles';
import { useSelector, useDispatch } from '@/store/hooks';
import { toggleSidebar, toggleMobileSidebar, setDarkMode } from '@/store/customizer/CustomizerSlice';
import { IconMoon, IconSun, IconMessageReport, IconClipboardList, IconCreditCard, IconX } from '@tabler/icons-react';
import { BsLayoutTextWindowReverse } from "react-icons/bs"; // Import the new icon
import Notifications from './Notification';
import Profile from './Profile';
import Search from './Search';
import { AppState } from '@/store/store';
// import MobileRightSidebar from './MobileRightSidebar';
// import FeedbackDialog from './Feedback-dialog';
// import { LogsDialog } from '@/components/LogsDialog';
import { Alert, Link, Tooltip, Typography, Paper, Button, useTheme } from '@mui/material';
import { useAuthStore } from '@/store';
import axiosServices from '@/utils/axios';
import axios, { AxiosError } from 'axios';
import { useCreditCardStore } from '@/store/useCreditCardStore';
import { IPaymentCard } from '@/types';
import WalletStatusPopover from '@/app/(DashboardLayout)/(pages)/nlu/customer/virtual-machines/components/WalletStatusPopover';
import NotificationPopover from '@/app/(DashboardLayout)/(pages)/nlu/customer/virtual-machines/components/NotificationPopover';
import { getUserRoleDisplay } from '@/app/(DashboardLayout)/utilities/helpers/user.helper';

const Header = () => {
  const lgUp = useMediaQuery((theme: any) => theme.breakpoints.up('lg'));
  const lgDown = useMediaQuery((theme: any) => theme.breakpoints.down('lg'));
  const { user: authUser, primaryOrgId } = useAuthStore();
  const [isCustomer, setIsCustomer] = useState(false);
  const { setPaymentCards, paymentCards, hasLinkedCreditCard, setField, setSelectedCard, wallet } = useCreditCardStore()
  const customizer = useSelector((state: AppState) => state.customizer);
  const dispatch = useDispatch();
  const { token, roles } = useAuthStore();

  const [feedbackOpen, setFeedbackOpen] = React.useState(false);
  const [logsOpen, setLogsOpen] = React.useState(false);
  const [logs, setLogs] = React.useState([]);

  // Payment banner state
  const [isPaymentBannerVisible, setIsPaymentBannerVisible] = useState(true);
  const [isPaymentBannerAnimating, setIsPaymentBannerAnimating] = useState(false);

  const AppBarStyled = styled(AppBar)(({ theme }) => ({
    boxShadow: 'none',
    background: theme.palette.background.paper,
    justifyContent: 'center',
    backdropFilter: 'blur(4px)',
    borderBottom: `1px solid ${theme.palette.divider}`,
    [theme.breakpoints.up('lg')]: {
      minHeight: customizer.TopbarHeight,
    },
  }));
  const ToolbarStyled = styled(Toolbar)(({ theme }) => ({
    width: '100%',
    color: theme.palette.text.secondary,
  }));

  // Add styled component for the feedback button
  const ActionButton = styled(IconButton)(({ theme }) => ({
    padding: '8px',
    marginLeft: '8px',
    '&:hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.04)',
    },
  }));

  const FeedbackButton = styled(ActionButton)(({ theme }) => ({
    borderColor: '#ff4444',
    '&:hover': {
      backgroundColor: 'rgba(255, 68, 68, 0.04)',
    },
  }));

  const LogsButton = styled(ActionButton)(({ theme }) => ({
    borderColor: '#2196f3',
    '&:hover': {
      backgroundColor: 'rgba(33, 150, 243, 0.04)',
    },
  }));

  // Check if payment banner was dismissed in current session
  useEffect(() => {
    const dismissed = sessionStorage.getItem('paymentBannerDismissed');
    if (dismissed === 'true') {
      setIsPaymentBannerVisible(false);
    } else {
      setIsPaymentBannerVisible(true);
    }
  }, []);

  // Reset payment banner visibility when user changes
  useEffect(() => {
    if (authUser?.id) {
      const lastUserId = sessionStorage.getItem('lastPaymentBannerUserId');
      if (lastUserId !== authUser.id.toString()) {
        // New user logged in, show payment banner
        setIsPaymentBannerVisible(true);
        setIsPaymentBannerAnimating(false);
        sessionStorage.setItem('lastPaymentBannerUserId', authUser.id.toString());
        sessionStorage.removeItem('paymentBannerDismissed');
      }
    }
  }, [authUser?.id]);

  const handlePaymentBannerDismiss = () => {
    setIsPaymentBannerAnimating(true);
    // Start the animation
    setTimeout(() => {
      setIsPaymentBannerVisible(false);
      sessionStorage.setItem('paymentBannerDismissed', 'true');
    }, 300); // Match the animation duration
  };

  const fetchLogs = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACK_END_BASEURL}api/users/getlogs}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setLogs(data);
      setLogsOpen(true);
    } catch (error: unknown) {
      console.error('Error fetching logs:', error);
      setLogs([]);
    }
  };

  const fetchCardDetails = useCallback(async () => {
    try {
      const orgId = primaryOrgId;
      const creditCardResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_BACK_END_BASEURL}/api/payment/getcustomercards/${orgId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const customerCards: IPaymentCard[] = creditCardResponse.data.cards

      if (!customerCards.length) {
        setField('hasLinkedCreditCard', false);
        throw new Error('An error occurred while fetching card details');
      }

      setPaymentCards(customerCards)
      setField('hasLinkedCreditCard', customerCards.length > 0);

    } catch (error: unknown) {
      let errorMessage = 'An error occurred while fetching card details';

      if (error instanceof AxiosError) {
        errorMessage = error.response?.data?.message || error.message || errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      // Swal.fire({
      //   icon: 'error',
      //   title: 'API Error',
      //   text: errorMessage,
      //   showConfirmButton: true
      // });
    }
  }, [primaryOrgId, token, setField, setPaymentCards]);

  useEffect(() => {
    setIsCustomer(getUserRoleDisplay(authUser)?.includes('Customer') as boolean);
    fetchCardDetails();
  }, [authUser, fetchCardDetails]);

  const [alerts, setAlerts] = useState<any>([]);

  const fetchAlerts = useCallback(async () => {
    try {
      const orgId = primaryOrgId;
      const res = await axios.get(`${process.env.NEXT_PUBLIC_BACK_END_BASEURL}/api/in-app-alerts/${orgId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setAlerts(res.data.alerts || []);
    } catch (error: unknown) {
      console.error('Error fetching alerts:', error);
      setAlerts([]);
    }
  }, [primaryOrgId, token]);

  const handleDismissAlert = async (id: number) => {
    try {
      // TODO if required
      // await axios.patch(`${process.env.NEXT_PUBLIC_BACK_END_BASEURL}/api/alerts/${id}/dismiss`, {}, {
      //   headers: { Authorization: `Bearer ${token}` }
      // });
      setAlerts((prev: any) => prev.map((alert: any) => alert.id === id ? { ...alert, dismissed: true } : alert));
    } catch (error: unknown) {
      console.error('Error dismissing alert:', error);
    }
  };

  const fetchWallet = useCallback(async () => {
    try {
      const orgId = primaryOrgId;
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACK_END_BASEURL}/api/wallet/${orgId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      setField('wallet', data);
    } catch (error: unknown) {
      console.error('Error fetching wallet:', error);
    }
  }, [setField, primaryOrgId, token]);

  useEffect(() => {
    fetchAlerts();
    fetchWallet();
  }, [fetchAlerts, fetchWallet]);

  return (
    <AppBarStyled position="sticky" color="default" sx={{ marginBottom: 4 }}>
      <ToolbarStyled>
        {/* Toggle Button Sidebar */}
        <Box display="flex" alignItems="center">
          {/* <Tooltip title={lgUp ? "Toggle Sidebar" : "Toggle Mobile Sidebar"}>
            <IconButton
              color="inherit"
              aria-label="menu"
              onClick={lgUp ? () => dispatch(toggleSidebar()) : () => dispatch(toggleMobileSidebar())}
            >
              <BsLayoutTextWindowReverse size="20" />
            </IconButton>
          </Tooltip> */}
        </Box>

        {/* ------------------------------------------- */}
        {/* Search Dropdown */}
        {/* ------------------------------------------- */}
        {lgUp ? (
          <>
          </>
        ) : null}

        <Box flexGrow={1} />
        <Stack spacing={1} direction="row" alignItems="center">
          <IconButton
            color="inherit"
            aria-label="toggle dark mode"
            onClick={() => dispatch(setDarkMode(customizer.activeMode === 'dark' ? 'light' : 'dark'))}
            sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
          >
            {/* {customizer.activeMode === 'dark' ? (
              <>
                <IconSun size={24} />
                <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' } }}>
                  Dark Mode
                </Typography>
              </>
            ) : (
              <>
                <IconMoon size={24} />
                <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' } }}>
                  Light Mode
                </Typography>
              </>
            )} */}
          </IconButton>
          {/* Feedback - Chand */}
          {/* <Tooltip title="Send Feedback on the app">
            <FeedbackButton
              color="inherit"
              aria-label="feedback"
              onClick={() => setFeedbackOpen(true)}
              sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <IconMessageReport size={24} />
              <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' } }}>
                Feedback
              </Typography>
            </FeedbackButton>
          </Tooltip> */}
          {roles === 'Admin' && (
            <Tooltip title="View Users Logs">
              <LogsButton
                color="inherit"
                aria-label="logs"
                onClick={fetchLogs}
                sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <IconClipboardList size={24} />
                <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' } }}>
                  Logs
                </Typography>
              </LogsButton>
            </Tooltip>
          )}
          {
            isCustomer &&
            <>
              <WalletStatusPopover wallet={wallet} />
              <NotificationPopover alerts={alerts} onDismiss={handleDismissAlert} />
            </>
          }

          <Tooltip title="Profile Settings">
            <span><Profile /></span>
          </Tooltip>

        </Stack>
        {/* <FeedbackDialog
          open={feedbackOpen}
          onClose={() => setFeedbackOpen(false)}
        />
        <LogsDialog
          open={logsOpen}
          onOpenChange={setLogsOpen}
          logs={logs}
        /> */}
      </ToolbarStyled>

      {/* Payment Setup Banner */}
      {!hasLinkedCreditCard && getUserRoleDisplay(authUser)?.includes("Customer") && isPaymentBannerVisible && (
        <Paper
          elevation={0}
          sx={{
            mx: 2,
            mb: 2,
            p: 2,
            background: 'linear-gradient(135deg, #1b5982 0%, #2d7bb8 100%)',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            position: 'relative',
            overflow: 'hidden',
            opacity: isPaymentBannerAnimating ? 0 : 1,
            transform: isPaymentBannerAnimating ? 'scale(0.95) translateY(-10px)' : 'scale(1) translateY(0)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
              pointerEvents: 'none'
            }
          }}
        >
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
              <Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 1 }}>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <IconCreditCard size={20} color="white" />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      color: 'white',
                      fontWeight: 600,
                      mb: 0.25,
                      fontSize: { xs: '0.875rem', sm: '1rem' }
                    }}
                  >
                    Complete Your Setup
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontSize: { xs: '0.75rem', sm: '0.875rem' }
                    }}
                  >
                    Set up your payment method to unlock all features
                  </Typography>
                </Box>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <Button
                  variant="contained"
                  size="small"
                  component={Link}
                  href="/nlu/payments"
                  sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: 1.5,
                    px: 2,
                    py: 0.5,
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    minWidth: 'auto',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.3)',
                      borderColor: 'rgba(255, 255, 255, 0.5)'
                    }
                  }}
                >
                  Set Up Payment
                </Button>
                <Tooltip title="Dismiss payment setup notification" arrow placement="top">
                  <IconButton
                    size="small"
                    onClick={handlePaymentBannerDismiss}
                    sx={{
                      color: 'rgba(255, 255, 255, 0.7)',
                      p: 0.5,
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        color: 'white',
                        transform: 'scale(1.1) rotate(90deg)',
                      },
                      '&:active': {
                        transform: 'scale(0.95) rotate(90deg)',
                      }
                    }}
                  >
                    <IconX size={16} />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Stack>
          </Box>
        </Paper>
      )}
    </AppBarStyled>
  );
};

export default Header;



