'use client';

import { usePathname } from 'next/navigation';
import { useState } from 'react';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import Tooltip from '@mui/material/Tooltip';
import useMediaQuery from '@mui/material/useMediaQuery';

import Menuitems from './MenuItems';
import NavItem from './NavItem';
import NavCollapse from './NavCollapse';
import NavGroup from './NavGroup/NavGroup';

import { useDispatch, useSelector } from '@/store/hooks';
import { AppState } from '@/store/store';
import { toggleMobileSidebar } from '@/store/customizer/CustomizerSlice';
import { useAuthStore } from '@/store';
import { getUserRoleDisplay } from '@/app/(DashboardLayout)/utilities/helpers/user.helper';

const SidebarItems = () => {
  const pathname = usePathname();
  const pathDirect = pathname;
  const pathWithoutLastPart = pathname.slice(0, pathname.lastIndexOf('/'));
  const customizer = useSelector((state: AppState) => state.customizer);
  const lgUp = useMediaQuery((theme: any) => theme.breakpoints.up('lg'));
  const hideMenu: any = lgUp ? customizer.isCollapse && !customizer.isSidebarHover : '';
  const dispatch = useDispatch();

  const { user, isAuthenticated } = useAuthStore();
  const userRoleDisplay = getUserRoleDisplay(user);
  const userRoles = userRoleDisplay ? userRoleDisplay.split(',').map(role => role.trim()) : [];

  if (!isAuthenticated) return null;

  return (
    <Box sx={{ px: 3 }}>
      <List sx={{ pt: 0 }} className="sidebarNav">
        {Menuitems.map((item: any) => {
          const allowed = item.allowedRoles?.some((role: string) => userRoles.includes(role));
          if (!allowed) return null;

          if (item.subheader) {
            return (
              <Tooltip title={item.description || ''} placement="right" arrow key={item.subheader}>
                <div>
                  <NavGroup item={item} hideMenu={hideMenu} />
                </div>
              </Tooltip>
            );
          } else if (item.children) {
            return (
              <Tooltip title={item.description || ''} placement="right" arrow key={item.id}>
                <div>
                  <NavCollapse
                    menu={item}
                    pathDirect={pathDirect}
                    hideMenu={hideMenu}
                    pathWithoutLastPart={pathWithoutLastPart}
                    level={1}
                    onClick={() => dispatch(toggleMobileSidebar())}
                  />
                </div>
              </Tooltip>
            );
          } else {
            return (
              <Tooltip title={item.description || ''} placement="right" arrow key={item.id}>
                <div>
                  <NavItem
                    item={item}
                    key={item.id}
                    pathDirect={pathDirect}
                    hideMenu={hideMenu}
                    onClick={() => dispatch(toggleMobileSidebar())}
                  />
                </div>
              </Tooltip>
            );
          }
        })}
      </List>
    </Box>
  );
};

export default SidebarItems;
