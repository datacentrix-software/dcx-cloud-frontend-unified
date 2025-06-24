'use client';
import React, { useEffect, useState } from 'react';
import { 
    Box, 
    Typography, 
    Grid, 
    Paper, 
    Table, 
    TableBody, 
    TableCell, 
    TableContainer, 
    TableHead, 
    TableRow, 
    TablePagination,
    Tabs,
    Tab,
    Button,
    Card,
    CardContent,
    IconButton,
    Stack,
    TableSortLabel,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    TextField,
    CircularProgress,
    Tooltip
} from '@mui/material';
import { 
    IconServer, 
    IconCpu, 
    IconDatabase, 
    IconDownload,
    IconPlus,
    IconInfoCircle,
    IconPower
} from '@tabler/icons-react';
import ParentCard from '@/app/components/shared/ParentCard';
import WelcomeCard from './customer-welcome-card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, LineChart, Line, Area } from 'recharts';
import axios from 'axios';
import { useAuthStore } from '@/store';
import { useRouter } from 'next/navigation';
import VMDataComponent from './components/VMData';
import Billing from './components/Billing';
import VMDataIndividual from './components/VMDataIndividual';
import Landing from './components/Landing';

interface Product {
    id: number;
    title: string;
    price: number | null;
    cost: number | null;
    profit: number | null;
    SubCategory: {
        name: string;
    };
    units: number;
}

interface BillingData {
    org_name: string;
    "Memory GB": string;
    "CPU Cores": string;
    "Disk Capacity TB": string;
}

interface BillingHistory {
    id: string;
    date: string;
    amount: number;
    status: 'Paid' | 'Pending' | 'Overdue';
    invoiceNumber: string;
}

interface PastBill {
    organisation: string;
    cost_estimate: string;
    billing_month: string;
}

interface LineItem {
    organisation: string;
    vm_name: string;
    uuid: string;
    vcpus: number;
    memory_size: number;
    guest_os: string;
    total_hours: number;
    cost_estimate: string;
    billing_month: string;
}

interface LineItemSortConfig {
    key: keyof LineItem;
    direction: 'asc' | 'desc';
}

