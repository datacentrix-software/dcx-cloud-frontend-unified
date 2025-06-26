import { Card } from '@mui/material';
import { useSelector } from '@/store/hooks';
import { AppState } from '@/store/store';
import React from 'react';

type Props = {
  children: React.ReactNode;
};

const AppCard = ({ children }: Props) => {
  const customizer = useSelector((state: AppState) => state.customizer);

  return (
    <Card
      sx={{ display: 'flex', p: 0 }}
      elevation={customizer.isCardShadow ? 9 : 0}
      variant={customizer.isCardShadow ? undefined : 'outlined'}
    >
      {children}
    </Card>
  );
};

export default AppCard;
