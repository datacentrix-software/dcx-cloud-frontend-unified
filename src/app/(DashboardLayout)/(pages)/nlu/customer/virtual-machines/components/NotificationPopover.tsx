'use client';

import {
  Alert,
  Badge,
  Divider,
  IconButton,
  Popover,
  Typography,
  Box,
  Stack,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CloseIcon from '@mui/icons-material/Close';
import { useState } from 'react';
import dayjs from 'dayjs';

interface AlertItem {
  id: number;
  message: string;
  type: 'critical' | 'warning';
  dismissed: boolean;
  createdAt: string;
}

interface Props {
  alerts: AlertItem[];
  onDismiss?: (id: number) => void;
}

export default function NotificationPopover({ alerts, onDismiss }: Props) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const visibleAlerts = alerts.filter((a) => !a.dismissed);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'notification-popover' : undefined;

  return (
    <>
      <IconButton
        color="inherit"
        aria-describedby={id}
        onClick={handleClick}
        aria-label="notifications"
      >
        <Badge badgeContent={visibleAlerts.length} color="info">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            width: 380,
            maxHeight: 360,
            overflowY: 'auto',
            p: 2,
            bgcolor: '#fafafa',
          },
        }}
      >
        <Typography variant="subtitle2" fontWeight={600} gutterBottom>
          Notifications
        </Typography>
        <Divider sx={{ mb: 1 }} />
        {visibleAlerts.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No new alerts.
          </Typography>
        ) : (
          <Stack spacing={2}>
            {visibleAlerts.map((alert) => (
              <Alert
                key={alert.id}
                severity={alert.type === 'critical' ? 'error' : 'warning'}
                variant="filled"
                sx={{
                  alignItems: 'flex-start',
                  p: 2,
                  backgroundColor: alert.type === 'critical' ? '#d32f2f' : '#ed6c02',
                  color: '#fff',
                  borderRadius: 2,
                }}
                action={
                  <IconButton
                    size="small"
                    onClick={() => onDismiss?.(alert.id)}
                    sx={{ color: '#fff' }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                }
              >
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {alert.message}
                </Typography>
                <Typography variant="caption" sx={{ mt: 0.5, opacity: 0.8 }}>
                  {dayjs(alert.createdAt).format('MMM D, YYYY • h:mm A')}
                </Typography>
              </Alert>
            ))}
          </Stack>
        )}
      </Popover>
    </>
  );
}
