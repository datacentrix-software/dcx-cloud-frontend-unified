'use client';

import { useEffect, useState } from 'react';
import { Box, Container, Typography, Button, Paper, Stepper, Step, StepLabel, Dialog, DialogTitle, DialogContent, DialogActions, Table, TableHead, TableRow, TableCell, TableBody, IconButton, FormControlLabel, Checkbox } from '@mui/material';
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
import Swal from 'sweetalert2';
import Link from 'next/link';
import { InputVM, transformVMs } from '@/app/(DashboardLayout)/utilities/helpers/vm.helper';
import { useCreditCardStore } from '@/store/useCreditCardStore';
import useVirtualMachineStore, { useVirtualMachineOptions } from '@/store/useVirtualMachineStore';

const steps = ['Create a Virtual Machine', 'Backup Services and Recovery', 'Software Licensing', 'Additional Services'
];

export default function VirtualMachinesPage() {
  const { activeStep, setActiveStep } = useVirtualMachineStore();
  const { selectedOptions, setSelectedOptions, totalCost, setTotalCost, products, setProducts, vmTemplates, setVmTemplates, backupServicesSelected,
    setBackupServicesSelected, softwareLicensingSelected, setSoftwareLicensingSelected, additionalServicesSelected, setAdditionalServicesSelected,
  } = useVirtualMachineStore();

  const { createdVMs, setCreatedVMs } = useVirtualMachineOptions();
  const customizer = useSelector((state: AppState) => state.customizer);
  const { token } = useAuthStore();
  const { quoteDialogOpen, setQuoteDialogOpen } = useVirtualMachineStore();

  // Get VMs from selectedOptions
  const selectedVMs = selectedOptions.virtualMachine || [];

  const [openAddCardDialog, setOpenAddCardDialog] = useState(false);

  const { user: authUser } = useAuthStore();
  const [acceptedMSA, setAcceptedMSA] = useState(false);
  const { setPaymentCards, paymentCards, selectedCard, setSelectedCard } = useCreditCardStore()

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
  }, []);

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
        console.error('Error fetching data:', error);
        setProducts([]);
        setVmTemplates([]);
      }
    };
    fetchData();
  }, [token]);

  // Prepare filtered product lists for each step
  const backupServiceProducts = products.filter((p: any) =>
    p.SubCategory?.name === 'Cloud Services -  Backup as a Service (BaaS)' ||
    p.SubCategory?.name === 'Cloud Services -  Disaster Recovery as a Service (DraaS)'
  );
  const softwareLicensingProducts = products.filter((p: any) =>
    p.SubCategory?.name === 'Cloud Services - M365'
  );
  const additionalServicesProducts = products.filter((p: any) =>
    [
      'Cloud Services - Professional Services',
      'Cloud Services -  Network as a Service (NaaS)',
      'Cloud Services -  Firewall as a Service (FaaS))',
      'Cloud Services -  Collocation'
    ].includes(p.SubCategory?.name)
  );

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
    const total = allSelected.reduce((sum, item: any) => sum + (item?.price || 0), 0);

    setTotalCost(total);
  }, [selectedOptions]);

  const handleNext = () => {
    setActiveStep(activeStep + 1);
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  const handleStepClick = (step: number) => {
    setActiveStep(step);
  };

  const handleOptionSelect = (step: string, options: any) => {
    const currentOptions = useVirtualMachineStore.getState().selectedOptions;

    // For virtual machines, we want to replace the entire array
    if (step === 'virtualMachine') {
      setSelectedOptions({
        ...currentOptions,
        [step]: options
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
      setBackupServicesSelected(options);
    }
    if (step === 'softwareLicensing' && Array.isArray(options)) setSoftwareLicensingSelected(options);
    if (step === 'additionalServices' && typeof options === 'object' && options != null && 'professional' in options && 'naas' in options && 'faas' in options && 'collocation' in options) {
      setAdditionalServicesSelected(options);
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
    setTotalCost(0);
  };

  // Gather all selected products for the quote
  const allSelectedProducts: any[] = [
    ...(Array.isArray(selectedOptions.virtualMachine) ? selectedOptions.virtualMachine : []),
    ...(Array.isArray(selectedOptions.backupServices) ? selectedOptions.backupServices : []),
    ...(Array.isArray(selectedOptions.softwareLicensing) ? selectedOptions.softwareLicensing : []),
    ...(Array.isArray(selectedOptions.additionalServices) ? selectedOptions.additionalServices : [])
  ];

  // Remove duplicates by product id (if needed)
  const uniqueProducts: any[] = allSelectedProducts.filter((item, index, arr) =>
    item && item.id && arr.findIndex((i) => i && i.id === item.id) === index
  );

  // Remove a product from all selected options
  const handleRemoveProduct = (productId: any) => {
    const productToRemove = products.find(p => p.id === productId);

    // Check if it's a VM (it won't be in products array)
    const isVM = uniqueProducts.find(p => p.id === productId)?.type === 'virtualMachine';

    if (isVM) {
      // For VMs, we need to update the virtualMachine array directly
      const newVirtualMachines = selectedOptions.virtualMachine.filter((item: any) => item.id !== productId);
      setSelectedOptions({
        ...selectedOptions,
        virtualMachine: newVirtualMachines
      });

      setCreatedVMs(createdVMs.filter((item: any) => item?.id !== productId));
    } else if (productToRemove) {
      // For other products, maintain existing behavior
      const newSelectedOptions = {
        virtualMachine: selectedOptions.virtualMachine.filter((item: any) => +item?.id !== productId),
        backupServices: selectedOptions.backupServices.filter((item: any) => +item?.id !== productId),
        softwareLicensing: selectedOptions.softwareLicensing.filter((item: any) => +item?.id !== productId),
        additionalServices: selectedOptions.additionalServices.filter((item: any) => +item?.id !== productId),
      };


      setSelectedOptions(newSelectedOptions);

      // Update step-specific selections
      if (productToRemove.SubCategory?.name?.includes('Backup as a Service') ||
        productToRemove.SubCategory?.name?.includes('Disaster Recovery')) {
        setBackupServicesSelected({
          baas: backupServicesSelected.baas.filter((item: any) => +item !== productId),
          draas: backupServicesSelected.draas.filter((item: any) => +item !== productId),
        });
      }

      if (productToRemove.SubCategory?.name?.includes('M365')) {
        setSoftwareLicensingSelected(
          softwareLicensingSelected.filter((item: any) => +item?.id !== productId)
        );
      }

      if ([
        'Professional Services',
        'Network as a Service',
        'Firewall as a Service',
        'Collocation'
      ].some(name => productToRemove.SubCategory?.name?.includes(name))) {
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
    const newTotal = allSelected.reduce((sum, item: any) => sum + (item?.price || 0), 0);
    setTotalCost(newTotal);
  };


  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return <CreateVirtualMachine
          onSelect={(options) => handleOptionSelect('virtualMachine', options)}
          vmTemplates={vmTemplates}
          products={products}
          selectedVMs={selectedVMs}
        />;
      case 1:
        return <BackupServices onSelect={(options) => handleOptionSelect('backupServices', options)} products={backupServiceProducts} selected={backupServicesSelected} setSelected={setBackupServicesSelected} />;
      case 2:
        return <SoftwareLicensing onSelect={(options) => handleOptionSelect('softwareLicensing', options)} products={softwareLicensingProducts} selected={softwareLicensingSelected} setSelected={setSoftwareLicensingSelected} />;
      case 3:
        return <AdditionalServices onSelect={(options) => handleOptionSelect('additionalServices', options)} products={additionalServicesProducts} selected={additionalServicesSelected} setSelected={setAdditionalServicesSelected} />;
      default:
        return null;
    }
  };

  const spinUp = async () => {
    if (!paymentCards?.length) { // check cards
      setOpenAddCardDialog(true);
      return;
    }

    if (!acceptedMSA) {
      Swal.fire({
        title: 'Alert',
        text: 'Please accept the MSA before deploying resources',
        icon: 'warning',
        customClass: {
          popup: 'custom-swal-zindex',
        },
        didOpen: () => {
          const swalContainer = document.querySelector('.swal2-container');
          if (swalContainer) {
            (swalContainer as HTMLElement).style.zIndex = '9999';
          }
        },
      });
      return;
    }

    if (!createdVMs.length) {
      Swal.fire({
        title: 'Alert',
        text: 'Please add at least one VM before deploying resources',
        icon: 'warning',
        customClass: {
          popup: 'custom-swal-zindex',
        },
        didOpen: () => {
          const swalContainer = document.querySelector('.swal2-container');
          if (swalContainer) {
            (swalContainer as HTMLElement).style.zIndex = '9999';
          }
        },
      });
      return;
    }

    const res = await fetch('/api/get-ip');
    const { ip } = await res.json();

    try {
      const orgId = authUser?.userOrganisations[0]?.organisation.id
      const payload = {
        customer: {
          organisationId: orgId,
          email: authUser?.email,
          businessUnitId: 1,
          attribute: `${authUser?.firstName} ${authUser?.lastName}`,
          description: 'New Primary IT infrastructure client',
          totalCost,
          status: 'Active',
          loginUserEmail: authUser?.email,
          loginUserName: `${authUser?.firstName} ${authUser?.lastName}`,
        },
        vms: transformVMs(createdVMs as any, vmTemplates),
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

          Swal.fire({
            title: 'Successful!',
            text: vmResponse?.data.message || `Your resources are currently being provisioned.`,
            icon: 'success',
            draggable: true,
          }).then((result: any) => {
            if (result.isConfirmed) {
              window.location.href = '/';
            }
          });
        } else {
          Swal.fire({
            title: 'Failed',
            text: response?.data.message || 'An error occurred.',
            icon: 'error',
            draggable: true,
          });
        }
      } else {
        Swal.fire({
          title: 'Failed',
          text: response?.data.message || 'An error occurred.',
          icon: 'error',
          draggable: true,
        });
      }
    } catch (error: any) {
      Swal.fire({
        title: 'Failed',
        text: error || 'An error occurred.',
        icon: 'error',
        draggable: true,
      });
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 0 }}>
      <Paper sx={{ p: 1, mb: 4, mt: '0px' }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label, index) => (
            <Step key={label} onClick={() => handleStepClick(index)} sx={{ cursor: 'pointer' }}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

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
                Clear Quote
              </Button>
              <Button variant="contained" color="primary" onClick={() => setQuoteDialogOpen(true)}>
                View Quote
              </Button>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                variant="outlined"
              >
                Previous
              </Button>
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={activeStep === steps.length - 1}
              >
                Next
              </Button>
            </Box>
          </Box>
        </Container>
      </Paper>
      <Dialog
        open={quoteDialogOpen}
        onClose={() => setQuoteDialogOpen(false)}
        maxWidth="md"
        fullWidth
        keepMounted
        disablePortal
      >
        <DialogTitle>
          Estimate Overview
          <IconButton
            aria-label="close"
            onClick={() => setQuoteDialogOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Unit</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {uniqueProducts.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.title}</TableCell>
                  <TableCell>
                    {item.type === 'virtualMachine' ? (
                      <Box>
                        <Typography variant="body2">
                          <strong>Region:</strong> {item.details.region}
                        </Typography>
                        <Typography variant="body2">
                          <strong>OS:</strong> {item.details.os}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Tier:</strong> {item.details.tier}
                        </Typography>
                        {item.details.configuration.type === 'custom' ? (
                          <>
                            <Typography variant="body2">
                              <strong>vCPUs:</strong> {item.details.configuration.specs.vcpus}
                            </Typography>
                            <Typography variant="body2">
                              <strong>RAM:</strong> {item.details.configuration.specs.memory}GB
                            </Typography>
                            <Typography variant="body2">
                              <strong>Storage:</strong> {item.details.configuration.specs.storage}GB
                            </Typography>
                            <Typography variant="body2">
                              <strong>GHz:</strong> {item.details.configuration.specs.ghz}
                            </Typography>
                          </>
                        ) : (
                          <>
                            <Typography variant="body2">
                              <strong>vCPUs:</strong> {item.details.configuration.vcpus}
                            </Typography>
                            <Typography variant="body2">
                              <strong>RAM:</strong> {item.details.configuration.memory}GB
                            </Typography>
                            <Typography variant="body2">
                              <strong>Storage:</strong> {item.details.configuration.storage}GB
                            </Typography>
                            <Typography variant="body2">
                              <strong>GHz:</strong> {item.details.configuration.ghz}
                            </Typography>
                          </>
                        )}
                      </Box>
                    ) : (
                      item.description
                    )}
                  </TableCell>
                  <TableCell>{item.units || 1}</TableCell>
                  <TableCell>{item.unit || '-'}</TableCell>
                  <TableCell>{item.price ? `R${item.price.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '-'}</TableCell>
                  <TableCell>{item.price ? `R${(item.price * (item.units || 1)).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '-'}</TableCell>
                  <TableCell>
                    <IconButton
                      color="error"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveProduct(item.id);
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {/* Total row */}
              <TableRow>
                <TableCell colSpan={5} align="right" sx={{ fontWeight: 700 }}>
                  Total
                </TableCell>
                <TableCell sx={{ fontWeight: 700 }}>
                  R{uniqueProducts.reduce((sum, item) => sum + (item.price ? item.price * (item.units || 1) : 0), 0).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </TableCell>
                <TableCell />
              </TableRow>
            </TableBody>
          </Table>
        </DialogContent>
        <DialogActions>
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
