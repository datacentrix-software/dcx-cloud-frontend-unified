import { Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

const CarouselContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  overflow: 'visible',
  padding: theme.spacing(1),
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  alignItems: 'flex-start',
  paddingLeft: { xs: theme.spacing(2), sm: 'clamp(2rem, 5vw, 4rem)' },
  paddingRight: { xs: theme.spacing(2), sm: 'clamp(2rem, 5vw, 4rem)' },
  [theme.breakpoints.down('sm')]: {
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
  }
}));

const SlideContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  height: 'auto',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  alignItems: 'flex-start',
  textAlign: 'left',
  padding: '4px',
  paddingLeft: { xs: 0, sm: 'clamp(1rem, 3vw, 2rem)' },
  position: 'relative',
  [theme.breakpoints.down('sm')]: {
    paddingLeft: 0,
  }
}));

const LoginInfoCarousel = () => {
  return (
    <CarouselContainer>
      <SlideContainer>
        <Typography
          variant="h3"
          fontWeight="bold"
          gutterBottom
          sx={{
            fontSize: { xs: '2rem', sm: '2.3rem', md: 'clamp(2.5rem, 3.5vw, 2.3rem)' },
            lineHeight: 1.2,
            mb: { xs: 1, sm: 0.5 },
            maxWidth: 'clamp(300px, 85%, 600px)',
            color: '#000000',
            textAlign: 'left'
          }}
        >
          The cloud that keeps up with your business.
        </Typography>
        <Typography
          variant="body1"
          sx={{
            fontSize: { xs: '1rem', sm: '1.1rem', md: 'clamp(1.3rem, 1.8vw, 1.1rem)' },
            marginBottom: 0,
            marginBlockEnd: 0,
            lineHeight: 1.6,
            opacity: 0.95,
            maxWidth: 'clamp(300px, 85%, 600px)',
            mb: { xs: 2, sm: 3, md: 'clamp(1rem, 3vw, 4rem)' },
            color: '#000000',
            whiteSpace: 'normal',
            wordWrap: 'break-word',
            textAlign: 'left'
          }}
        >
          Launch fast. Scale freely. No delays, no surprises, just full control with local support when you need it.
        </Typography>
      </SlideContainer>
    </CarouselContainer>
  );
};

export default LoginInfoCarousel;