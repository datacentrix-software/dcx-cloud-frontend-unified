'use client';

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Alert,
  CircularProgress,
  Stack,
  Divider,
  Chip
} from '@mui/material';
import axiosServices from '@/utils/axios';

interface TestResult {
  success: boolean;
  message?: string;
  data?: any;
  error?: string;
  details?: any;
}

const EmailTestPage = () => {
  const [configResult, setConfigResult] = useState<TestResult | null>(null);
  const [otpResult, setOtpResult] = useState<TestResult | null>(null);
  const [testEmail, setTestEmail] = useState('test@datacentrix.co.za');
  const [isTestingConfig, setIsTestingConfig] = useState(false);
  const [isTestingOTP, setIsTestingOTP] = useState(false);

  const testEmailConfiguration = async () => {
    setIsTestingConfig(true);
    setConfigResult(null);
    
    try {
      const response = await axiosServices.get('/api/test/email/config');
      setConfigResult(response.data);
    } catch (error: any) {
      setConfigResult({
        success: false,
        error: error.response?.data?.error || error.message,
        details: error.response?.data?.details
      });
    } finally {
      setIsTestingConfig(false);
    }
  };

  const testOTPEmail = async () => {
    if (!testEmail) {
      alert('Please enter an email address');
      return;
    }

    setIsTestingOTP(true);
    setOtpResult(null);
    
    try {
      const response = await axiosServices.post('/api/test/email/otp', {
        email: testEmail,
        testMode: true
      });
      setOtpResult(response.data);
    } catch (error: any) {
      setOtpResult({
        success: false,
        error: error.response?.data?.error || error.message,
        details: error.response?.data?.details
      });
    } finally {
      setIsTestingOTP(false);
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        📧 Email System Test Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom>
        Test the Mimecast email configuration and OTP delivery system
      </Typography>

      <Stack spacing={3} mt={3}>
        {/* Email Configuration Test */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              🔧 Email Configuration Test
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Test the connection to Mimecast SMTP servers
            </Typography>
            
            <Box mt={2}>
              <Button
                variant="contained"
                onClick={testEmailConfiguration}
                disabled={isTestingConfig}
                startIcon={isTestingConfig ? <CircularProgress size={20} /> : null}
              >
                {isTestingConfig ? 'Testing...' : 'Test Email Configuration'}
              </Button>
            </Box>

            {configResult && (
              <Box mt={2}>
                <Alert severity={configResult.success ? 'success' : 'error'}>
                  <Typography variant="subtitle2">
                    {configResult.success ? '✅ Configuration Test Passed' : '❌ Configuration Test Failed'}
                  </Typography>
                  {configResult.success && configResult.data && (
                    <Box mt={1}>
                      <Typography variant="body2">
                        <strong>Host:</strong> {configResult.data.host}<br/>
                        <strong>Port:</strong> {configResult.data.port}<br/>
                        <strong>Admin User:</strong> {configResult.data.adminUser}<br/>
                        <strong>OTP User:</strong> {configResult.data.otpUser}
                      </Typography>
                    </Box>
                  )}
                  {!configResult.success && (
                    <Typography variant="body2" color="error">
                      {configResult.error}
                      {configResult.details && <><br/>Details: {configResult.details}</>}
                    </Typography>
                  )}
                </Alert>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* OTP Email Test */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              📬 OTP Email Delivery Test
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Send a test OTP email to verify delivery is working
            </Typography>
            
            <Stack spacing={2} mt={2}>
              <TextField
                label="Test Email Address"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                fullWidth
                type="email"
                helperText="Enter the email address to send the test OTP to"
              />
              
              <Box>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={testOTPEmail}
                  disabled={isTestingOTP || !testEmail}
                  startIcon={isTestingOTP ? <CircularProgress size={20} /> : null}
                >
                  {isTestingOTP ? 'Sending...' : 'Send Test OTP Email'}
                </Button>
              </Box>
            </Stack>

            {otpResult && (
              <Box mt={2}>
                <Alert severity={otpResult.success ? 'success' : 'error'}>
                  <Typography variant="subtitle2">
                    {otpResult.success ? '✅ Test OTP Email Sent' : '❌ OTP Email Failed'}
                  </Typography>
                  {otpResult.success && otpResult.data && (
                    <Box mt={1}>
                      <Typography variant="body2">
                        <strong>Recipient:</strong> {otpResult.data.recipient}<br/>
                        <strong>Message ID:</strong> {otpResult.data.messageId}<br/>
                        <strong>Send Duration:</strong> {otpResult.data.duration}ms<br/>
                        <strong>Test OTP:</strong> <Chip label={otpResult.data.testOTP} color="primary" size="small" />
                      </Typography>
                    </Box>
                  )}
                  {!otpResult.success && (
                    <Typography variant="body2" color="error">
                      {otpResult.error}
                      {otpResult.details && <><br/>Details: {otpResult.details}</>}
                    </Typography>
                  )}
                </Alert>
              </Box>
            )}
          </CardContent>
        </Card>

        <Divider />

        {/* Instructions */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              📋 Test Instructions
            </Typography>
            <Stack spacing={1}>
              <Typography variant="body2">
                1. <strong>Test Configuration:</strong> Verify SMTP connection to Mimecast servers
              </Typography>
              <Typography variant="body2">
                2. <strong>Send Test Email:</strong> Send an actual OTP email to verify delivery
              </Typography>
              <Typography variant="body2">
                3. <strong>Check Inbox:</strong> Verify the email arrives in the recipient's inbox
              </Typography>
              <Typography variant="body2">
                4. <strong>Check Spam:</strong> If not in inbox, check spam/junk folder
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
};

export default EmailTestPage;