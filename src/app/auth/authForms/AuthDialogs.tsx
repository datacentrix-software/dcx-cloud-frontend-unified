import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  Button,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

interface AuthDialogsProps {
  openSuccessDialog: boolean;
  openErrorDialog: boolean;
  errorMessage: string;
  userName?: string;
  onCloseError: () => void;
}

const AuthDialogs = ({
  openSuccessDialog,
  openErrorDialog,
  errorMessage,
  userName,
  onCloseError,
}: AuthDialogsProps) => {
  return (
    <>
      {/* Success Dialog */}
      <Dialog 
        open={openSuccessDialog}
        PaperProps={{
          sx: {
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            padding: 3,
            minWidth: '300px',
            border: '1px solid rgba(0, 123, 255, 0.2)'
          }
        }}
      >
        <DialogContent>
          <Box textAlign="center">
            <Box sx={{ 
              color: 'success.main',
              mb: 2,
              '& svg': {
                fontSize: '48px'
              }
            }}>
              <CheckCircleOutlineIcon />
            </Box>
            <Typography variant="h5" fontWeight="bold" gutterBottom color="success.main">
              Login Successful!
            </Typography>
            <Typography variant="body1" color="text.primary" sx={{ mb: 1 }}>
              Welcome back, {userName}!
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Redirecting...
            </Typography>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Error Dialog */}
      <Dialog 
        open={openErrorDialog}
        onClose={onCloseError}
        PaperProps={{
          sx: {
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            padding: 3,
            minWidth: '300px',
            border: '1px solid rgba(211, 47, 47, 0.2)'
          }
        }}
      >
        <DialogContent>
          <Box textAlign="center">
            <Box sx={{ 
              color: 'error.main',
              mb: 2,
              '& svg': {
                fontSize: '48px'
              }
            }}>
              <ErrorOutlineIcon />
            </Box>
            <Typography variant="h5" fontWeight="bold" gutterBottom color="error.main">
              Error
            </Typography>
            <Typography variant="body1" color="text.primary" sx={{ mb: 2 }}>
              {errorMessage}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={onCloseError}
              sx={{
                minWidth: '120px',
                transition: '0.3s',
                '&:hover': {
                  transform: 'scale(1.05)',
                  boxShadow: '0 4px 12px rgba(0, 123, 255, 0.3)'
                }
              }}
            >
              OK
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AuthDialogs; 