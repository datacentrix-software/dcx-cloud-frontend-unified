import { Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

const CarouselContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  height: '100%',
  overflow: 'visible',
  padding: theme.spacing(4),
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  // backgroundImage: 'url(/images/backgrounds/new-login-bg.jpeg)',
  // backgroundSize: 'cover',
  // backgroundPosition: 'center',
  // backgroundRepeat: 'no-repeat',
}));

const SlideContainer = styled(Box)({
  width: '100%',
  height: 'auto',
  minHeight: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'flex-start',
  textAlign: 'left',
  padding: '20px',
  position: 'relative',
});

const InfoCarousel = () => {
  return (
    <CarouselContainer>
      <SlideContainer>
        <Typography 
          variant="h3" 
          fontWeight="bold" 
          gutterBottom
          sx={{
            fontSize: '2.8rem',
            lineHeight: 1.2,
            mb: 1,
            maxWidth: '85%',
            color: '#000000',
            textAlign: 'left'
          }}
        >
          Cloud that just works
        </Typography>
        <Typography 
          variant="body1"
          sx={{
            fontSize: '1.5rem',
            lineHeight: 1.8,
            opacity: 0.95,
            maxWidth: '85%',
            mb: 6,
            color: '#000000',
            whiteSpace: 'normal',
            wordWrap: 'break-word',
            textAlign: 'left'
          }}
        >
          Spin up secure, scalable infrastructure — with local support, simple pricing, and no vendor drama.
        </Typography>
      </SlideContainer>
    </CarouselContainer>
  );
};

export default InfoCarousel; 