import { useEffect, useState } from 'react';
import axiosServices from '@/utils/axios';
import { useRouter } from 'next/navigation';
import { AxiosError } from 'axios';

export const useRegisterForm = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [msaAccepted, setMsaAccepted] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '+27',
    organisation: { organisation_name: '', msa_accepted: false },
  });

  const [errors, setErrors] = useState({
    firstName: '', lastName: '', email: '', mobile: '',
    organisation_name: '', organisation_type: '', msa_accepted: '',
  });

  const [touched, setTouched] = useState({
    firstName: false,
    lastName: false,
    email: false,
    mobile: false,
    organisation_name: false,
  });

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numbersOnly = value.replace(/[^\d]/g, '');
    if (!value.startsWith('+27')) {
      setFormData({ ...formData, mobile: '+27' });
      return;
    }
    if (numbersOnly.length <= 11) {
      const newValue = '+27' + numbersOnly.slice(2);
      setFormData({ ...formData, mobile: newValue });
      if (touched.mobile) validateField('mobile');
    }
  };

  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const mobileRegex = /^\+27\d{9}$/;
    let tempErrors = { ...errors };
    let isValid = true;

    if (!formData.firstName.trim()) { tempErrors.firstName = 'First name is required'; isValid = false; }
    if (!formData.lastName.trim()) { tempErrors.lastName = 'Last name is required'; isValid = false; }
    if (!formData.email.trim()) {
      tempErrors.email = 'Email is required'; isValid = false;
    } else if (!emailRegex.test(formData.email)) {
      tempErrors.email = 'Invalid email format'; isValid = false;
    }
    if (!formData.mobile.trim() || !mobileRegex.test(formData.mobile)) {
      tempErrors.mobile = 'Enter a valid number: +27123456789'; isValid = false;
    }
    if (!formData.organisation.organisation_name.trim()) {
      tempErrors.organisation_name = 'Organisation name required'; isValid = false;
    }
    if (!msaAccepted) {
      tempErrors.msa_accepted = 'Accept the MSA'; isValid = false;
    }

    setErrors(tempErrors);
    return isValid;
  };

  const validateField = (fieldName: keyof typeof touched) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const mobileRegex = /^\+27\d{9}$/;
    const tempErrors = { ...errors };

    switch (fieldName) {
      case 'firstName':
        tempErrors.firstName = formData.firstName.trim() ? '' : 'First name is required';
        break;
      case 'lastName':
        tempErrors.lastName = formData.lastName.trim() ? '' : 'Last name is required';
        break;
      case 'email':
        if (!formData.email.trim()) {
          tempErrors.email = 'Email is required';
        } else if (!emailRegex.test(formData.email)) {
          tempErrors.email = 'Invalid email format';
        } else {
          tempErrors.email = '';
        }
        break;
      case 'mobile':
        tempErrors.mobile = mobileRegex.test(formData.mobile) ? '' : 'Enter a valid number: +27123456789';
        break;
      case 'organisation_name':
        tempErrors.organisation_name = formData.organisation.organisation_name.trim()
          ? ''
          : 'Organisation name required';
        break;
      default:
        break;
    }

    setErrors(tempErrors);
  };

  const isFormValid = () => {
    return (
      formData.firstName.trim() !== '' &&
      formData.lastName.trim() !== '' &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) &&
      /^\+27\d{9}$/.test(formData.mobile) &&
      formData.organisation.organisation_name.trim() !== '' &&
      msaAccepted
    );
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({
      firstName: true,
      lastName: true,
      email: true,
      mobile: true,
      organisation_name: true,
    });
    if (!validateForm()) return;

    setIsRegistering(true);
    try {
      const res = await axiosServices.post(`/api/users/registercustomer`, {
        ...formData,
        organisation: {
          ...formData.organisation,
          msa_accepted: msaAccepted,
          email_domain: formData.email,
        },
        status: 'Active',
        msa_version_id: null,
      });

      if (res.status === 200 || res.status === 201) {
        setDialogMessage('Successfully registered. Check your email to continue.');
        setDialogOpen(true);
        setTimeout(() => {
          setDialogOpen(false);
          setIsLoading(true);
          setTimeout(() => router.push('/auth/login'), 1000);
        }, 1500);

        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          mobile: '+27',
          organisation: { organisation_name: '', msa_accepted: false },
        });
        setMsaAccepted(false);
        setTouched({
          firstName: false,
          lastName: false,
          email: false,
          mobile: false,
          organisation_name: false,
        });
      }
    } catch (error) {
      let message = 'Network error. Please try again.';
      if (error instanceof AxiosError) {
        message = error.response?.data?.message || error.message || message;
      }
      setDialogMessage(message);
      setDialogOpen(true);
    } finally {
      setIsRegistering(false);
    }
  };

  return {
    isLoading, isRegistering, dialogMessage, dialogOpen, setDialogOpen,
    msaAccepted, setMsaAccepted, showTerms, setShowTerms,
    formData, setFormData, errors, setErrors,
    handleMobileChange, handleRegister, isFormValid,
    touched, setTouched, validateForm, validateField
  };
};
