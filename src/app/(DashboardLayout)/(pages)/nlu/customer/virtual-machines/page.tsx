'use client';

import { useEffect, useState } from 'react';
import useVirtualMachineStore, { useVirtualMachineOptions } from '@/store/useVirtualMachineStore';
import { Box, Container, Typography, Button, Paper, Dialog, DialogTitle, DialogContent, DialogActions, Table, TableHead, TableRow, TableCell, TableBody, IconButton, FormControlLabel, Checkbox, Card, CardContent, Tooltip } from '@mui/material';
import CreateVirtualMachine from './components/CreateVirtualMachine';
import BackupServices from './components/BackupServices';
import SoftwareLicensing from './components/SoftwareLicensing';
import AdditionalServices from './components/AdditionalServices';
import { useSelector } from '@/store/hooks';
import { AppState } from '@/store/store';
import { useAuthStore } from '@/store';
import axiosServices from '@/utils/axios';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCreditCardDialog from './components/AddCreditCardDialog';

import Link from 'next/link';
import { InputVM, transformVMs } from '@/app/(DashboardLayout)/utilities/helpers/vm.helper';
import { useCreditCardStore } from '@/store/useCreditCardStore';
import { IconServer, IconX, IconInfoCircle } from '@tabler/icons-react';
import { ISimpleProduct, IVMConfig, VMTemplate } from '@/types';

// Define interfaces for the component
interface VMQuoteObject {
  id: string;
  title: string;
  description: string;
  price: number;
  units: number;
  unit: string;
  type: string;
  details: {
    region: string;
    os: string;
    tier: string;
    configuration: {
      type: 'template' | 'custom';
      templateId: string;
      specs: {
        vcpus: number;
        memory: number;
        storage: number;
        ghz: number;
      };
    };
  };
}

interface ProductWithType extends ISimpleProduct {
  type?: string;
  Category?: {
    name: string;
  };
}

// Union type for all possible product types
type AllProductTypes = ProductWithType | (IVMConfig & { type?: string }) | VMQuoteObject;

interface BackupServicesOptions {
  baas: ISimpleProduct[];
  draas: ISimpleProduct[];
}

interface AdditionalServicesOptions {
  professional: string[];
  naas: string[];
  faas: string[];
  collocation: string[];
}

// Override the ISelectedOptions interface for this component
interface StepOptions {
  virtualMachine: VMQuoteObject[];
  backupServices: ISimpleProduct[];
  softwareLicensing: ISimpleProduct[];
  additionalServices: ISimpleProduct[];
}

