"use client";
import React from "react";
import { useTheme } from "@mui/material/styles";
import { Card, CardHeader, CardContent, Divider, Box, Typography, SxProps, Theme } from "@mui/material";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";

interface Props {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  action?: React.ReactNode;
  id?: string;
  sx?: SxProps<Theme>;
}

const ParentCard = ({ title, subtitle, children, action, id, sx }: Props) => {
  const customizer = useSelector((state: AppState) => state.customizer);

  const theme = useTheme();
  const borderColor = theme.palette.divider;

  return (
    <Card
      id={id} 
      sx={{
        p: 0, 
        mb: 4,
        border: !customizer.isCardShadow ? `1px solid ${borderColor}` : "none",
        ...sx 
      }}
      elevation={customizer.isCardShadow ? 9 : 0}
      variant={!customizer.isCardShadow ? "outlined" : undefined}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            {typeof title === 'string' ? (
              <Typography variant="h5">{title}</Typography>
            ) : (
              title
            )}
            {subtitle && (
              <Typography variant="subtitle2" color="textSecondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          {action && <Box>{action}</Box>}
        </Box>
        {children}
      </CardContent>
    </Card>
  );
};

export default ParentCard;
