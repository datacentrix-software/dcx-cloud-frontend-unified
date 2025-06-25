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
} from "@mui/material";
import { useAuthStore } from '@/store';
import axios from "axios";

const WelcomeCard = () => {
  const { user: authUser, token } = useAuthStore();
  const userName = authUser ? `${authUser.firstName}` : "";
  const theme = useTheme();
  const [vcenterOrgId, setVcenterOrgId] = useState<number | null>(null);
  const isNewCustomer = !vcenterOrgId;

  useEffect(() => {
    const fetchOrganizationData = async () => {
      if (!authUser?.userOrganisations[0]?.organisation.id || !token) return;
      
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BACK_END_BASEURL}/api/organisations/getorg`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { id: authUser?.userOrganisations[0]?.organisation.id }
        });
        
        if (response.data) {
          setVcenterOrgId(response.data.vcenterOrg_id);
        }
      } catch (error) {
        console.error('Error fetching organization data:', error);
      }
    };

    fetchOrganizationData();
  }, [authUser?.userOrganisations[0]?.organisation.id, token]);

  return (
    <Card
      sx={{ 
        background: theme.palette.background.paper,
        position: 'relative',
        overflow: 'hidden',
        boxShadow: theme.shadows[2],
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
      <CardContent sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* <Box 
            sx={{ 
              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
              borderRadius: '50%',
              p: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <IconUser 
              size={32} 
              color={theme.palette.mode === 'dark' ? 'white' : theme.palette.text.primary} 
            />
          </Box> */}
          <Box>
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
        </Box>
      </CardContent>
    </Card>
  );
};

export default WelcomeCard;
