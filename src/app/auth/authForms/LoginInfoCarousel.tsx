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
  paddingLeft: 'clamp(2rem, 5vw, 4rem)',
  paddingRight: 'clamp(2rem, 5vw, 4rem)',
}));

const SlideContainer = styled(Box)({
  width: '100%',
  height: 'auto',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  alignItems: 'flex-start',
  textAlign: 'left',
  padding: '4px',
  paddingLeft: 'clamp(1rem, 3vw, 2rem)',
  position: 'relative',
});

const LoginInfoCarousel = () => {
  return (
    <CarouselContainer>
      <SlideContainer>
        <Typography
          variant="h3"
          fontWeight="bold"
          gutterBottom
          sx={{
            fontSize: 'clamp(2.5rem, 3.5vw, 2.3rem)',
            lineHeight: 1.2,
            mb: 0.5,
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
            fontSize: 'clamp(1.3rem, 1.8vw, 1.1rem)',
            marginBottom: 0,
            marginBlockEnd: 0,
            lineHeight: 1.8,
            opacity: 0.95,
            maxWidth: 'clamp(300px, 85%, 600px)',
            mb: 'clamp(1rem, 3vw, 4rem)',
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