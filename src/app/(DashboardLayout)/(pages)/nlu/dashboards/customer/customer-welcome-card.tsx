"use client";
import React, { useEffect, useState } from "react";
import {
  Box,
  Avatar,
  Typography,
  Card,
  CardContent,
  Grid2 as Grid,
  Divider,
  Stack,
  useTheme,
  IconButton,
  Tooltip,
  Chip,
  Badge,
} from "@mui/material";
import { 
  IconArrowUpRight, 
  IconUser, 
  IconX, 
  IconChevronLeft, 
  IconChevronRight,
  IconSettings,
  IconAlertTriangle,
  IconBell,
  IconInfoCircle,
  IconCircleCheck,
  IconClock,
  IconServer,
  IconCloud,
  IconShield
} from "@tabler/icons-react";
import Image from "next/image";
import axios from "axios";
import { useAuthStore } from "@/store";

interface Notification {
  id: string;
  type: 'maintenance' | 'warning' | 'news' | 'info' | 'success' | 'update';
  title: string;
  message: string;
  timestamp: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  read: boolean;
}

const WelcomeCard = () => {
  const { user: authUser, token, primaryOrgId } = useAuthStore();
  const userName = authUser ? `${authUser.firstName}` : "";
  const theme = useTheme();
  const [vcenterOrgId, setVcenterOrgId] = useState<number | null>(null);
  const [isWelcomeVisible, setIsWelcomeVisible] = useState(true);
  const [isWelcomeAnimating, setIsWelcomeAnimating] = useState(false);
  const isNewCustomer = !vcenterOrgId;

  // Mock notifications - in real app, these would come from API
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'maintenance',
      title: 'Scheduled Maintenance',
      message: 'System maintenance scheduled for tomorrow at 2:00 AM. Expected downtime: 30 minutes.',
      timestamp: '2024-01-15T10:00:00Z',
      priority: 'medium',
      read: false
    },
    {
      id: '2',
      type: 'warning',
      title: 'High CPU Usage',
      message: 'VM "web-server-01" is experiencing high CPU usage (85%). Consider scaling up.',
      timestamp: '2024-01-15T09:30:00Z',
      priority: 'high',
      read: false
    },
    {
      id: '3',
      type: 'news',
      title: 'New Features Available',
      message: 'Enhanced monitoring dashboard and automated backup features are now available.',
      timestamp: '2024-01-15T08:00:00Z',
      priority: 'low',
      read: false
    },
    {
      id: '4',
      type: 'success',
      title: 'Backup Completed',
      message: 'Daily backup completed successfully. All data is secure and up to date.',
      timestamp: '2024-01-15T06:00:00Z',
      priority: 'low',
      read: true
    },
    {
      id: '5',
      type: 'update',
      title: 'Security Update',
      message: 'Critical security patches have been applied to your infrastructure.',
      timestamp: '2024-01-15T05:00:00Z',
      priority: 'critical',
      read: false
    }
  ]);

  useEffect(() => {
    // Check if welcome card was dismissed in current session
    const dismissed = sessionStorage.getItem('welcomeCardDismissed');
    if (dismissed === 'true') {
      setIsWelcomeVisible(false);
    } else {
      setIsWelcomeVisible(true);
    }
  }, []);

  // Reset welcome card visibility when user changes
  useEffect(() => {
    if (authUser?.id) {
      const lastUserId = sessionStorage.getItem('lastUserId');
      if (lastUserId !== authUser.id.toString()) {
        // New user logged in, show welcome card
        setIsWelcomeVisible(true);
        setIsWelcomeAnimating(false);
        sessionStorage.setItem('lastUserId', authUser.id.toString());
        sessionStorage.removeItem('welcomeCardDismissed');
      }
    }
  }, [authUser?.id]);

  useEffect(() => {
    const fetchOrganizationData = async () => {
      if (!primaryOrgId || !token) return;
      
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BACK_END_BASEURL}/api/organisations/getorg`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { id: primaryOrgId }
        });
        
        if (response.data) {
          setVcenterOrgId(response.data.vcenterOrg_id);
        }
      } catch (error) {
        
      }
    };

    fetchOrganizationData();
  }, [primaryOrgId, token]);

  const handleWelcomeDismiss = () => {
    setIsWelcomeAnimating(true);
    // Start the animation
    setTimeout(() => {
      setIsWelcomeVisible(false);
      sessionStorage.setItem('welcomeCardDismissed', 'true');
    }, 300); // Match the animation duration
  };

  const handleNotificationDismiss = (notificationId: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== notificationId));
  };

  const getNotificationIcon = (type: Notification['type']) => {
    const iconProps = { size: 16 };
    switch (type) {
      case 'maintenance':
        return <IconSettings {...iconProps} />;
      case 'warning':
        return <IconAlertTriangle {...iconProps} />;
      case 'news':
        return <IconBell {...iconProps} />;
      case 'info':
        return <IconInfoCircle {...iconProps} />;
      case 'success':
        return <IconCircleCheck {...iconProps} />;
      case 'update':
        return <IconShield {...iconProps} />;
      default:
        return <IconInfoCircle {...iconProps} />;
    }
  };

  const getSeverityColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'critical':
        return '#d32f2f'; // Red
      case 'high':
        return '#ed6c02'; // Orange/Yellow
      case 'medium':
        return '#1976d2'; // Blue
      case 'low':
        return '#2e7d32'; // Green
      default:
        return theme.palette.grey[600];
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return date.toLocaleDateString();
  };

  const unreadNotifications = notifications.filter(n => !n.read);
  const criticalNotifications = notifications.filter(n => n.priority === 'critical');
  const highNotifications = notifications.filter(n => n.priority === 'high');

  // Render notifications component
  const renderNotifications = () => {
    if (notifications.length === 0) return null;

    return (
      <Card
        sx={{ 
          background: theme.palette.background.paper,
          position: 'relative',
          overflow: 'hidden',
          boxShadow: theme.shadows[2],
          mb: 3,
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at top right, rgba(0,0,0,0.03) 0%, transparent 60%)',
          }
        }}
      >
        <CardContent sx={{ p: 3, position: 'relative' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <IconBell size={20} color={theme.palette.primary.main} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Notifications
            </Typography>
            {unreadNotifications.length > 0 && (
              <Badge 
                badgeContent={unreadNotifications.length} 
                color="error"
                sx={{
                  '& .MuiBadge-badge': {
                    fontSize: '0.7rem',
                    minWidth: 18,
                    height: 18,
                  }
                }}
              />
            )}
          </Box>

          <Stack spacing={1.5} sx={{ maxHeight: 300, overflowY: 'auto' }}>
            {notifications.slice(0, 5).map((notification) => (
              <Box
                key={notification.id}
                sx={{
                  p: 1.5,
                  borderRadius: 1,
                  border: `2px solid ${getSeverityColor(notification.priority)}`,
                  backgroundColor: getSeverityColor(notification.priority) + '08',
                  position: 'relative',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: getSeverityColor(notification.priority) + '12',
                    transform: 'translateX(2px)',
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      backgroundColor: getSeverityColor(notification.priority) + '20',
                      color: getSeverityColor(notification.priority),
                      flexShrink: 0,
                    }}
                  >
                    {getNotificationIcon(notification.type)}
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography 
                      variant="subtitle2" 
                      sx={{ 
                        fontWeight: 600,
                        color: theme.palette.text.primary,
                        mb: 0.5,
                        lineHeight: 1.2
                      }}
                    >
                      {notification.title}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: theme.palette.text.secondary,
                        display: 'block',
                        lineHeight: 1.3
                      }}
                    >
                      {notification.message}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: theme.palette.text.disabled,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        mt: 0.5
                      }}
                    >
                      <IconClock size={12} />
                      {formatTimestamp(notification.timestamp)}
                    </Typography>
                  </Box>
                  <IconButton
                    onClick={() => handleNotificationDismiss(notification.id)}
                    size="small"
                    sx={{
                      color: theme.palette.text.secondary,
                      p: 0.5,
                      '&:hover': {
                        color: theme.palette.error.main,
                        backgroundColor: theme.palette.error.light + '20',
                      }
                    }}
                  >
                    <IconX size={14} />
                  </IconButton>
                </Box>
                {!notification.read && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      backgroundColor: getSeverityColor(notification.priority),
                    }}
                  />
                )}
              </Box>
            ))}
          </Stack>

          {notifications.length > 5 && (
            <Typography 
              variant="caption" 
              sx={{ 
                color: theme.palette.text.disabled,
                display: 'block',
                textAlign: 'center',
                mt: 1
              }}
            >
              +{notifications.length - 5} more notification{notifications.length - 5 !== 1 ? 's' : ''}
            </Typography>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <>
      {/* Welcome Card */}
      {isWelcomeVisible && (
        <Card
          sx={{ 
            background: theme.palette.background.paper,
            position: 'relative',
            overflow: 'hidden',
            boxShadow: theme.shadows[2],
            opacity: isWelcomeAnimating ? 0 : 1,
            transform: isWelcomeAnimating ? 'scale(0.95) translateY(-10px)' : 'scale(1) translateY(0)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            mb: 3,
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'radial-gradient(circle at top right, rgba(0,0,0,0.03) 0%, transparent 60%)',
            }
          }}
        >
          <CardContent sx={{ p: 4, position: 'relative' }}>
            {/* Close button */}
            <Tooltip title="Dismiss welcome message" arrow placement="top">
              <IconButton
                onClick={handleWelcomeDismiss}
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  color: theme.palette.text.secondary,
                  backgroundColor: 'rgba(0,0,0,0.04)',
                  borderRadius: '50%',
                  width: 32,
                  height: 32,
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    color: theme.palette.error.main,
                    backgroundColor: theme.palette.error.light + '20',
                    transform: 'scale(1.1) rotate(90deg)',
                    boxShadow: `0 4px 12px ${theme.palette.error.main}40`,
                  },
                  '&:active': {
                    transform: 'scale(0.95) rotate(90deg)',
                  }
                }}
                size="small"
              >
                <IconX size={18} />
              </IconButton>
            </Tooltip>

            <Box sx={{ display: 'flex', gap: 3 }}>
              {/* Welcome Message Section */}
              <Box sx={{ flex: 1 }}>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 'bold', 
                    mb: 1,
                    color: theme.palette.text.primary
                  }}
                >
                  {isNewCustomer ? `Welcome to your dashboard, ${userName}!` : `Good to see you again, ${userName}.`}
                </Typography>
                <Typography 
                  variant="subtitle1" 
                  sx={{ 
                    opacity: 0.9,
                    color: theme.palette.text.secondary
                  }}
                >
                  {isNewCustomer 
                    ? "You're all set to get started — spin up your first virtual machine or explore available services to launch your cloud journey."
                    : "Here's how your infrastructure is performing today."}
                </Typography>
              </Box>

              {/* Notifications Section - Only show in welcome card if there are notifications */}
              {notifications.length > 0 && (
                <Box sx={{ 
                  width: 280, 
                  borderLeft: `1px solid ${theme.palette.divider}`,
                  pl: 3,
                  position: 'relative'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <IconBell size={20} color={theme.palette.primary.main} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Notifications
                    </Typography>
                    {unreadNotifications.length > 0 && (
                      <Badge 
                        badgeContent={unreadNotifications.length} 
                        color="error"
                        sx={{
                          '& .MuiBadge-badge': {
                            fontSize: '0.7rem',
                            minWidth: 18,
                            height: 18,
                          }
                        }}
                      />
                    )}
                  </Box>

                  <Stack spacing={1.5} sx={{ maxHeight: 200, overflowY: 'auto' }}>
                    {notifications.slice(0, 3).map((notification) => (
                      <Box
                        key={notification.id}
                        sx={{
                          p: 1.5,
                          borderRadius: 1,
                          border: `2px solid ${getSeverityColor(notification.priority)}`,
                          backgroundColor: getSeverityColor(notification.priority) + '08',
                          position: 'relative',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            backgroundColor: getSeverityColor(notification.priority) + '12',
                            transform: 'translateX(2px)',
                          }
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: 24,
                              height: 24,
                              borderRadius: '50%',
                              backgroundColor: getSeverityColor(notification.priority) + '20',
                              color: getSeverityColor(notification.priority),
                              flexShrink: 0,
                            }}
                          >
                            {getNotificationIcon(notification.type)}
                          </Box>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography 
                              variant="subtitle2" 
                              sx={{ 
                                fontWeight: 600,
                                color: theme.palette.text.primary,
                                mb: 0.5,
                                lineHeight: 1.2
                              }}
                            >
                              {notification.title}
                            </Typography>
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                color: theme.palette.text.secondary,
                                display: 'block',
                                lineHeight: 1.3
                              }}
                            >
                              {notification.message}
                            </Typography>
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                color: theme.palette.text.disabled,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5,
                                mt: 0.5
                              }}
                            >
                              <IconClock size={12} />
                              {formatTimestamp(notification.timestamp)}
                            </Typography>
                          </Box>
                          <IconButton
                            onClick={() => handleNotificationDismiss(notification.id)}
                            size="small"
                            sx={{
                              color: theme.palette.text.secondary,
                              p: 0.5,
                              '&:hover': {
                                color: theme.palette.error.main,
                                backgroundColor: theme.palette.error.light + '20',
                              }
                            }}
                          >
                            <IconX size={14} />
                          </IconButton>
                        </Box>
                        {!notification.read && (
                          <Box
                            sx={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              width: 6,
                              height: 6,
                              borderRadius: '50%',
                              backgroundColor: getSeverityColor(notification.priority),
                            }}
                          />
                        )}
                      </Box>
                    ))}
                  </Stack>

                  {notifications.length > 3 && (
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: theme.palette.text.disabled,
                        display: 'block',
                        textAlign: 'center',
                        mt: 1
                      }}
                    >
                      +{notifications.length - 3} more notification{notifications.length - 3 !== 1 ? 's' : ''}
                    </Typography>
                  )}
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Standalone Notifications Card - Show when welcome card is dismissed */}
      {!isWelcomeVisible && renderNotifications()}
    </>
  );
};

export default WelcomeCard;