interface LineItemFilter {
    vmName: string;
    os: string;
    minVcpus: string;
    maxVcpus: string;
    minMemory: string;
    maxMemory: string;
    minHours: string;
    maxHours: string;
}

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`dashboard-tabpanel-${index}`}
            aria-labelledby={`dashboard-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

interface ServiceCategory {
    value: string;
    label: string;
}

const SERVICE_CATEGORIES: ServiceCategory[] = [
    { value: 'all', label: 'All Categories' },
    { value: 'managed services', label: 'Managed Services' },
    { value: 'cloud services', label: 'Cloud Services' },
    { value: 'enetworks', label: 'eNetworks' }
];

interface VMSortConfig {
    key: string;
    direction: 'asc' | 'desc';
}

interface VMDataItem {
    identity_instance_uuid: string;
    org_name: string;
    identity_name: string;
    memory: string;
    cpu: number;
    os: string;
    "Powered on hours": string;
    cost_estimate: string;
    license_cost: string;
    vcenter_region: string;
}

interface VMTelemetry {
    org_name: string;
    identity_name: string;
    identity_instance_uuid: string;
    guest_os: string;
    power_state: string;
    cpu_count: number;
    cpu_cores_per_socket: number;
    memory_size_mib: number;
    cpu_usage_avg: string;
    cpu_demand_mhz: number | null;
    memory_usage_avg: string;
    memory_consumed_avg: string;
    cpu_workload: string;
    mem_workload: string;
    badge_health: string;
    badge_health_guidance: string;
    badge_workload: string;
    badge_workload_guidance: string;
    badge_risk: string;
    badge_risk_guidance: string;
    diskspace_used: string;
    onlinecapacityanalytics_cpu_timeremaining: string;
    onlinecapacityanalytics_mem_timeremaining: string;
    onlinecapacityanalytics_diskspace_timeremaining: string;
    systemattributes_alert_count_critical: string;
    systemattributes_alert_count_warning: string;
    systemattributes_total_alert_count: string;
    systemattributes_health: string;
}

interface VMNetworkData {
    identity_instance_uuid: string;
    identity_name: string;
    avg_net_usage_kbps: string;
    avg_net_received_kbps: string;
    avg_net_transmit_kbps: string;
    interval_start: string;
}

interface VMCpuRamData {
    identity_instance_uuid: string;
    identity_name: string;
    interval_start: string;
    cpu_usage_avg: string;
    memory_usage_avg: string;
    memory_consumed_avg: string;
}

interface VMDiskData {
    identity_instance_uuid: string;
    identity_name: string;
    interval_start: string;
    avg_diskspace_used: string;
    avg_diskspace_provisioned: string;
    avg_disk_usage_percent: string;
}

interface VMAlertWindow {
    identity_instance_uuid: string;
    bucket: string;
    avg_info: string;
    avg_warning: string;
    avg_immediate: string;
    avg_critical: string;
}

interface VMHealthWindow {
    identity_instance_uuid: string;
    identity_name: string;
    avg_badge_health: string;
    avg_badge_workload: string;
    avg_badge_efficiency: string;
    badge_health_status: string;
    badge_workload_status: string;
    badge_efficiency_status: string;
}

interface VMFilter {
    os: string;
    minMemory: string;
    maxMemory: string;
    minCpu: string;
    maxCpu: string;
}

interface Organization {
    id: number;
    organisation_name: string;
    organisation_type: string | null;
    country: string | null;
    vat_number: string | null;
    company_registration_number: string | null;
    registered_address: string | null;
    billing_contact_email: string | null;
    po_required: boolean | null;
    payment_method: string;
    org_description: string | null;
    salesperson_id: number | null;
    msa_accepted: boolean;
    msa_version_id: number | null;
    vcenterOrg_id: string | null;
    organisation_status: string;
    created_at: string;
    updatedAt: string;
    email: string | null;
    msa_accepted_at: string | null;
}

const CustomerDashboard = () => {
    // State for API data
    const [products, setProducts] = useState<Product[]>([]);
    const [billingData, setBillingData] = useState<BillingData | null>(null);
    const [vmData, setVmData] = useState<VMDataItem[]>([]);
    const [selectedVM, setSelectedVM] = useState<VMDataItem | null>(null);
    const [vmTelemetry, setVmTelemetry] = useState<VMTelemetry | null>(null);
    const [vmNetworkData, setVmNetworkData] = useState<VMNetworkData[]>([]);
    const [vmCpuRamData, setVmCpuRamData] = useState<VMCpuRamData[]>([]);
    const [vmDiskData, setVmDiskData] = useState<VMDiskData[]>([]);
    const [vmAlertWindow, setVmAlertWindow] = useState<VMAlertWindow[]>([]);
    const [vmHealthWindow, setVmHealthWindow] = useState<VMHealthWindow[]>([]);
    const [pastBills, setPastBills] = useState<PastBill[]>([]);
    const [lineItems, setLineItems] = useState<LineItem[]>([]);
    const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
    const [customerName, setCustomerName] = useState<string>('');
    const [vcenterOrgId, setVcenterOrgId] = useState<number | null>(null);

    // State for loading
    const [loading, setLoading] = useState(true);
    const [loadingTelemetry, setLoadingTelemetry] = useState(false);
    const [loadingLineItems, setLoadingLineItems] = useState(false);
    const [isPowerActionLoading, setIsPowerActionLoading] = useState(false);

    // State for UI
    const [currentTab, setCurrentTab] = useState(0);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [productOrderBy, setProductOrderBy] = useState<keyof Product>('title');
    const [productOrder, setProductOrder] = useState<'asc' | 'desc'>('asc');
    const [vmPage, setVmPage] = useState(0);
    const [vmRowsPerPage, setVmRowsPerPage] = useState(5);
    const [vmSortConfig, setVmSortConfig] = useState<VMSortConfig>({ key: 'identity_name', direction: 'asc' });
    const [vmFilter, setVmFilter] = useState<VMFilter>({
        os: '',
        minMemory: '',
        maxMemory: '',
        minCpu: '',
        maxCpu: ''
    });
    const [lineItemPage, setLineItemPage] = useState(0);
    const [lineItemRowsPerPage, setLineItemRowsPerPage] = useState(10);
    const [lineItemSortConfig, setLineItemSortConfig] = useState<LineItemSortConfig>({ key: 'vm_name', direction: 'asc' });
    const [lineItemFilter, setLineItemFilter] = useState<LineItemFilter>({
        vmName: '',
        os: '',
        minVcpus: '',
        maxVcpus: '',
        minMemory: '',
        maxMemory: '',
        minHours: '',
        maxHours: ''
    });
    const [isVMPoweredOn, setIsVMPoweredOn] = useState(false);

    const token = useAuthStore((state) => state.token);
    const user = useAuthStore((state) => state.user);
    const router = useRouter();
    const isNewCustomer = !vcenterOrgId;

    // Fetch organization data
    useEffect(() => {
        const fetchOrganizationData = async () => {
            if (!user?.userOrganisations[0]?.organisation.id) return;
            
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_BACK_END_BASEURL}/api/organisations/getorg`, {
                    headers: { Authorization: `Bearer ${token}` },
                    params: { id: user?.userOrganisations[0]?.organisation.id }
                });
                
                if (response.data) {
                    setCustomerName(response.data.organisation_name);
                    setVcenterOrgId(response.data.vcenterOrg_id);
                }
            } catch (error) {
                console.error('Error fetching organization data:', error);
            }
        };

        fetchOrganizationData();
    }, [user?.userOrganisations[0]?.organisation.id, token]);

    // Fetch initial data
    useEffect(() => {
        const fetchData = async () => {
            if (!customerName) return; // Don't fetch data until we have the customer name
            
            try {
                console.log('Fetching data...');
                const productsResponse = await axios.get(`${process.env.NEXT_PUBLIC_BACK_END_BASEURL}/api/products/getproducts`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                if (Array.isArray(productsResponse.data)) {
                    setProducts(productsResponse.data);
                }

                try {
                    // Fetch metrics aggregation
                    const metricsResponse = await axios.get(`${process.env.NEXT_PUBLIC_BRONZE_BASEURL}/api/cloud/metricAggregation`, {
                        headers: { Authorization: `Bearer ${token}` },
                        params: { customer: customerName }
                    });
                    if (Array.isArray(metricsResponse.data) && metricsResponse.data.length > 0) {
                        setBillingData(metricsResponse.data[0]);
                    }

                    // Fetch current bill data
                    const billingResponse = await axios.get(`${process.env.NEXT_PUBLIC_BRONZE_BASEURL}/api/cloud/currentBill`, {
                        headers: { Authorization: `Bearer ${token}` },
                        params: { customer: customerName }
                    });
                    if (Array.isArray(billingResponse.data)) {
                        setVmData(billingResponse.data);
                    }

                    // Fetch past bills
                    const pastBillsResponse = await axios.get(`${process.env.NEXT_PUBLIC_BRONZE_BASEURL}/api/cloud/afgriPastBills`, {
                        headers: { Authorization: `Bearer ${token}` },
                        params: { customer: customerName }
                    });
                    if (Array.isArray(pastBillsResponse.data)) {
                        setPastBills(pastBillsResponse.data);
                    }
                } catch (error) {
                    console.error('Error fetching data:', error);
                }

                setLoading(false);
            } catch (error) {
                console.error('Error fetching products:', error);
                setLoading(false);
            }
        };

        if (token && customerName) {
            fetchData();
        }
    }, [token, customerName]);

    // Event handlers
    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setCurrentTab(newValue);
    };

    const handleCategoryChange = (event: any) => {
        setSelectedCategory(event.target.value);
        setPage(0);
    };

    const handleProductSort = (property: keyof Product) => {
        const isAsc = productOrderBy === property && productOrder === 'asc';
        setProductOrder(isAsc ? 'desc' : 'asc');
        setProductOrderBy(property);
    };

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleVmSort = (key: string) => {
        setVmSortConfig(current => ({
            key,
            direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const handleVmPageChange = (event: unknown, newPage: number) => {
        setVmPage(newPage);
    };

    const handleVmRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setVmRowsPerPage(parseInt(event.target.value, 10));
        setVmPage(0);
    };

    const handleVmFilterChange = (field: keyof VMFilter, value: string) => {
        setVmFilter(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleVMClick = async (vm: VMDataItem) => {
        setSelectedVM(vm);
        setCurrentTab(2); // Switch to VM Data Individual tab (index 2)
        setLoadingTelemetry(true);
        
        try {
            const [telemetryResponse, networkResponse, cpuRamResponse, diskResponse, alertWindowResponse, healthWindowResponse] = await Promise.all([
                axios.get(`${process.env.NEXT_PUBLIC_BRONZE_BASEURL}/api/cloud/vmTelemetry`, {
                    headers: { Authorization: `Bearer ${token}` },
                    params: { uuid: vm.identity_instance_uuid }
                }),
                axios.get(`${process.env.NEXT_PUBLIC_BRONZE_BASEURL}/api/cloud/vmNetworkWindow`, {
                    headers: { Authorization: `Bearer ${token}` },
                    params: { uuid: vm.identity_instance_uuid }
                }),
                axios.get(`${process.env.NEXT_PUBLIC_BRONZE_BASEURL}/api/cloud/vmCpuRamWindow`, {
                    headers: { Authorization: `Bearer ${token}` },
                    params: { uuid: vm.identity_instance_uuid }
                }),
                axios.get(`${process.env.NEXT_PUBLIC_BRONZE_BASEURL}/api/cloud/vmDiskWindow`, {
                    headers: { Authorization: `Bearer ${token}` },
                    params: { uuid: vm.identity_instance_uuid }
                }),
                axios.get(`${process.env.NEXT_PUBLIC_BRONZE_BASEURL}/api/cloud/vmAlertWindow`, {
                    headers: { Authorization: `Bearer ${token}` },
                    params: { uuid: vm.identity_instance_uuid }
                }),
                axios.get(`${process.env.NEXT_PUBLIC_BRONZE_BASEURL}/api/cloud/vmHealthWindow`, {
                    headers: { Authorization: `Bearer ${token}` },
                    params: { uuid: vm.identity_instance_uuid }
                })
            ]);
            
            if (Array.isArray(telemetryResponse.data) && telemetryResponse.data.length > 0) {
                setVmTelemetry(telemetryResponse.data[0]);
            }
            
            if (Array.isArray(networkResponse.data)) {
                setVmNetworkData(networkResponse.data);
            }

            if (Array.isArray(cpuRamResponse.data)) {
                setVmCpuRamData(cpuRamResponse.data);
            }

            if (Array.isArray(diskResponse.data)) {
                setVmDiskData(diskResponse.data);
            }

            if (Array.isArray(alertWindowResponse.data)) {
                setVmAlertWindow(alertWindowResponse.data);
            }

            if (Array.isArray(healthWindowResponse.data)) {
                setVmHealthWindow(healthWindowResponse.data);
            }
        } catch (error) {
            console.error('Error fetching VM data:', error);
        } finally {
            setLoadingTelemetry(false);
        }
    };

    const handleMonthClick = async (month: string) => {
        setSelectedMonth(month);
        setLoadingLineItems(true);
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_BRONZE_BASEURL}/api/cloud/afgriLineItems`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { month: month }
            });
            if (Array.isArray(response.data)) {
                setLineItems(response.data);
            }
        } catch (error) {
            console.error('Error fetching line items:', error);
        } finally {
            setLoadingLineItems(false);
        }
    };

    const handleLineItemSort = (key: keyof LineItem) => {
        setLineItemSortConfig(current => ({
            key,
            direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const handleLineItemFilterChange = (field: keyof LineItemFilter, value: string) => {
        setLineItemFilter(prev => ({ ...prev, [field]: value }));
        setLineItemPage(0);
    };

    const handleLineItemPageChange = (event: unknown, newPage: number) => {
        setLineItemPage(newPage);
    };

    const handleLineItemRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setLineItemRowsPerPage(parseInt(event.target.value, 10));
        setLineItemPage(0);
    };

    const handleVMPowerToggle = async () => {
        if (!selectedVM) return;
        
        setIsPowerActionLoading(true);
        try {
            const newPowerState = !isVMPoweredOn;
            await axios.post(`${process.env.NEXT_PUBLIC_BRONZE_BASEURL}/api/cloud/vmPower`, {
                uuid: selectedVM.identity_instance_uuid,
                powerState: newPowerState ? 'on' : 'off'
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setIsVMPoweredOn(newPowerState);
        } catch (error) {
            console.error('Error toggling VM power state:', error);
        } finally {
            setIsPowerActionLoading(false);
        }
    };

    // Filter and sort the products
    const filteredAndSortedProducts = React.useMemo(() => {
        let filtered = products.filter(product => {
            if (!product || !product.SubCategory) return false;
            const categoryName = product.SubCategory.name?.toLowerCase() || '';
            const title = product.title?.toLowerCase() || '';
            return categoryName.includes('cloud') ||
                title.includes('cloud') ||
                categoryName.includes('iaas') ||
                categoryName.includes('infrastructure as a service') ||
                categoryName.includes('domains') ||
                categoryName.includes('managed services');
        });

        if (selectedCategory !== 'all') {
            filtered = filtered.filter(product => 
                product.SubCategory?.name?.toLowerCase().includes(selectedCategory.toLowerCase())
            );
        }

        return [...filtered].sort((a, b) => {
            if (productOrderBy === 'price' || productOrderBy === 'cost' || productOrderBy === 'profit') {
                const aValue = Number(a[productOrderBy]) || 0;
                const bValue = Number(b[productOrderBy]) || 0;
                return productOrder === 'asc' ? aValue - bValue : bValue - aValue;
            }

            if (productOrderBy === 'SubCategory') {
                const aValue = a.SubCategory?.name || '';
                const bValue = b.SubCategory?.name || '';
                return productOrder === 'asc'
                    ? aValue.localeCompare(bValue)
                    : bValue.localeCompare(aValue);
            }

            const aValue = String(a[productOrderBy] || '').toLowerCase();
            const bValue = String(b[productOrderBy] || '').toLowerCase();

            return productOrder === 'asc'
                ? aValue.localeCompare(bValue)
                : bValue.localeCompare(aValue);
        });
    }, [products, selectedCategory, productOrderBy, productOrder]);

    // Get paginated data
    const paginatedProducts = filteredAndSortedProducts.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    // Filter and sort VM data
    const filteredAndSortedVMs = React.useMemo(() => {
        if (!Array.isArray(vmData)) return [];

        let filtered = [...vmData];

        if (vmFilter.os) {
            filtered = filtered.filter(vm => 
                vm.os.toLowerCase().includes(vmFilter.os.toLowerCase())
            );
        }
        if (vmFilter.minMemory) {
            filtered = filtered.filter(vm => 
                parseInt(vm.memory) >= parseInt(vmFilter.minMemory)
            );
        }
        if (vmFilter.maxMemory) {
            filtered = filtered.filter(vm => 
                parseInt(vm.memory) <= parseInt(vmFilter.maxMemory)
            );
        }
        if (vmFilter.minCpu) {
            filtered = filtered.filter(vm => 
                vm.cpu >= parseInt(vmFilter.minCpu)
            );
        }
        if (vmFilter.maxCpu) {
            filtered = filtered.filter(vm => 
                vm.cpu <= parseInt(vmFilter.maxCpu)
            );
        }

        return filtered.sort((a, b) => {
            const aValue = a[vmSortConfig.key as keyof VMDataItem];
            const bValue = b[vmSortConfig.key as keyof VMDataItem];

            if (typeof aValue === 'number' && typeof bValue === 'number') {
                return vmSortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
            }

            if (vmSortConfig.key === 'memory') {
                const aNum = parseInt(aValue as string);
                const bNum = parseInt(bValue as string);
                return vmSortConfig.direction === 'asc' ? aNum - bNum : bNum - aNum;
            }

            const aString = String(aValue || '').toLowerCase();
            const bString = String(bValue || '').toLowerCase();

            return vmSortConfig.direction === 'asc'
                ? aString.localeCompare(bString)
                : bString.localeCompare(aString);
        });
    }, [vmData, vmSortConfig, vmFilter]);

    // Get paginated VMs
    const paginatedVMs = filteredAndSortedVMs.slice(
        vmPage * vmRowsPerPage,
        vmPage * vmRowsPerPage + vmRowsPerPage
    );

    // Filter and sort line items
    const filteredAndSortedLineItems = React.useMemo(() => {
        let filtered = [...lineItems];

        if (lineItemFilter.vmName) {
            filtered = filtered.filter(item => 
                item.vm_name.toLowerCase().includes(lineItemFilter.vmName.toLowerCase())
            );
        }
        if (lineItemFilter.os) {
            filtered = filtered.filter(item => 
                item.guest_os.toLowerCase().includes(lineItemFilter.os.toLowerCase())
            );
        }
        if (lineItemFilter.minVcpus) {
            filtered = filtered.filter(item => 
                item.vcpus >= parseInt(lineItemFilter.minVcpus)
            );
        }
        if (lineItemFilter.maxVcpus) {
            filtered = filtered.filter(item => 
                item.vcpus <= parseInt(lineItemFilter.maxVcpus)
            );
        }
        if (lineItemFilter.minMemory) {
            filtered = filtered.filter(item => 
                item.memory_size >= parseInt(lineItemFilter.minMemory)
            );
        }
        if (lineItemFilter.maxMemory) {
            filtered = filtered.filter(item => 
                item.memory_size <= parseInt(lineItemFilter.maxMemory)
            );
        }
        if (lineItemFilter.minHours) {
            filtered = filtered.filter(item => 
                item.total_hours >= parseInt(lineItemFilter.minHours)
            );
        }
        if (lineItemFilter.maxHours) {
            filtered = filtered.filter(item => 
                item.total_hours <= parseInt(lineItemFilter.maxHours)
            );
        }

        return filtered.sort((a, b) => {
            const aValue = a[lineItemSortConfig.key];
            const bValue = b[lineItemSortConfig.key];

            if (typeof aValue === 'number' && typeof bValue === 'number') {
                return lineItemSortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
            }

            if (lineItemSortConfig.key === 'cost_estimate') {
                const aNum = Number(aValue);
                const bNum = Number(bValue);
                return lineItemSortConfig.direction === 'asc' ? aNum - bNum : bNum - aNum;
            }

            const aString = String(aValue || '').toLowerCase();
            const bString = String(bValue || '').toLowerCase();

            return lineItemSortConfig.direction === 'asc'
                ? aString.localeCompare(bString)
                : bString.localeCompare(aString);
        });
    }, [lineItems, lineItemSortConfig, lineItemFilter]);

    // Get paginated line items
    const paginatedLineItems = filteredAndSortedLineItems.slice(
        lineItemPage * lineItemRowsPerPage,
        lineItemPage * lineItemRowsPerPage + lineItemRowsPerPage
    );

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Typography>Loading...</Typography>
            </Box>
        );
    }

    return (
        <>
            <WelcomeCard />
            <Box sx={{ mb: 4 }} />

            {!isNewCustomer && (
                <Tabs 
                    value={currentTab} 
                    onChange={handleTabChange} 
                    sx={{ 
                        mb: 3,
                        '& .MuiTabs-flexContainer': {
                            gap: 2,
                            justifyContent: 'flex-start'
                        },
                        '& .MuiTabs-indicator': {
                            display: 'none'
                        },
                        '& .MuiTab-root': {
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 1,
                            minWidth: 150,
                            textTransform: 'none',
                            backgroundColor: 'white',
                            '&.Mui-selected': {
                                backgroundColor: 'primary.main',
                                color: 'white',
                                borderColor: 'primary.main',
                                '&:hover': {
                                    backgroundColor: 'primary.dark',
                                }
                            },
                            '&:hover': {
                                backgroundColor: 'grey.100',
                            }
                        }
                    }}
                >
                    <Tab label="VM Data" />
                    <Tab label="Billing" />
                    <Tab label="VM Data Individual" />
                </Tabs>
            )}

            {isNewCustomer ? (
                <Landing customerName={customerName} />
            ) : (
                <>
                    <TabPanel value={currentTab} index={0}>
                        <VMDataComponent 
                            vmData={vmData}
                            vmFilter={vmFilter}
                            vmSortConfig={vmSortConfig}
                            vmPage={vmPage}
                            vmRowsPerPage={vmRowsPerPage}
                            paginatedVMs={paginatedVMs}
                            filteredAndSortedVMs={filteredAndSortedVMs}
                            billingData={billingData}
                            onVmSort={handleVmSort}
                            onVmPageChange={handleVmPageChange}
                            onVmRowsPerPageChange={handleVmRowsPerPageChange}
                            onVmFilterChange={handleVmFilterChange}
                            onVMClick={handleVMClick}
                        />
                    </TabPanel>

                    <TabPanel value={currentTab} index={1}>
                        <Billing 
                            billingData={billingData}
                            vmData={vmData}
                            pastBills={pastBills}
                            selectedMonth={selectedMonth}
                            lineItems={lineItems}
                            loadingLineItems={loadingLineItems}
                            lineItemPage={lineItemPage}
                            lineItemRowsPerPage={lineItemRowsPerPage}
                            lineItemSortConfig={lineItemSortConfig}
                            lineItemFilter={lineItemFilter}
                            paginatedLineItems={paginatedLineItems}
                            filteredAndSortedLineItems={filteredAndSortedLineItems}
                            onMonthClick={handleMonthClick}
                            onLineItemSort={handleLineItemSort}
                            onLineItemFilterChange={handleLineItemFilterChange}
                            onLineItemPageChange={handleLineItemPageChange}
                            onLineItemRowsPerPageChange={handleLineItemRowsPerPageChange}
                        />
                    </TabPanel>

                    <TabPanel value={currentTab} index={2}>
                        <VMDataIndividual 
                            selectedVM={selectedVM}
                            vmTelemetry={vmTelemetry}
                            vmNetworkData={vmNetworkData}
                            vmCpuRamData={vmCpuRamData}
                            vmDiskData={vmDiskData}
                            vmAlertWindow={vmAlertWindow}
                            vmHealthWindow={vmHealthWindow}
                            loadingTelemetry={loadingTelemetry}
                            isVMPoweredOn={isVMPoweredOn}
                            isPowerActionLoading={isPowerActionLoading}
                            onVMPowerToggle={handleVMPowerToggle}
                        />
                    </TabPanel>
                </>
            )}
        </>
    );
};

export default CustomerDashboard; 