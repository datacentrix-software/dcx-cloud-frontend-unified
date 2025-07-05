'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import OtpVerification from '@/app/auth/authForms/OtpVerification';
import AuthDialogs from '@/app/auth/authForms/AuthDialogs';

export default function VerifyOtpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const [openErrorDialog, setOpenErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [openSuccessDialog, setOpenSuccessDialog] = useState(false);
  const [userName, setUserName] = useState('');

  return (
    <>
      <OtpVerification
        email={email}
        onStepChange={() => {}}
        onError={(msg) => {
          setErrorMessage(msg);
          setOpenErrorDialog(true);
        }}
        onSuccess={(name) => {
          setUserName(name);
          setOpenSuccessDialog(true);
          setTimeout(() => {
            router.push('/');
          }, 2000);
        }}
      />

      <AuthDialogs
        openErrorDialog={openErrorDialog}
        errorMessage={errorMessage}
        onCloseError={() => {
          setOpenErrorDialog(false);
          setErrorMessage('');
        }}
        openSuccessDialog={openSuccessDialog}
        userName={userName}
      />
    </>
  );
}
