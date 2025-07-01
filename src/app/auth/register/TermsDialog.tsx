import { Dialog, DialogTitle, DialogContent, Box, Typography, DialogActions, Button } from "@mui/material";

type Props = {
    showTerms: boolean;
    setShowTerms: React.Dispatch<React.SetStateAction<boolean>>;
}

const TermsDialog = ({ showTerms, setShowTerms }: Props) => {
    return (
        <Dialog
            open={showTerms}
            onClose={() => setShowTerms(false)}
            maxWidth="md"
            fullWidth
        >
            <DialogTitle>Terms and Conditions</DialogTitle>
            <DialogContent>
                <Box sx={{ p: 2 }}>
                    <Typography variant="body1" paragraph>
                        Please read these terms and conditions carefully before using our service.
                    </Typography>
                    <Typography variant="body1" paragraph>
                        1. By accessing and using this service, you accept and agree to be bound by the terms and provision of this agreement.
                    </Typography>
                    <Typography variant="body1" paragraph>
                        2. All content included on this site is the property of our company or its content suppliers and protected by international copyright laws.
                    </Typography>
                    <Typography variant="body1" paragraph>
                        3. We reserve the right to modify these terms at any time. We do so by posting modified terms on this website.
                    </Typography>
                    <Typography variant="body1" paragraph>
                        4. Your use of the service is at your sole risk. The service is provided on an &quotas is&quot and &quotas available&quot basis.
                    </Typography>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button
                    variant="contained"
                    onClick={() => setShowTerms(false)}
                >
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default TermsDialog
