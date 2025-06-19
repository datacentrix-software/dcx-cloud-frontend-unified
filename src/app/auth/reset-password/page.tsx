'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import PasswordReset from '@/app/auth/authForms/PasswordReset';
import AuthDialogs from '@/app/auth/authForms/AuthDialogs';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const [openErrorDialog, setOpenErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [openSuccessDialog, setOpenSuccessDialog] = useState(false);

  return (
    <>
      <PasswordReset
        email={email}
        onError={(msg) => {
          setErrorMessage(msg);
          setOpenErrorDialog(true);
        }}
        onSuccess={() => {
          setOpenSuccessDialog(true);
          setTimeout(() => router.push('/auth/login'), 2000);
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
        userName=""
      />
    </>
  );
}
