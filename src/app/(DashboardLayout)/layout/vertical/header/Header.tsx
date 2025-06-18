import React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import useMediaQuery from '@mui/material/useMediaQuery';
import { styled } from '@mui/material/styles';
import { useSelector, useDispatch } from '@/store/hooks';
import { IconMenu2, IconMoon, IconSun } from '@tabler/icons-react';
import Notifications from './Notification';
import Profile from './Profile';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Menuitems from '../sidebar/MenuItems';
import Link from 'next/link';

import { AppState } from '@/store/store';

const Header = () => {
  const lgUp = useMediaQuery((theme: any) => theme.breakpoints.up('lg'));
  const lgDown = useMediaQuery((theme: any) => theme.breakpoints.down('lg'));

  // drawer
  const customizer = useSelector((state: AppState) => state.customizer);
  const dispatch = useDispatch();

  const AppBarStyled = styled(AppBar)(({ theme }) => ({
    boxShadow: 'none',
    background: theme.palette.background.paper,
    justifyContent: 'center',
    backdropFilter: 'blur(4px)',
    borderBottom: '1px solid #e0e0e0',
    [theme.breakpoints.up('lg')]: {
      minHeight: customizer.TopbarHeight,
    },
  }));
  const ToolbarStyled = styled(Toolbar)(({ theme }) => ({
    width: '100%',
    color: theme.palette.text.secondary,
  }));

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBarStyled position="sticky" color="default">
      <ToolbarStyled>

        <Box flexGrow={1} />
        <Stack spacing={1} direction="row" alignItems="center">
          
          
           {/* ------------------------------------------- */}
          {/* Chand- Light and dark mode toggle */}
          {/* ------------------------------------------- */}

          {/* <IconButton size="large" color="inherit">
            {customizer.activeMode === "light" ? (
              <IconMoon
                size="21"
                stroke="1.5"
                onClick={() => dispatch(setDarkMode("dark"))}
              />
            ) : (
              <IconSun
                size="21"
                stroke="1.5"
                onClick={() => dispatch(setDarkMode("light"))}
              />
            )}
          </IconButton> */}

          {/* ------------------------------------------- */}
          {/* Toggle Right Sidebar for mobile */}
          {/* ------------------------------------------- */}
          {/* {lgDown ? <MobileRightSidebar /> : null} */}
          {/* Burger menu for mobile */}
          {lgDown && (
            <>
              <IconButton
                size="large"
                color="inherit"
                aria-label="open menu"
                onClick={handleMenuOpen}
              >
                <IconMenu2 />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                TransitionProps={{ timeout: 300 }}
              >
                {Menuitems.filter(item => typeof item.href === 'string' && !!item.href).map((item) => (
                  <Link href={item.href as string} passHref legacyBehavior key={item.id}>
                    <MenuItem component="a" onClick={handleMenuClose}>
                      {item.title}
                    </MenuItem>
                  </Link>
                ))}
              </Menu>
            </>
          )}
          <Notifications />

          <Profile />
        </Stack>
      </ToolbarStyled>
    </AppBarStyled>
  );
};

export default Header;

