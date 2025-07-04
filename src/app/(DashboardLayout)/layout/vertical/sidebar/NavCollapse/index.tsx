import React from 'react';

import { useState } from 'react';
import { useSelector } from '@/store/hooks';
import { usePathname } from "next/navigation";

// mui imports
import Collapse from '@mui/material/Collapse';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { styled, useTheme } from '@mui/material/styles';

// custom imports
import NavItem from '../NavItem';

// plugins
import { ExpandMore, ExpandLess } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { AppState } from '@/store/store';
import { isNull } from "lodash";

type NavGroupProps = {
  [x: string]: any;
  navlabel?: boolean;
  subheader?: string;
  title?: string;
  icon?: any;
  href?: any;
};

interface NavCollapseProps {
  menu: NavGroupProps;
  level: number;
  pathWithoutLastPart: any;
  pathDirect: any;
  hideMenu: any;
  onClick: (event: React.MouseEvent<HTMLElement>) => void;
}

// FC Component For Dropdown Menu
export default  function NavCollapse ({
  menu,
  level,
  pathWithoutLastPart,
  pathDirect,
  hideMenu,
  onClick
}: NavCollapseProps)  {
  const lgDown = useMediaQuery((theme: Theme) => theme.breakpoints.down("lg"));
  const customizer = useSelector((state: AppState) => state.customizer);
  const Icon = menu?.icon;
  const theme = useTheme();
  const pathname  = usePathname();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const menuIcon =
    level > 1 ? <Icon stroke={1.5} sx={{ fontSize: "1rem" }} /> : <Icon stroke={1.5} size="1.3rem" />;

  const handleClick = () => {
    setOpen(!open);
  };

  // Improved path matching logic for determining if menu should be open
  const shouldBeOpen = React.useMemo(() => {
    if (!menu?.children) return false;
    
    return menu.children.some((item: any) => {
      if (!item?.href || !pathname) return false;
      
      // Normalize paths by removing trailing slashes
      const normalizedPath = pathname.replace(/\/$/, '');
      const normalizedHref = item.href.replace(/\/$/, '');
      
      // Exact match
      if (normalizedPath === normalizedHref) return true;
      
      // For nested routes, check if current path starts with the menu href
      if (normalizedHref !== '/' && normalizedPath.startsWith(normalizedHref)) {
        const nextChar = normalizedPath.charAt(normalizedHref.length);
        return nextChar === '' || nextChar === '/';
      }
      
      return false;
    });
  }, [menu?.children, pathname]);

  // menu collapse for sub-levels
  React.useEffect(() => {
    setOpen(shouldBeOpen);
  }, [shouldBeOpen]);

  // Improved path matching for menu selection
  const isMenuActive = React.useMemo(() => {
    if (!menu?.href || !pathWithoutLastPart) return false;
    
    // Normalize paths by removing trailing slashes
    const normalizedPath = pathWithoutLastPart.replace(/\/$/, '');
    const normalizedHref = menu.href.replace(/\/$/, '');
    
    // Exact match
    if (normalizedPath === normalizedHref) return true;
    
    // For nested routes, check if current path starts with the menu href
    if (normalizedHref !== '/' && normalizedPath.startsWith(normalizedHref)) {
      const nextChar = normalizedPath.charAt(normalizedHref.length);
      return nextChar === '' || nextChar === '/';
    }
    
    return false;
  }, [menu?.href, pathWithoutLastPart]);

  const ListItemStyled = styled(ListItemButton)(() => ({
    marginBottom: '2px',
    padding: '8px 10px',
    paddingLeft: hideMenu ? '10px' : level > 2 ? `${level * 15}px` : '10px',
    backgroundColor: (open || isMenuActive) && level < 2 ? 'rgba(255, 255, 255, 0.2)' : '',
    whiteSpace: 'nowrap',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      color: 'white',
    },
    '&.Mui-selected': {
      color: 'white',
      backgroundColor: 'rgba(255, 255, 255, 0.25)',
      borderLeft: '3px solid #fff',
      fontWeight: '600',
      '&:hover': {
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
        color: 'white',
      },
    },
    color: 'white',
    borderRadius: `${customizer.borderRadius}px`,
  }))

  // If Menu has Children
  const submenus = menu.children?.map((item: any) => {
    if (item.children) {
      return (
        <NavCollapse
          key={item?.id}
          menu={item}
          level={level + 1}
          pathWithoutLastPart={pathWithoutLastPart}
          pathDirect={pathDirect}
          hideMenu={hideMenu}
          onClick={onClick}
        />
      );
    } else {
      return (
        <NavItem
          key={item.id}
          item={item}
          level={level + 1}
          pathDirect={pathDirect}
          hideMenu={hideMenu}
          onClick={lgDown ? onClick : isNull}
        />
      );
    }
  });

  return (
    <>
      <ListItemStyled
        onClick={handleClick}
        selected={isMenuActive}
        key={menu?.id}
      >
        <ListItemIcon
          sx={{
            minWidth: '36px',
            p: '3px 0',
            color: isMenuActive ? '#fff' : 'inherit',
          }}
        >
          {menuIcon}
        </ListItemIcon>
        <ListItemText color="inherit">{hideMenu ? '' : <>{t(`${menu.title}`)}</>}</ListItemText>
        {!open ? <ExpandMore sx={{ fontSize: "1rem" }} /> : <ExpandLess sx={{ fontSize: "1rem" }} />}
      </ListItemStyled>
      <Collapse in={open} timeout="auto">
        {submenus}
      </Collapse>
    </>
  );
};


