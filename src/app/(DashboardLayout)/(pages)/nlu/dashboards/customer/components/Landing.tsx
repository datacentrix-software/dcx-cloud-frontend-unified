import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Grid,
    Button,
    Stack,
    Card,
    CardContent,
    useTheme,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    RadioGroup,
    Radio,
    FormControlLabel,
    TextField,
    FormControl,
    FormLabel,
    Paper,
    Divider,
    IconButton,
    Tooltip,
    InputLabel,
    MenuItem,
    Select
} from '@mui/material';
import {
    IconServer,
    IconCreditCard,
    IconGift,
    IconBrandUbuntu,
    IconCpu,
    IconDatabase,
    IconDeviceDesktop,
    IconDeviceLaptop,
    IconX
} from '@tabler/icons-react';
import ParentCard from '@/app/components/shared/ParentCard';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store';
import axiosServices from '@/utils/axios';
import { AxiosError } from 'axios';
import useVirtualMachineStore from '@/store/useVirtualMachineStore';
import { useCreditCardStore } from '@/store/useCreditCardStore';

interface LandingProps {
    customerName: string;
}

const Landing: React.FC<LandingProps> = ({
    customerName
}) => {
    const router = useRouter();
    const theme = useTheme();
    const [openOSDialog, setOpenOSDialog] = useState(false);
    const [openFormDialog, setOpenFormDialog] = useState(false);
    const [selectedOS, setSelectedOS] = useState<'windows' | 'linux' | null>(null);
    const [vmName, setVmName] = useState('');
    const { user: authUser, token, primaryOrgId } = useAuthStore();
    const [region, setRegion] = useState('')
    const { setVmTemplates, vmTemplates } = useVirtualMachineStore();
    const [activeTemplate, setActiveTemplate] = useState<any>(null);
    const { hasLinkedCreditCard } = useCreditCardStore();

    const handleOSSelect = (os: 'windows' | 'linux') => {
        const tempSelectedObj = vmTemplates.find((template) => template.osType.toLowerCase().includes(os.toLowerCase()));
        setSelectedOS(os);
        setActiveTemplate(tempSelectedObj);
        setOpenOSDialog(false);
        setOpenFormDialog(true);
    };

    const handleFormSubmit = async () => {
        if (selectedOS) {
            const vmConfig: any = {
                ...vmTemplates.find((template: any) => template.id === activeTemplate.id),
                vmName // Add the VM name to the configuration
            };

            const res = await fetch('/api/get-ip');
            const { ip } = await res.json();

            try {
                const payload = {
                    customer: {
                        organisationId: primaryOrgId,
                        email: authUser?.email,
                        businessUnitId: 1,
                        attribute: `${authUser?.firstName} ${authUser?.lastName}`,
                        description: 'New Primary IT infrastructure client',
                        totalCost: 0,
                        status: 'Active',
                        loginUserEmail: authUser?.email,
                        loginUserName: `${authUser?.firstName} ${authUser?.lastName}`,
                    },
                    vms: [
                        {
                            vmName: vmConfig.vmName,
                            vmCpu: vmConfig.vcpus,
                            vmStorage: vmConfig.storage,
                            vmMemory: vmConfig.memory,
                            region,
                            storageType: vmConfig.type,
                            osType: vmConfig.osType.toLowerCase() === 'windows' ? 'Windows' : 'Linux',
                            templateName: vmConfig.description
                        }
                    ],
                    products: []
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
                        //     title: 'Successful!',
                        //     text: vmResponse?.data.message || `Your resources are currently being provisioned.`,
                        //     icon: 'success',
                        //     draggable: true,
                        // }).then((result: any) => {
                        //     if (result.isConfirmed) {
                        //         window.location.href = '/nlu/dashboards/customer';
                        //     }
                        // });
                    } else {
                        // Swal.fire({
                        //     title: 'Failed',
                        //     text: response?.data.message || 'An error occurred.',
                        //     icon: 'error',
                        //     draggable: true,
                        // });
                    }
                } else {
                    // Swal.fire({
                    //     title: 'Failed',
                    //     text: response?.data.message || 'An error occurred.',
                    //     icon: 'error',
                    //     draggable: true,
                    // });
                }
            } catch (error: unknown) {
                let errorMessage = 'An error occurred.';
                
                if (error instanceof AxiosError) {
                    errorMessage = error.response?.data?.message || error.message || 'An error occurred.';
                } else if (error instanceof Error) {
                    errorMessage = error.message;
                }
                
                // Swal.fire({
                //     title: 'Failed',
                //     text: errorMessage,
                //     icon: 'error',
                //     draggable: true,
                // });
            }
            setOpenFormDialog(false);
            setVmName('');
            setSelectedOS(null);
            setActiveTemplate(null);
        }
    };

    const actionButtons = [
        {
            title: 'Spin up a New VM',
            description: 'Create and configure your own virtual machine with our easy-to-use interface.',
            icon: <IconServer size={48} color={theme.palette.primary.main} />,
            onClick: () => router.push('/nlu/customer/virtual-machines'),
            color: theme.palette.primary.main
        },
        // Only show "Add Payment Method" if user hasn't linked a credit card
        ...(hasLinkedCreditCard ? [] : [{
            title: 'Add Payment Method',
            description: 'Set up your credit card details to enable seamless billing and service provisioning.',
            icon: <IconCreditCard size={48} color={theme.palette.secondary.main} />,
            onClick: () => router.push('/nlu/payments'),
            color: theme.palette.secondary.main
        }]),
        // Only show "Try a Free VM" if user has linked a credit card
        ...(hasLinkedCreditCard ? [{
            title: 'Try a Free VM',
            description: 'Experience our platform with a free trial virtual machine. No credit card required.',
            icon: <IconGift size={48} color={theme.palette.success.main} />,
            onClick: () => setOpenOSDialog(true),
            color: theme.palette.success.main
        }] : [])
    ];

    const renderOSOption = (os: 'windows' | 'linux', label: string, icon: React.ReactNode) => (
        <Paper
            elevation={0}
            sx={{
                p: 2,
                mb: 2,
                border: '1px solid',
                borderColor: selectedOS === os ? 'primary.main' : 'divider',
                borderRadius: 2,
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                    borderColor: 'primary.main',
                    backgroundColor: 'action.hover'
                }
            }}
            onClick={() => handleOSSelect(os)}
        >
            <Stack direction="row" spacing={2} alignItems="center">
                <Box sx={{ color: selectedOS === os ? 'primary.main' : 'text.secondary' }}>
                    {icon}
                </Box>
                <Box>
                    <Typography variant="h6">{label}</Typography>
                    <Typography variant="body2" color="text.secondary">
                        {os === 'windows' ? `Windows Server with 4GB RAM` : `Ubuntu Linux with 4GB RAM`}
                    </Typography>
                </Box>
            </Stack>
        </Paper>
    );

    const renderSpecItem = (icon: React.ReactNode, label: string, value: string) => (
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
            <Box sx={{ color: 'primary.main' }}>{icon}</Box>
            <Box>
                <Typography variant="body2" color="text.secondary">{label}</Typography>
                <Typography variant="body1">{value}</Typography>
            </Box>
        </Stack>
    );

    // Fetch products and terraform config on mount with axios and token
    useEffect(() => {
        const fetchData = async () => {
            try {
                if (!token) throw new Error('Authentication token not found');

                // Fetch terraform config
                const terraformResponse = await axiosServices.get(`${process.env.NEXT_PUBLIC_BACK_END_BASEURL}/api/terraform/getterraformconfig`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                setVmTemplates(terraformResponse.data.filter((template: any) => template.group == 'Free'));
            } catch (error: unknown) {
                console.error('Error fetching terraform config:', error);
                setVmTemplates([]);
            }
        };
        fetchData();
    }, [token, setVmTemplates]);

    return (
        <>
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <ParentCard>
                        <Box sx={{ textAlign: 'center', mb: 3 }}>
                            <Typography variant="h3" gutterBottom>
                                Welcome to Your Cloud Journey
                            </Typography>
                            <Typography variant="h6" color="textSecondary" sx={{ maxWidth: '800px', mx: 'auto' }}>
                                Get started with our cloud platform by choosing one of the options below.
                                We&apos;re here to help you every step of the way.
                            </Typography>
                        </Box>

                        <Grid container spacing={4} justifyContent="center">
                            {actionButtons.map((button, index) => (
                                <Grid item xs={12} md={4} key={index}>
                                    <Card
                                        sx={{
                                            height: '100%',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            transition: 'transform 0.2s, box-shadow 0.2s',
                                            backgroundColor: '#fafbfc',
                                            '&:hover': {
                                                transform: 'translateY(-4px)',
                                                boxShadow: theme.shadows[8]
                                            }
                                        }}
                                    >
                                        <CardContent sx={{
                                            flexGrow: 1,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            textAlign: 'center',
                                            p: 4
                                        }}>
                                            <Box sx={{ mb: 2 }}>
                                                {button.icon}
                                            </Box>
                                            <Typography variant="h5" gutterBottom>
                                                {button.title}
                                            </Typography>
                                            <Typography
                                                variant="body1"
                                                color="textSecondary"
                                                sx={{ mb: 3, flexGrow: 1 }}
                                            >
                                                {button.description}
                                            </Typography>
                                            <Button
                                                variant="contained"
                                                size="large"
                                                onClick={button.onClick}
                                                sx={{
                                                    backgroundColor: button.color,
                                                    '&:hover': {
                                                        backgroundColor: button.color,
                                                        opacity: 0.9
                                                    }
                                                }}
                                            >
                                                Get Started
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>

                        <Box sx={{ mt: 6, textAlign: 'center' }}>
                            <Typography variant="body1" color="textSecondary">
                                Need help getting started? Contact our support team for assistance.
                            </Typography>
                        </Box>
                    </ParentCard>
                </Grid>
            </Grid>

            {/* OS Selection Dialog */}
            <Dialog
                open={openOSDialog}
                onClose={() => setOpenOSDialog(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 2,
                        boxShadow: theme.shadows[8]
                    }
                }}
            >
                <DialogTitle sx={{
                    pb: 1,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <Typography variant="h5">Select Your Free VM</Typography>
                    <IconButton onClick={() => setOpenOSDialog(false)} size="small">
                        <IconX size={20} />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Choose your preferred operating system. Both options are completely free to use.
                    </Typography>
                    {renderOSOption('windows', 'Windows Server', <IconDeviceDesktop size={32} />)}
                    {renderOSOption('linux', 'Ubuntu Linux', <IconBrandUbuntu size={32} />)}
                </DialogContent>
            </Dialog>

            {/* VM Configuration Form Dialog */}
            <Dialog
                open={openFormDialog}
                onClose={() => setOpenFormDialog(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 2,
                        boxShadow: theme.shadows[8]
                    }
                }}
            >
                <DialogTitle sx={{
                    pb: 1,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <Typography variant="h5">Configure Your Free VM</Typography>
                    <IconButton onClick={() => setOpenFormDialog(false)} size="small">
                        <IconX size={20} />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    {selectedOS && (
                        <Box sx={{ mt: 2 }}>
                            <TextField
                                fullWidth
                                label="VM Name"
                                value={vmName}
                                onChange={(e) => setVmName(e.target.value)}
                                sx={{ mb: 3 }}
                                placeholder="Enter a name for your virtual machine"
                                helperText="This name will be used to identify your VM"
                            />

                            <FormControl fullWidth>
                                <InputLabel id='region-label'>Choose Region</InputLabel>
                                <Select
                                    labelId='region-label'
                                    label="Choose Region"
                                    value={region}
                                    onChange={(e) => setRegion(e.target.value)}
                                >
                                    <MenuItem value='JHB3'>Johannesburg</MenuItem>
                                    <MenuItem value='CPT3'>Cape Town</MenuItem>
                                </Select>
                            </FormControl>
                            <Typography variant="body2" ml={2} fontSize={12} mb={3} mt={1}>
                                This will be your virtual machine&apos;s deployment region
                            </Typography>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 3,
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    borderRadius: 2,
                                    backgroundColor: 'background.default'
                                }}
                            >
                                <Typography variant="h6" gutterBottom>
                                    VM Specifications
                                </Typography>
                                <Divider sx={{ mb: 2 }} />

                                {renderSpecItem(
                                    <IconDeviceDesktop size={24} />,
                                    'Operating System',
                                    activeTemplate.osType
                                )}
                                {renderSpecItem(
                                    <IconCpu size={24} />,
                                    'vCPUs',
                                    `${activeTemplate.vcpus} cores @ ${activeTemplate.ghz}`
                                )}
                                {renderSpecItem(
                                    <IconDeviceLaptop size={24} />,
                                    'Memory',
                                    `${activeTemplate.memory} GB RAM`
                                )}
                                {renderSpecItem(
                                    <IconDatabase size={24} />,
                                    'Storage',
                                    `${activeTemplate.storage} GB ${activeTemplate.type}`
                                )}
                            </Paper>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ px: 3, py: 2 }}>
                    <Button
                        onClick={() => setOpenFormDialog(false)}
                        variant="outlined"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleFormSubmit}
                        variant="contained"
                        disabled={!vmName.trim()}
                        startIcon={<IconServer size={20} />}
                    >
                        Create VM
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default Landing;
