import React, { useState, useEffect } from 'react';
import {
  Badge,
  Popover,
  IconButton,
  Typography,
  Box,
  Divider,
  Stack,
  useTheme,
  Chip,
} from '@mui/material';
import { 
  Notifications, 
  Close, 
  Settings, 
  Warning, 
  Info, 
  CheckCircle, 
  Security, 
  AccessTime,
  ExpandMore
} from '@mui/icons-material';
import { useNotificationStore, Notification } from '@/store/useNotificationStore';

const NotificationPopover = () => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [showAllNotifications, setShowAllNotifications] = useState(false);
  
  const { 
    notifications, 
    removeNotification, 
    markAsRead,
    fetchNotifications 
  } = useNotificationStore();

  console.log('NotificationPopover - notifications:', notifications);
  console.log('NotificationPopover - unread count:', notifications.filter(n => !n.read).length);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setShowAllNotifications(false);
  };

  const handleNotificationDismiss = (notificationId: string) => {
    removeNotification(notificationId);
  };

  const [expandedNotifications, setExpandedNotifications] = useState<Set<string>>(new Set());

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      // Toggle expanded state instead of marking as read
      setExpandedNotifications(prev => {
        const newSet = new Set(prev);
        if (newSet.has(notification.id)) {
          newSet.delete(notification.id);
        } else {
          newSet.add(notification.id);
        }
        console.log('Expanded notifications:', Array.from(newSet));
        return newSet;
      });
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    const iconProps = { sx: { fontSize: 16 } };
    switch (type) {
      case 'maintenance':
        return <Settings {...iconProps} />;
      case 'warning':
        return <Warning {...iconProps} />;
      case 'news':
        return <Notifications {...iconProps} />;
      case 'info':
        return <Info {...iconProps} />;
      case 'success':
        return <CheckCircle {...iconProps} />;
      case 'update':
        return <Security {...iconProps} />;
      default:
        return <Info {...iconProps} />;
    }
  };

  const getSeverityColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'critical':
        return '#d32f2f'; // Red
      case 'high':
        return '#ed6c02'; // Amber/Orange
      case 'medium':
      case 'low':
        return '#2e7d32'; // Green
      default:
        return theme.palette.grey[600];
    }
  };

  const getPriorityOrder = (priority: Notification['priority']) => {
    switch (priority) {
      case 'critical':
        return 1;
      case 'high':
        return 2;
      case 'medium':
        return 3;
      case 'low':
        return 4;
      default:
        return 5;
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
  
  // Sort notifications by priority (critical -> high -> medium -> low)
  const sortedNotifications = [...notifications].sort((a, b) => {
    return getPriorityOrder(a.priority) - getPriorityOrder(b.priority);
  });

  const open = Boolean(anchorEl);
  const id = open ? 'notification-popover' : undefined;

  return (
    <>
      <Stack
        direction="column"
        alignItems="center"
        spacing={0.5}
        sx={{ cursor: 'pointer' }}
        onClick={handleClick}
        aria-describedby={id}
        aria-label="notifications"
      >
        <Badge 
          badgeContent={notifications.length} 
          color="error"
          sx={{
            '& .MuiBadge-badge': {
              fontSize: '0.7rem',
              minWidth: 18,
              height: 18,
            }
          }}
        >
          <Notifications sx={{ fontSize: 20 }} />
        </Badge>
        <Typography variant="caption" sx={{ fontSize: '0.7rem', lineHeight: 1 }}>
          Notifications
        </Typography>
      </Stack>

      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            width: 420,
            maxHeight: 500,
            overflowY: 'auto',
            p: 3,
            bgcolor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: theme.shadows[8],
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Notifications sx={{ fontSize: 20 }} color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 600, flex: 1 }}>
            Notifications
          </Typography>
          {unreadNotifications.length > 0 && (
            <Chip 
              label={`${unreadNotifications.length} new of ${notifications.length} total`} 
              color="primary" 
              size="small"
              sx={{ fontSize: '0.7rem' }}
            />
          )}
        </Box>
        
        <Divider sx={{ mb: 2 }} />
        
        {notifications.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            No notifications to display.
          </Typography>
        ) : (
          <Stack spacing={1.5} sx={{ 
            maxHeight: showAllNotifications ? 350 : 200, 
            overflowY: 'auto',
            transition: 'max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}>
            {sortedNotifications.map((notification, index) => (
              <Box
                key={notification.id}
                sx={{
                  p: 1.5,
                  borderRadius: 1,
                  border: `2px solid ${getSeverityColor(notification.priority)}`,
                  backgroundColor: getSeverityColor(notification.priority) + '08',
                  position: 'relative',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  opacity: showAllNotifications || index < 3 ? 1 : 0,
                  transform: showAllNotifications || index < 3 ? 'translateY(0)' : 'translateY(-20px)',
                  height: showAllNotifications || index < 3 ? 'auto' : 0,
                  marginBottom: showAllNotifications || index < 3 ? undefined : 0,
                  padding: showAllNotifications || index < 3 ? 1.5 : 0,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: getSeverityColor(notification.priority) + '12',
                    transform: (showAllNotifications || index < 3) ? 'translateX(2px)' : 'translateY(-20px)',
                  }
                }}
                onClick={() => handleNotificationClick(notification)}
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
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography 
                        variant="subtitle2" 
                        sx={{ 
                          fontWeight: 600,
                          color: theme.palette.text.primary,
                          lineHeight: 1.2,
                          flex: 1
                        }}
                      >
                        {notification.title}
                      </Typography>
                      {!notification.read && !expandedNotifications.has(notification.id) && (
                        <Chip
                          label="New"
                          size="small"
                          sx={{
                            backgroundColor: getSeverityColor(notification.priority),
                            color: 'white',
                            fontSize: '0.6rem',
                            height: 20,
                            fontWeight: 600,
                            ml: 1,
                            '& .MuiChip-label': {
                              px: 1,
                            }
                          }}
                        />
                      )}
                    </Box>
                    {(notification.read || expandedNotifications.has(notification.id)) && (
                      <>
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
                            mt: 0.5,
                            mb: 1
                          }}
                        >
                          <AccessTime sx={{ fontSize: 12 }} />
                          {formatTimestamp(notification.timestamp)}
                        </Typography>
                      </>
                    )}

                    {!notification.read && expandedNotifications.has(notification.id) && (
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1, 
                        mt: 0.5,
                        mb: 1
                      }}>
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            backgroundColor: getSeverityColor(notification.priority),
                            animation: 'pulse 2s infinite',
                            '@keyframes pulse': {
                              '0%': {
                                boxShadow: `0 0 0 0 ${getSeverityColor(notification.priority)}40`,
                              },
                              '70%': {
                                boxShadow: `0 0 0 6px ${getSeverityColor(notification.priority)}00`,
                              },
                              '100%': {
                                boxShadow: `0 0 0 0 ${getSeverityColor(notification.priority)}00`,
                              },
                            },
                          }}
                        />
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: theme.palette.warning.main,
                            fontWeight: 600,
                            fontSize: '0.7rem',
                            textTransform: 'uppercase',
                            letterSpacing: 0.5
                          }}
                        >
                          Still unread
                        </Typography>
                      </Box>
                    )}
                  </Box>
                  <Stack direction="row" spacing={0.5}>
                    {!notification.read && expandedNotifications.has(notification.id) && (
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(notification.id);
                          setExpandedNotifications(prev => {
                            const newSet = new Set(prev);
                            newSet.delete(notification.id);
                            return newSet;
                          });
                        }}
                        size="small"
                        sx={{
                          color: theme.palette.success.main,
                          p: 0.5,
                          '&:hover': {
                            color: theme.palette.success.dark,
                            backgroundColor: theme.palette.success.light + '20',
                          }
                        }}
                      >
                        <CheckCircle sx={{ fontSize: 14 }} />
                      </IconButton>
                    )}
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNotificationDismiss(notification.id);
                      }}
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
                      <Close sx={{ fontSize: 14 }} />
                    </IconButton>
                  </Stack>
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
        )}

        {notifications.length > 3 && (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            mt: 2
          }}>
            <IconButton
              onClick={() => setShowAllNotifications(!showAllNotifications)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                p: 1.5,
                borderRadius: 2,
                backgroundColor: theme.palette.primary.main + '10',
                color: theme.palette.primary.main,
                border: `1px solid ${theme.palette.primary.main + '30'}`,
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: theme.palette.primary.main + '20',
                  transform: 'translateY(-1px)',
                  boxShadow: `0 4px 12px ${theme.palette.primary.main}30`,
                }
              }}
            >
              <Typography 
                variant="caption" 
                sx={{ 
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5
                }}
              >
                {showAllNotifications ? 'Show Less' : `Show All (${notifications.length - 3} more)`}
              </Typography>
              <Box
                sx={{
                  transform: showAllNotifications ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease'
                }}
              >
                <ExpandMore sx={{ fontSize: 16 }} />
              </Box>
            </IconButton>
          </Box>
        )}
      </Popover>
    </>
  );
};

export default NotificationPopover; 