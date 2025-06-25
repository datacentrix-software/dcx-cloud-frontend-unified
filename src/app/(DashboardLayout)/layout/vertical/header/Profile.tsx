import React, { useState } from 'react';
import Link from 'next/link';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import Typography from '@mui/material/Typography';
import * as dropdownData from './data';

import { IconMail, IconBriefcase, IconBuilding } from '@tabler/icons-react';
import { Stack } from '@mui/system';
import { useAuthStore } from '@/store';
import { getUserInitials } from '@/app/(DashboardLayout)/utilities/helpers/user.helper';
import { IUser } from '@/types/IUser';
import { useRouter } from 'next/navigation';

const Profile = () => {
  const router = useRouter();
  const [anchorEl2, setAnchorEl2] = useState(null);
  const handleClick2 = (event: any) => {
    setAnchorEl2(event.currentTarget);
  };
  const handleClose2 = () => {
    setAnchorEl2(null);
  };

  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    handleClose2();

    // Clear session storage items related to banner dismissals
    sessionStorage.removeItem('paymentBannerDismissed');
    sessionStorage.removeItem('lastPaymentBannerUserId');
    sessionStorage.removeItem('welcomeCardDismissed');
    sessionStorage.removeItem('lastUserId');
    sessionStorage.removeItem('vmWelcomeCardDismissed');
    sessionStorage.removeItem('lastVmWelcomeCardUserId');

    setTimeout(() => {
      router.push('/auth/login');
      logout();
    }, 1500);
  }

  return (
    <Box>
      <IconButton
        size="large"
        aria-label="show 11 new notifications"
        color="inherit"
        aria-controls="msgs-menu"
        aria-haspopup="true"
        sx={{
          ...(typeof anchorEl2 === 'object' && {
            color: 'primary.main',
          }),
        }}
        onClick={handleClick2}
      >
        <Avatar
          sx={{
            width: 35,
            height: 35,
            bgcolor: 'primary.main',
            color: 'white',
            fontWeight: 700,
            fontSize: 16,
          }}
        >
          {getUserInitials(user as IUser)}
        </Avatar>
      </IconButton>
      {/* ------------------------------------------- */}
      {/* Message Dropdown */}
      {/* ------------------------------------------- */}
      <Menu
        id="msgs-menu"
        anchorEl={anchorEl2}
        keepMounted
        open={Boolean(anchorEl2)}
        onClose={handleClose2}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        sx={{
          '& .MuiMenu-paper': {
            width: '360px',
            p: 4,
          },
        }}
      >
        <Typography variant="h5">User Profile</Typography>
        <Stack direction="column" py={3} spacing={1} alignItems="flex-start">
          <Typography variant="subtitle2" color="textPrimary" fontWeight={600}>
            {user?.firstName} {user?.lastName}
          </Typography>
          <Typography variant="subtitle2" color="textSecondary" display="flex" alignItems="center" gap={1}>
            <IconBriefcase width={15} height={15} />
            {user?.userRoles.map(({ role }) => role.name).join(' | ')}
          </Typography>
          <Typography variant="subtitle2" color="textSecondary" display="flex" alignItems="center" gap={1}>
            <IconBuilding width={15} height={15} />
            {user?.userOrganisations?.map(({ organisation }) => organisation.organisation_name).join(' | ')}
          </Typography>
          <Typography
            variant="subtitle2"
            color="textSecondary"
            display="flex"
            alignItems="center"
            gap={1}
          >
            <IconMail width={15} height={15} />
            {user?.email}
          </Typography>
        </Stack>
        <Divider />
        {dropdownData.profile.map((profile) => (
          <Box key={profile.title}>
            <Box sx={{ py: 2, px: 0 }} className="hover-text-primary">
              <Link href={profile.href}>
                <Stack direction="row" spacing={2}>
                  <Box>
                    <Typography
                      variant="subtitle2"
                      fontWeight={600}
                      color="textPrimary"
                      className="text-hover"
                      noWrap
                      sx={{
                        width: '240px',
                      }}
                    >
                      {profile.title}
                    </Typography>
                    <Typography
                      color="textSecondary"
                      variant="subtitle2"
                      sx={{
                        width: '240px',
                      }}
                      noWrap
                    >
                      {profile.subtitle}
                    </Typography>
                  </Box>
                </Stack>
              </Link>
            </Box>
          </Box>
        ))}
        <Box mt={2}>

          <Button
            href="/auth/login"
            variant="outlined"
            color="primary"
            component={Link}
            fullWidth
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Box>
      </Menu>
    </Box>
  );
};

export default Profile;