export default function VirtualMachinesPage() {
  const { activeStep, setActiveStep } = useVirtualMachineStore();
  const { selectedOptions, setSelectedOptions, totalCost, setTotalCost, products, setProducts, vmTemplates, setVmTemplates, backupServicesSelected,
    setBackupServicesSelected, softwareLicensingSelected, setSoftwareLicensingSelected, additionalServicesSelected, setAdditionalServicesSelected,
  } = useVirtualMachineStore();

  const { createdVMs, setCreatedVMs } = useVirtualMachineOptions();
  const customizer = useSelector((state: AppState) => state.customizer);
  const { token, user: authUser, primaryOrgId } = useAuthStore();
  const { quoteDialogOpen, setQuoteDialogOpen } = useVirtualMachineStore();

  // Get VMs from selectedOptions
  const selectedVMs = selectedOptions.virtualMachine || [];

  const [openAddCardDialog, setOpenAddCardDialog] = useState(false);

  const [acceptedMSA, setAcceptedMSA] = useState(false);
  const { setPaymentCards, paymentCards, selectedCard, setSelectedCard } = useCreditCardStore()

  // Welcome card state
  const [isWelcomeCardVisible, setIsWelcomeCardVisible] = useState(true);
  const [isWelcomeCardAnimating, setIsWelcomeCardAnimating] = useState(false);

  // Check if welcome card was dismissed in current session
  useEffect(() => {
    const dismissed = sessionStorage.getItem('vmWelcomeCardDismissed');
    if (dismissed === 'true') {
      setIsWelcomeCardVisible(false);
    } else {
      setIsWelcomeCardVisible(true);
    }
  }, []);

  // Reset welcome card visibility when user changes
  useEffect(() => {
    if (authUser?.id) {
      const lastUserId = sessionStorage.getItem('lastVmWelcomeCardUserId');
      if (lastUserId !== authUser.id.toString()) {
        // New user logged in, show welcome card
        setIsWelcomeCardVisible(true);
        setIsWelcomeCardAnimating(false);
        sessionStorage.setItem('lastVmWelcomeCardUserId', authUser.id.toString());
        sessionStorage.removeItem('vmWelcomeCardDismissed');
      }
    }
  }, [authUser?.id]);

  const handleWelcomeCardDismiss = () => {
    setIsWelcomeCardAnimating(true);
    // Start the animation
    setTimeout(() => {
      setIsWelcomeCardVisible(false);
      sessionStorage.setItem('vmWelcomeCardDismissed', 'true');
    }, 300); // Match the animation duration
  };

  // Initialize selectedOptions if not already initialized
  useEffect(() => {
    if (!selectedOptions.virtualMachine) {
      setSelectedOptions({
        virtualMachine: [],
        backupServices: [],
        softwareLicensing: [],
        additionalServices: []
      });
    }
  }, [setSelectedOptions, selectedOptions.virtualMachine]);

  // Fetch products and terraform config on mount with axios and token
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!token) throw new Error('Authentication token not found');

        // Fetch products
        const productsResponse = await axiosServices.get(`${process.env.NEXT_PUBLIC_BACK_END_BASEURL}/api/products/getproducts`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setProducts(productsResponse.data);

        // Fetch terraform config
        const terraformResponse = await axiosServices.get(`${process.env.NEXT_PUBLIC_BACK_END_BASEURL}/api/terraform/getterraformconfig`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setVmTemplates(terraformResponse.data);
      } catch (error) {
        setProducts([]);
        setVmTemplates([]);
        
      }
    };
    fetchData();
  }, [token, setProducts, setVmTemplates]);


  // Calculate total cost based on selected products
  useEffect(() => {
    // Flatten all selected options arrays
    const allSelected = [
      ...(Array.isArray(createdVMs)) ? createdVMs : [],
      ...(Array.isArray(selectedOptions.backupServices) ? selectedOptions.backupServices : []),
      ...(Array.isArray(selectedOptions.softwareLicensing) ? selectedOptions.softwareLicensing : []),
      ...(Array.isArray(selectedOptions.additionalServices) ? selectedOptions.additionalServices : [])
    ];

    // Sum up the price for each selected product (assuming each is a product object)
    const total = allSelected.reduce((sum, item) => sum + (item?.price || 0), 0);

    setTotalCost(total);
  }, [selectedOptions, createdVMs, setTotalCost]);

  const handleNext = () => {
    setActiveStep(activeStep + 1);
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  const handleStepClick = (step: number) => {
    setActiveStep(step);
  };

  const handleOptionSelect = (step: string, options: VMQuoteObject[] | BackupServicesOptions | ISimpleProduct[] | AdditionalServicesOptions) => {
    const currentOptions = useVirtualMachineStore.getState().selectedOptions;

    // For virtual machines, we want to replace the entire array
    if (step === 'virtualMachine') {
      // Convert VMQuoteObject[] to IVMConfig[]
      const vmConfigs: IVMConfig[] = (options as VMQuoteObject[]).map(vm => ({
        id: vm.id,
        region: vm.details.region,
        os: vm.details.os,
        serverName: vm.title.split(' - ')[0],
        description: vm.description,
        tier: vm.details.tier,
        configuration: vm.details.configuration,
        price: vm.price
      }));
      
      setSelectedOptions({
        ...currentOptions,
        virtualMachine: vmConfigs
      });
    } else {
      // For other steps, maintain existing behavior
      setSelectedOptions({
        ...currentOptions,
        [step]: Array.isArray(options) ? options : [options]
      });
    }

    // Also update the step-specific selected state
    if (step === 'backupServices' && typeof options === 'object' && options != null && 'baas' in options && 'draas' in options) {
      setBackupServicesSelected(options as BackupServicesOptions);
    }
    if (step === 'softwareLicensing' && Array.isArray(options)) {
      // Convert ISimpleProduct[] to string[] by extracting IDs
      const stringArray = (options as ISimpleProduct[]).map(item => item.id.toString());
      setSoftwareLicensingSelected(stringArray);
    }
    if (step === 'additionalServices' && typeof options === 'object' && options != null && 'professional' in options && 'naas' in options && 'faas' in options && 'collocation' in options) {
      setAdditionalServicesSelected(options as AdditionalServicesOptions);
    }
  };

  const handleClearQuote = () => {
    setSelectedOptions({
      virtualMachine: [],
      backupServices: [],
      softwareLicensing: [],
      additionalServices: []
    });
    setSoftwareLicensingSelected([]);
    setAdditionalServicesSelected({
      professional: [],
      naas: [],
      faas: [],
      collocation: [],
    });
    setBackupServicesSelected({ baas: [], draas: [] });
    // Clear the created VMs from the VM options store
    setCreatedVMs([]);
    setTotalCost(0);
  };

  // Gather all selected products for the quote
  const allSelectedProducts = [
    ...(Array.isArray(selectedOptions.virtualMachine) ? selectedOptions.virtualMachine : []),
    ...(Array.isArray(selectedOptions.backupServices) ? selectedOptions.backupServices : []),
    ...(Array.isArray(selectedOptions.softwareLicensing) ? selectedOptions.softwareLicensing : []),
    ...(Array.isArray(selectedOptions.additionalServices) ? selectedOptions.additionalServices : [])
  ];

  // Remove duplicates by product id (if needed)
  const uniqueProducts = allSelectedProducts.filter((item, index, arr) =>
    item && item.id && arr.findIndex((i) => i && i.id === item.id) === index
  );

  // Remove a product from all selected options
  const handleRemoveProduct = (productId: string | number) => {
    const productToRemove = products.find(p => p.id === productId);

    // Check if it's a VM (it won't be in products array)
    const isVM = uniqueProducts.find(p => p.id === productId && 'type' in p && p.type === 'virtualMachine');

    if (isVM) {
      // For VMs, we need to update the virtualMachine array directly
      const newVirtualMachines = selectedOptions.virtualMachine.filter((item: IVMConfig) => item.id !== productId);
      setSelectedOptions({
        ...selectedOptions,
        virtualMachine: newVirtualMachines
      });

      setCreatedVMs(createdVMs.filter((item: IVMConfig) => item?.id !== productId));
    } else if (productToRemove) {
      // For other products, maintain existing behavior
      const newSelectedOptions = {
        virtualMachine: selectedOptions.virtualMachine.filter((item: IVMConfig) => +item?.id !== productId),
        backupServices: selectedOptions.backupServices.filter((item: ISimpleProduct) => +item?.id !== productId),
        softwareLicensing: selectedOptions.softwareLicensing.filter((item: ISimpleProduct) => +item?.id !== productId),
        additionalServices: selectedOptions.additionalServices.filter((item: ISimpleProduct) => +item?.id !== productId),
      };


      setSelectedOptions(newSelectedOptions);

      // Update step-specific selections
      if (productToRemove.Category?.name?.includes('Backup as a Service') ||
        productToRemove.Category?.name?.includes('Disaster Recovery')) {
        setBackupServicesSelected({
          baas: backupServicesSelected.baas.filter((item: ISimpleProduct) => +item.id !== productId),
          draas: backupServicesSelected.draas.filter((item: ISimpleProduct) => +item.id !== productId),
        });
      }

      if (productToRemove.Category?.name?.includes('M365')) {
        setSoftwareLicensingSelected(
          softwareLicensingSelected.filter((item: string) => +item !== productId)
        );
      }

      if ([
        'Professional Services',
        'Network as a Service',
        'Firewall as a Service',
        'Collocation'
      ].some(name => productToRemove.Category?.name?.includes(name))) {
        setAdditionalServicesSelected({
          professional: additionalServicesSelected.professional.filter(id => id !== String(productId)),
          naas: additionalServicesSelected.naas.filter(id => id !== String(productId)),
          faas: additionalServicesSelected.faas.filter(id => id !== String(productId)),
          collocation: additionalServicesSelected.collocation.filter(id => id !== String(productId)),
        });
      }
    }

    // Recalculate total cost
    const allSelected = [
      ...(Array.isArray(selectedOptions.virtualMachine) ? selectedOptions.virtualMachine : []),
      ...(Array.isArray(selectedOptions.backupServices) ? selectedOptions.backupServices : []),
      ...(Array.isArray(selectedOptions.softwareLicensing) ? selectedOptions.softwareLicensing : []),
      ...(Array.isArray(selectedOptions.additionalServices) ? selectedOptions.additionalServices : [])
    ];
    const newTotal = allSelected.reduce((sum, item) => sum + (item?.price || 0), 0);
    setTotalCost(newTotal);
  };

  const handleAdditionalProductsUpdate = (newProducts: ISimpleProduct[]) => {
    // Separate VMs from additional products
    const vms = newProducts.filter(product => product.type === 'virtualMachine').map(product => {
      // Convert ISimpleProduct to IVMConfig format
      const vmProduct = product as any;
      return {
        id: String(vmProduct.id),
        region: vmProduct.region || vmProduct.details?.region || '',
        os: vmProduct.os || vmProduct.details?.os || '',
        serverName: vmProduct.serverName || vmProduct.title?.split(' - ')[0] || '',
        description: vmProduct.description || '',
        tier: vmProduct.tier || vmProduct.details?.tier || '',
        configuration: vmProduct.configuration || vmProduct.details?.configuration || { 
          type: 'template', 
          specs: { vcpus: 0, memory: 0, storage: 0, ghz: 0 },
          templateId: ''
        },
        price: vmProduct.price || 0,
        type: 'virtualMachine'
      } as IVMConfig;
    });
    
    const additionalProducts = newProducts.filter(product => product.type !== 'virtualMachine');
    
    // Update VMs in the createdVMs state
    setCreatedVMs(vms);
    
    // Handle additional products separately from VMs
    // Separate products by their Category and update the appropriate state
    const backupServices = additionalProducts.filter(product => 
      product.Category?.name?.includes('Backup as a Service') ||
      product.Category?.name?.includes('Disaster Recovery')
    );
    
    const softwareLicensing = additionalProducts.filter(product => 
      product.Category?.name?.includes('M365')
    );
    
    const additionalServices = additionalProducts.filter(product => 
      product.Category?.name?.includes('Professional Services') ||
      product.Category?.name?.includes('Network as a Service') ||
      product.Category?.name?.includes('Firewall as a Service') ||
      product.Category?.name?.includes('Collocation')
    );
    
    // Update the selectedOptions state for each category
    setSelectedOptions({
      virtualMachine: vms, // Update VMs in selectedOptions as well
      backupServices,
      softwareLicensing,
      additionalServices
    });
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return <CreateVirtualMachine
          onSelect={(options) => handleOptionSelect('virtualMachine', options)}
          onAdditionalProductsUpdate={handleAdditionalProductsUpdate}
          vmTemplates={vmTemplates}
          products={products}
          selectedVMs={selectedVMs}
          additionalProducts={[
            ...(Array.isArray(selectedOptions.backupServices) ? selectedOptions.backupServices : []),
            ...(Array.isArray(selectedOptions.softwareLicensing) ? selectedOptions.softwareLicensing : []),
            ...(Array.isArray(selectedOptions.additionalServices) ? selectedOptions.additionalServices : [])
          ]}
        />;
      default:
        return null;
    }
  };

  const spinUp = async () => {
    if (!paymentCards?.length) { // check cards
      setOpenAddCardDialog(true);
      return;
    }

    // if (!acceptedMSA) {
    //   Swal.fire({
    //     title: 'Alert',
    //     text: 'Please accept the MSA before deploying resources',
    //     icon: 'warning',
    //     customClass: {
    //       popup: 'custom-swal-zindex',
    //     },
    //     didOpen: () => {
    //       const swalContainer = document.querySelector('.swal2-container');
    //       if (swalContainer) {
    //         (swalContainer as HTMLElement).style.zIndex = '9999';
    //       }
    //     },
    //   });
    //   return;
    // }

    if (!createdVMs.length) {
      // Swal.fire({
      //   title: 'Alert',
      //   text: 'Please add at least one VM before deploying resources',
      //   icon: 'warning',
      //   customClass: {
      //     popup: 'custom-swal-zindex',
      //   },
      //   didOpen: () => {
      //     const swalContainer = document.querySelector('.swal2-container');
      //     if (swalContainer) {
      //       (swalContainer as HTMLElement).style.zIndex = '9999';
      //     }
      //   },
      // });
      return;
    }

    const res = await fetch('/api/get-ip');
    const { ip } = await res.json();

    try {
      // Convert IVMConfig to InputVM for the transformVMs function
      const inputVMs: InputVM[] = createdVMs.map(vm => ({
        ...vm,
        configuration: {
          ...vm.configuration,
          specs: {
            ...vm.configuration.specs,
            ghz: vm.configuration.specs.ghz.toString() // Convert number to string as expected by InputVM
          },
          templateId: vm.configuration.templateId || '' // Ensure templateId is never undefined
        }
      }));

      const payload = {
        customer: {
          organisationId: primaryOrgId,
          email: authUser?.email,
          businessUnitId: 1,
          attribute: `${authUser?.firstName} ${authUser?.lastName}`,
          description: 'New Primary IT infrastructure client',
          totalCost,
          status: 'Active',
          loginUserEmail: authUser?.email,
          loginUserName: `${authUser?.firstName} ${authUser?.lastName}`,
        },
        vms: transformVMs(inputVMs, vmTemplates),
        products: [
          ...selectedOptions.backupServices,
          ...selectedOptions.softwareLicensing,
          ...selectedOptions.additionalServices,
        ]
      }

      const response = await axiosServices.post(
        `${process.env.NEXT_PUBLIC_BACK_END_BASEURL}/api/quotes/createcustomerquote`,
        payload
      );
      const quoteId = response.data.quote.id;

      if (response.data.status === 'success') {
        const ipAddress = ip || 'Unknown';
        const vmResponse = await axiosServices.post(
          `${process.env.NEXT_PUBLIC_BACK_END_BASEURL}/api/vmwareintegration/deployresources?quoteId=${Number(
            quoteId
          )}&userId=${Number(authUser?.id)}&ipAddress=${ipAddress}`
        );

        if (vmResponse.data.message === 'Resource Provisioning In Progress') {

          // Swal.fire({
          //   title: 'Successful!',
          //   text: vmResponse?.data.message || `Your resources are currently being provisioned.`,
          //   icon: 'success',
          //   draggable: true,
          // }).then((result: { isConfirmed: boolean }) => {
          //   if (result.isConfirmed) {
          //     window.location.href = '/';
          //   }
          // });
        } else {
          // Swal.fire({
          //   title: 'Failed',
          //   text: response?.data.message || 'An error occurred.',
          //   icon: 'error',
          //   draggable: true,
          // });
        }
      } else {
        // Swal.fire({
        //   title: 'Failed',
        //   text: response?.data.message || 'An error occurred.',
        //   icon: 'error',
        //   draggable: true,
        // });
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred.';
      // Swal.fire({
      //   title: 'Failed',
      //   text: errorMessage,
      //   icon: 'error',
      //   draggable: true,
      // });
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 0 }}>
      {/* Welcome Card */}
      {isWelcomeCardVisible && (
        <Card
          sx={{ 
            mb: 4,
            mt: 2,
            background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: 2,
            opacity: isWelcomeCardAnimating ? 0 : 1,
            transform: isWelcomeCardAnimating ? 'scale(0.95) translateY(-10px)' : 'scale(1) translateY(0)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'radial-gradient(circle at top right, rgba(0,0,0,0.03) 0%, transparent 60%)',
            }
          }}
        >
          <CardContent sx={{ p: 4, position: 'relative' }}>
            {/* Close button */}
            <Tooltip title="Dismiss welcome message" arrow placement="top">
              <IconButton
                onClick={handleWelcomeCardDismiss}
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  color: 'text.secondary',
                  backgroundColor: 'rgba(0,0,0,0.04)',
                  borderRadius: '50%',
                  width: 32,
                  height: 32,
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    color: 'error.main',
                    backgroundColor: 'error.light + 20',
                    transform: 'scale(1.1) rotate(90deg)',
                    boxShadow: '0 4px 12px rgba(211, 47, 47, 0.4)',
                  },
                  '&:active': {
                    transform: 'scale(0.95) rotate(90deg)',
                  }
                }}
                size="small"
              >
                <IconX size={18} />
              </IconButton>
            </Tooltip>

            <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: '50%',
                  backgroundColor: 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  flexShrink: 0,
                }}
              >
                <IconServer size={32} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 'bold', 
                    mb: 1,
                    color: 'text.primary'
                  }}
                >
                  Create Your Virtual Machine
                </Typography>
                <Typography 
                  variant="subtitle1" 
                  sx={{ 
                    opacity: 0.9,
                    color: 'text.secondary',
                    mb: 2
                  }}
                >
                  Configure and deploy virtual machines with our easy-to-use interface. Choose your preferred operating system, 
                  customize specifications, and add additional services to build your perfect cloud infrastructure.
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                  <IconInfoCircle size={16} />
                  <Typography variant="body2">
                    You can also add backup services, software licensing, and additional professional services to your deployment.
                  </Typography>
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      <Box sx={{ mb: 4, maxWidth: 950, mx: 'auto', width: '100%' }}>
        {renderStepContent(activeStep)}
      </Box>
      <Paper
        sx={{
          p: 3,
          position: 'fixed',
          bottom: 0,
          left: customizer.isHorizontal ? 0 : `${customizer.SidebarWidth}px`,
          right: 0,
          zIndex: 1000,
          width: customizer.isHorizontal ? '100%' : `calc(100% - ${customizer.SidebarWidth}px)`,
          transition: 'left 0.2s,width 0.2s',
          backgroundColor: '#fafbfc',
          borderTop: '2px solid #000',
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h6">Estimated Monthly Total</Typography>
              <Typography variant="h4" color="primary">R{totalCost.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={handleClearQuote}
                sx={{
                  borderColor: 'error.main',
                  color: 'error.main',
                  backgroundColor: 'transparent',
                  '&:hover': {
                    borderColor: 'error.dark',
                    color: 'error.dark',
                    backgroundColor: 'rgba(255,0,0,0.04)',
                  },
                }}
              >
                Clear Estimate
              </Button>
              <Button variant="contained" color="primary" onClick={() => setQuoteDialogOpen(true)}>
                View Estimate
              </Button>
            </Box>
          </Box>
        </Container>
      </Paper>
      <Dialog
        open={quoteDialogOpen}
        onClose={() => setQuoteDialogOpen(false)}
        maxWidth="lg"
        fullWidth
        keepMounted
        disablePortal
        PaperProps={{
          sx: {
            maxHeight: '90vh',
            minHeight: '70vh'
          }
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Typography variant="h4" fontWeight={700}>
            Estimate Overview
          </Typography>
          <IconButton
            aria-label="close"
            onClick={() => setQuoteDialogOpen(false)}
            size="large"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pb: 2 }}>
          {/* Virtual Machines Section */}
          {uniqueProducts.filter(item => 'type' in item && item.type === 'virtualMachine').length > 0 && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" fontWeight={600} sx={{ mb: 2, color: 'primary.main' }}>
                Virtual Machines ({uniqueProducts.filter(item => 'type' in item && item.type === 'virtualMachine').length})
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {uniqueProducts.filter(item => 'type' in item && item.type === 'virtualMachine').map((item) => {
                  // Type guard to ensure item has details property
                  const vmItem = item as unknown as VMQuoteObject;
                  return (
                    <Paper key={vmItem.id} variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
                            {vmItem.title}
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 2 }}>
                            <Typography variant="body2">
                              <strong>Region:</strong> {vmItem.details.region}
                            </Typography>
                            <Typography variant="body2">
                              <strong>OS:</strong> {vmItem.details.os}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Tier:</strong> {vmItem.details.tier}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                            {vmItem.details.configuration.type === 'custom' ? (
                              <>
                                <Typography variant="body2">
                                  <strong>vCPUs:</strong> {vmItem.details.configuration.specs.vcpus}
                                </Typography>
                                <Typography variant="body2">
                                  <strong>RAM:</strong> {vmItem.details.configuration.specs.memory}GB
                                </Typography>
                                <Typography variant="body2">
                                  <strong>Storage:</strong> {vmItem.details.configuration.specs.storage}GB
                                </Typography>
                                <Typography variant="body2">
                                  <strong>GHz:</strong> {vmItem.details.configuration.specs.ghz}
                                </Typography>
                              </>
                            ) : (
                              <>
                                <Typography variant="body2">
                                  <strong>vCPUs:</strong> {vmItem.details.configuration.specs.vcpus}
                                </Typography>
                                <Typography variant="body2">
                                  <strong>RAM:</strong> {vmItem.details.configuration.specs.memory}GB
                                </Typography>
                                <Typography variant="body2">
                                  <strong>Storage:</strong> {vmItem.details.configuration.specs.storage}GB
                                </Typography>
                                <Typography variant="body2">
                                  <strong>GHz:</strong> {vmItem.details.configuration.specs.ghz}
                                </Typography>
                              </>
                            )}
                          </Box>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: 2 }}>
                          <Typography variant="h6" color="primary" fontWeight={700}>
                            R{(vmItem.price * (vmItem.units || 1)).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/month
                          </Typography>
                          <IconButton
                            color="error"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveProduct(vmItem.id);
                            }}
                            size="small"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </Box>
                    </Paper>
                  );
                })}
              </Box>
            </Box>
          )}

          {/* Additional Products Section */}
          {uniqueProducts.filter(item => !('type' in item) || item.type !== 'virtualMachine').length > 0 && (
            <Box>
              <Typography variant="h5" fontWeight={600} sx={{ mb: 2, color: 'primary.main' }}>
                Additional Products ({uniqueProducts.filter(item => !('type' in item) || item.type !== 'virtualMachine').length})
              </Typography>
              
              {/* Backup Services Subsection */}
              {uniqueProducts.filter(item => 
                (!('type' in item) || item.type !== 'virtualMachine') && 
                ('Category' in item && (item as ISimpleProduct).Category?.name?.includes('Backup as a Service') || (item as ISimpleProduct).Category?.name?.includes('Disaster Recovery'))
              ).length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 1, color: 'text.secondary' }}>
                    Backup Services & Recovery
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {uniqueProducts.filter(item => 
                      (!('type' in item) || item.type !== 'virtualMachine') && 
                      ('Category' in item && (item as ISimpleProduct).Category?.name?.includes('Backup as a Service') || (item as ISimpleProduct).Category?.name?.includes('Disaster Recovery'))
                    ).map((item) => {
                      // Type guard to ensure we're working with ISimpleProduct
                      if (!('Category' in item)) return null;
                      const productItem = item as ISimpleProduct;
                      return (
                        <Paper key={productItem.id} variant="outlined" sx={{ p: 2, borderRadius: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box>
                              <Typography variant="body1" fontWeight={500}>
                                {productItem.title}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {/* ISimpleProduct doesn't have description, so use empty string */}
                                {''}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Typography variant="body1" fontWeight={600}>
                                R{(productItem.price * 1).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/month
                              </Typography>
                              <IconButton
                                color="error"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveProduct(productItem.id);
                                }}
                                size="small"
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Box>
                          </Box>
                        </Paper>
                      );
                    }).filter(Boolean)}
                  </Box>
                </Box>
              )}

              {/* Software Licensing Subsection */}
              {uniqueProducts.filter(item => 
                (!('type' in item) || item.type !== 'virtualMachine') && 
                ('Category' in item && item.Category?.name?.includes('M365'))
              ).length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 1, color: 'text.secondary' }}>
                    Software Licensing
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {uniqueProducts.filter(item => 
                      (!('type' in item) || item.type !== 'virtualMachine') && 
                      ('Category' in item && item.Category?.name?.includes('M365'))
                    ).map((item) => {
                      // Type guard to ensure we're working with ISimpleProduct
                      if (!('Category' in item)) return null;
                      const productItem = item as ISimpleProduct;
                      return (
                        <Paper key={productItem.id} variant="outlined" sx={{ p: 2, borderRadius: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box>
                              <Typography variant="body1" fontWeight={500}>
                                {productItem.title}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {/* ISimpleProduct doesn't have description, so use empty string */}
                                {''}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Typography variant="body1" fontWeight={600}>
                                R{(productItem.price * 1).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/month
                              </Typography>
                              <IconButton
                                color="error"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveProduct(productItem.id);
                                }}
                                size="small"
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Box>
                          </Box>
                        </Paper>
                      );
                    }).filter(Boolean)}
                  </Box>
                </Box>
              )}

              {/* Additional Services Subsection */}
              {uniqueProducts.filter(item => 
                (!('type' in item) || item.type !== 'virtualMachine') && 
                ('Category' in item && (item.Category?.name?.includes('Professional Services') || 
                 item.Category?.name?.includes('Network as a Service') || 
                 item.Category?.name?.includes('Firewall as a Service') || 
                 item.Category?.name?.includes('Collocation')))
              ).length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 1, color: 'text.secondary' }}>
                    Additional Services
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {uniqueProducts.filter(item => 
                      (!('type' in item) || item.type !== 'virtualMachine') && 
                      ('Category' in item && (item.Category?.name?.includes('Professional Services') || 
                       item.Category?.name?.includes('Network as a Service') || 
                       item.Category?.name?.includes('Firewall as a Service') || 
                       item.Category?.name?.includes('Collocation')))
                    ).map((item) => {
                      // Type guard to ensure we're working with ISimpleProduct
                      if (!('Category' in item)) return null;
                      const productItem = item as ISimpleProduct;
                      return (
                        <Paper key={productItem.id} variant="outlined" sx={{ p: 2, borderRadius: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box>
                              <Typography variant="body1" fontWeight={500}>
                                {productItem.title}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {/* ISimpleProduct doesn't have description, so use empty string */}
                                {''}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Typography variant="body1" fontWeight={600}>
                                R{(productItem.price * 1).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/month
                              </Typography>
                              <IconButton
                                color="error"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveProduct(productItem.id);
                                }}
                                size="small"
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Box>
                          </Box>
                        </Paper>
                      );
                    }).filter(Boolean)}
                  </Box>
                </Box>
              )}
            </Box>
          )}

          {/* Total Section */}
          <Box sx={{ 
            mt: 4, 
            pt: 3, 
            borderTop: '2px solid', 
            borderColor: 'divider',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Typography variant="h5" fontWeight={700}>
              Total Monthly Cost
            </Typography>
            <Typography variant="h4" color="primary" fontWeight={700}>
              R{uniqueProducts.reduce((sum, item) => sum + (Number(item.price) || 0) * (('units' in item ? Number(item.units) : 1) || 1), 0).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <FormControlLabel
            control={
              <Checkbox
                sx={{ ml: 2 }}
                required
                checked={acceptedMSA}
                onChange={() => setAcceptedMSA(!acceptedMSA)}
                name="msaAgreement"
              />
            }
            label={
              <Typography variant="body2" component="span">
                I accept the{' '}
                <Link href="/" target="_blank" rel="noopener noreferrer">
                  Master Services Agreement
                </Link>
              </Typography>
            }
          />
          <Button onClick={spinUp} color="primary" variant="outlined">
            Spin Up
          </Button>
          <Button onClick={() => setQuoteDialogOpen(false)} color="primary" variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <AddCreditCardDialog
        open={openAddCardDialog}
        onClose={() => setOpenAddCardDialog(false)}
        onSave={(data) => {
          setOpenAddCardDialog(false);
        }}
      />

    </Container>
  );
}
