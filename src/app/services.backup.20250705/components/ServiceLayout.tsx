import { Box, Button, Container, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useRouter } from 'next/navigation';

interface ServiceLayoutProps {
  title: string;
  children: React.ReactNode;
}

const ServiceLayout = ({ title, children }: ServiceLayoutProps) => {
  const router = useRouter();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundImage: 'url(/images/backgrounds/new-login-bg.jpeg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        py: 4,
      }}
    >
      <Container maxWidth="lg">
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push('/auth/login')}
          sx={{
            mb: 4,
            backgroundColor: 'white',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              transform: 'scale(1.05)',
              transition: 'all 0.3s ease-in-out'
            },
          }}
        >
          Back to Login
        </Button>

        <Box
          sx={{
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            p: 4,
          }}
        >
          <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
            {title}
          </Typography>
          {children}
        </Box>
      </Container>
    </Box>
  );
};

export default ServiceLayout; 