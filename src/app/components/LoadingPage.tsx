import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Logo from '@/app/(DashboardLayout)/layout/shared/logo/Logo';

interface LoadingPageProps {
  title?: string;
  subtitle?: string;
  showLogo?: boolean;
}

const LoadingPage = ({ 
  title = "Datacentrix Cloud", 
  subtitle = "brought to you by",
  showLogo = true 
}: LoadingPageProps) => {
  return (
    <Box display='flex' flexDirection='column' justifyContent='center' alignItems='center' height='100vh' gap={3}>
      <Typography fontSize="2.5rem" fontWeight="bold" color="#015a82">
        {title}
      </Typography>
      <Typography variant="subtitle1" color="text.secondary">
        {subtitle}
      </Typography>
      {showLogo && <Logo />}
      <CircularProgress size={60} thickness={4} sx={{ color: '#015a82' }} />
    </Box>
  );
};

export default LoadingPage; 