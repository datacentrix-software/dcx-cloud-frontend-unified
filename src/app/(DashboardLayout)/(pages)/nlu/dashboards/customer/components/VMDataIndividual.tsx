'use client';
import React, { useState } from 'react';
import {
    Box,
    Typography,
    Grid,
    Paper,
    CircularProgress,
    Button,
    Stack,
    Tooltip,
    Popover,
    IconButton,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    TextField
} from '@mui/material';
import { IconServer, IconCpu, IconDatabase, IconPower, IconInfoCircle, IconX, IconChartLine, IconBulb, IconArrowUp, IconDownload, IconCalendar, IconClock } from '@tabler/icons-react';
import ParentCard from '@/app/components/shared/ParentCard';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, Area, BarChart, Bar } from 'recharts';

interface VMData {
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
    vcenter_region: string;
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
    avg_cpu_usage_percent: string;
    avg_memory_usage_percent: string;
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

interface VMDataIndividualProps {
    selectedVM: VMData | null;
    vmTelemetry: VMTelemetry | null;
    vmNetworkData: VMNetworkData[];
    vmCpuRamData: VMCpuRamData[];
    vmDiskData: VMDiskData[];
    vmAlertWindow: VMAlertWindow[];
    vmHealthWindow: VMHealthWindow[];
    loadingTelemetry: boolean;
    isVMPoweredOn: boolean;
    isPowerActionLoading: boolean;
    onVMPowerToggle: () => void;
}

const VMDataIndividual: React.FC<VMDataIndividualProps> = ({
    selectedVM,
    vmTelemetry,
    vmNetworkData,
    vmCpuRamData,
    vmDiskData,
    vmAlertWindow,
    vmHealthWindow,
    loadingTelemetry,
    isVMPoweredOn,
    isPowerActionLoading,
    onVMPowerToggle
}) => {
    const [isHealthInfoVisible, setIsHealthInfoVisible] = useState(true);
    const [isNetworkInfoVisible, setIsNetworkInfoVisible] = useState(true);
    const [isAlertInfoVisible, setIsAlertInfoVisible] = useState(true);
    const [isCpuInfoVisible, setIsCpuInfoVisible] = useState(true);
    const [isMemoryInfoVisible, setIsMemoryInfoVisible] = useState(true);
    const [isDiskInfoVisible, setIsDiskInfoVisible] = useState(true);

    // Historic data viewing state - separate for each graph
    const [networkTimeRange, setNetworkTimeRange] = useState('24h');
    const [networkCustomStartDate, setNetworkCustomStartDate] = useState('');
    const [networkCustomEndDate, setNetworkCustomEndDate] = useState('');
    const [showNetworkCustomDateRange, setShowNetworkCustomDateRange] = useState(false);

    const [cpuTimeRange, setCpuTimeRange] = useState('24h');
    const [cpuCustomStartDate, setCpuCustomStartDate] = useState('');
    const [cpuCustomEndDate, setCpuCustomEndDate] = useState('');
    const [showCpuCustomDateRange, setShowCpuCustomDateRange] = useState(false);

    const [memoryTimeRange, setMemoryTimeRange] = useState('24h');
    const [memoryCustomStartDate, setMemoryCustomStartDate] = useState('');
    const [memoryCustomEndDate, setMemoryCustomEndDate] = useState('');
    const [showMemoryCustomDateRange, setShowMemoryCustomDateRange] = useState(false);

    const [diskTimeRange, setDiskTimeRange] = useState('24h');
    const [diskCustomStartDate, setDiskCustomStartDate] = useState('');
    const [diskCustomEndDate, setDiskCustomEndDate] = useState('');
    const [showDiskCustomDateRange, setShowDiskCustomDateRange] = useState(false);

    const [alertTimeRange, setAlertTimeRange] = useState('24h');
    const [alertCustomStartDate, setAlertCustomStartDate] = useState('');
    const [alertCustomEndDate, setAlertCustomEndDate] = useState('');
    const [showAlertCustomDateRange, setShowAlertCustomDateRange] = useState(false);

    // Network graph line visibility states
    const [showTotalUsage, setShowTotalUsage] = useState(true);
    const [showReceived, setShowReceived] = useState(true);
    const [showTransmitted, setShowTransmitted] = useState(true);
    
    // Alert graph line visibility states
    const [showCriticalAlerts, setShowCriticalAlerts] = useState(true);
    const [showImmediateAlerts, setShowImmediateAlerts] = useState(true);
    const [showWarningAlerts, setShowWarningAlerts] = useState(true);
    
    // Graph section refs for scrolling
    const cpuGraphRef = React.useRef<HTMLDivElement | null>(null);
    const memoryGraphRef = React.useRef<HTMLDivElement | null>(null);
    const diskGraphRef = React.useRef<HTMLDivElement | null>(null);
    const overviewCardsRef = React.useRef<HTMLDivElement | null>(null);
    
    // Track which graph user navigated to
    const [activeGraph, setActiveGraph] = useState<'cpu' | 'memory' | 'disk' | null>(null);
    
    // Scroll to graph section
    const scrollToGraph = (ref: React.RefObject<HTMLDivElement | null>, graphType: 'cpu' | 'memory' | 'disk') => {
        const element = ref.current;
        if (element) {
            const headerHeight = 120; // Account for header + margin + padding
            const elementPosition = element.offsetTop - headerHeight;
            
            setActiveGraph(graphType);
            
            window.scrollTo({
                top: elementPosition,
                behavior: 'smooth'
            });
        }
    };
    
    // Scroll back to overview cards
    const scrollToOverview = () => {
        const element = overviewCardsRef.current;
        if (element) {
            const headerHeight = 120;
            const elementPosition = element.offsetTop - headerHeight;
            
            setActiveGraph(null);
            
            window.scrollTo({
                top: elementPosition,
                behavior: 'smooth'
            });
        }
    };

    // CSV Export function for network data
    const exportNetworkDataToCSV = () => {
        if (!vmNetworkData || vmNetworkData.length === 0) {
            alert('No network data available to export');
            return;
        }

        // Create CSV content with all fields quoted
        const headers = ['Time', 'Total Usage (kbps)', 'Data Received (kbps)', 'Data Sent (kbps)'];
        const csvContent = [
            headers.map(h => `"${h}"`).join(','),
            ...vmNetworkData.map(data => [
                new Date(data.interval_start).toLocaleString(),
                parseFloat(data.avg_net_usage_kbps).toFixed(2),
                parseFloat(data.avg_net_received_kbps).toFixed(2),
                parseFloat(data.avg_net_transmit_kbps).toFixed(2)
            ].map(field => `"${field}"`).join(','))
        ].join('\n');

        // Create and download file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `DaaS App- Network Usage-${selectedVM?.identity_name || 'vm'}-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Parse values for health, workload, and efficiency
    const healthValue = vmHealthWindow.length > 0 ? parseFloat(vmHealthWindow[0].avg_badge_health) : 0;
    const workloadValue = vmHealthWindow.length > 0 ? parseFloat(vmHealthWindow[0].avg_badge_workload) : 0;
    const efficiencyValue = vmHealthWindow.length > 0 ? parseFloat(vmHealthWindow[0].avg_badge_efficiency) : 0;

    // Color logic functions
    const getHealthColor = (val: number) => val >= 75 ? '#4caf50' : val >= 50 ? '#ff9800' : '#f44336';
    const getEfficiencyColor = (val: number) => val >= 75 ? '#4caf50' : val >= 50 ? '#ff9800' : '#f44336';
    const getWorkloadColor = (val: number) => val < 60 ? '#4caf50' : val < 80 ? '#ff9800' : '#f44336';

    // --- DUMMY DATA FOR REV COUNTERS (for visual testing) ---
    // Comment out the real calculations and use these values to showcase RAG states
    // const avgCritical = vmAlertWindow.length > 0 ? Math.round(
    //   vmAlertWindow.reduce((sum, d) => sum + parseFloat(d.avg_critical), 0) / vmAlertWindow.length
    // ) : 0;
    // const avgImmediate = vmAlertWindow.length > 0 ? Math.round(
    //   vmAlertWindow.reduce((sum, d) => sum + parseFloat(d.avg_immediate), 0) / vmAlertWindow.length
    // ) : 0;
    // const avgWarning = vmAlertWindow.length > 0 ? Math.round(
    //   vmAlertWindow.reduce((sum, d) => sum + parseFloat(d.avg_warning), 0) / vmAlertWindow.length
    // ) : 0;
    // const avgTotal = avgCritical + avgImmediate + avgWarning;
    const avgCritical = 0;    // Green
    const avgImmediate = 2;  // Amber
    const avgWarning = 5;    // Red
    const avgTotal = 7;      // Red
    // --- END DUMMY DATA ---

    // RAG color logic
    const getAlertColor = (val: number) => val <= 1 ? '#4caf50' : val <= 3 ? '#ff9800' : '#f44336';

    // Simple SVG rev counter component
    const RevCounter = ({ value, label }: { value: number, label: string }) => {
        const color = getAlertColor(value);
        const angle = Math.min(180, Math.max(0, value * 36)); // 0 alerts = 0deg, 5 alerts = 180deg
        const needleX = 50 + 40 * Math.cos(Math.PI * (1 - angle / 180));
        const needleY = 60 - 40 * Math.sin(Math.PI * (1 - angle / 180));
    return (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mx: 2 }}>
                <svg width="100" height="60">
                    <path d="M10,60 A40,40 0 0,1 90,60" fill="#eee" />
                    <path d="M10,60 A40,40 0 0,1 90,60" fill="none" stroke="#ccc" strokeWidth="6" />
                    <path d="M10,60 A40,40 0 0,1 90,60" fill="none" stroke={color} strokeWidth="6" strokeDasharray={`${angle/180*126},126`} />
                    <line x1="50" y1="60" x2={needleX} y2={needleY} stroke={color} strokeWidth="3" />
                    <circle cx="50" cy="60" r="4" fill={color} />
                </svg>
                <Typography variant="caption" sx={{ fontWeight: 600 }}>{label}</Typography>
                <Typography variant="h6" sx={{ color, fontWeight: 700 }}>{value}</Typography>
            </Box>
        );
    };

    // CSV Export function for alerts data
    const exportAlertsDataToCSV = () => {
        if (!vmAlertWindow || vmAlertWindow.length === 0) {
            alert('No alert data available to export');
            return;
        }
        const headers = ['Time', 'Critical', 'Immediate', 'Warning'];
        const csvContent = [
            headers.map(h => `"${h}"`).join(','),
            ...vmAlertWindow.map(data => [
                new Date(data.bucket).toLocaleString(),
                Math.round(parseFloat(data.avg_critical)),
                Math.round(parseFloat(data.avg_immediate)),
                Math.round(parseFloat(data.avg_warning))
            ].map(field => `"${field}"`).join(','))
        ].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `DaaS App- System Alerts-${selectedVM?.identity_name || 'vm'}-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // CSV Export function for CPU usage data
    const exportCpuDataToCSV = () => {
        if (!vmCpuRamData || vmCpuRamData.length === 0) {
            alert('No CPU usage data available to export');
            return;
        }
        const headers = ['Time', 'CPU Usage (%)'];
        const csvContent = [
            headers.map(h => `"${h}"`).join(','),
            ...vmCpuRamData.map(data => [
                new Date(data.interval_start).toLocaleString(),
                parseFloat(data.avg_cpu_usage_percent).toFixed(2)
            ].map(field => `"${field}"`).join(','))
        ].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `DaaS App- CPU Usage-${selectedVM?.identity_name || 'vm'}-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // CSV Export function for Memory usage data
    const exportMemoryDataToCSV = () => {
        if (!vmCpuRamData || vmCpuRamData.length === 0) {
            alert('No memory usage data available to export');
            return;
        }
        const headers = ['Time', 'Memory Usage (%)'];
        const csvContent = [
            headers.map(h => `"${h}"`).join(','),
            ...vmCpuRamData.map(data => [
                new Date(data.interval_start).toLocaleString(),
                parseFloat(data.avg_memory_usage_percent).toFixed(2)
            ].map(field => `"${field}"`).join(','))
        ].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `DaaS App- Memory Usage-${selectedVM?.identity_name || 'vm'}-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // CSV Export function for Disk usage data
    const exportDiskDataToCSV = () => {
        if (!vmDiskData || vmDiskData.length === 0) {
            alert('No disk usage data available to export');
            return;
        }
        const headers = ['Time', 'Used (GB)', 'Provisioned (GB)', 'Usage (%)'];
        const csvContent = [
            headers.map(h => `"${h}"`).join(','),
            ...vmDiskData.map(data => [
                new Date(data.interval_start).toLocaleString(),
                parseFloat(data.avg_diskspace_used).toFixed(2),
                parseFloat(data.avg_diskspace_provisioned).toFixed(2),
                parseFloat(data.avg_disk_usage_percent).toFixed(2)
            ].map(field => `"${field}"`).join(','))
        ].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `DaaS App- Disk Usage-${selectedVM?.identity_name || 'vm'}-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // CSV Export function for all graphing data
    const exportAllGraphDataToCSV = () => {
        let csvSections = [];
        // Network Usage
        if (vmNetworkData && vmNetworkData.length > 0) {
            csvSections.push('[Network Usage]');
            const headers = ['Time', 'Total Usage (kbps)', 'Data Received (kbps)', 'Data Sent (kbps)'];
            csvSections.push(headers.map(h => `"${h}"`).join(','));
            csvSections.push(...vmNetworkData.map(data => [
                new Date(data.interval_start).toLocaleString(),
                parseFloat(data.avg_net_usage_kbps).toFixed(2),
                parseFloat(data.avg_net_received_kbps).toFixed(2),
                parseFloat(data.avg_net_transmit_kbps).toFixed(2)
            ].map(field => `"${field}"`).join(',')));
            csvSections.push('');
        }
        // System Alerts
        if (vmAlertWindow && vmAlertWindow.length > 0) {
            csvSections.push('[System Alerts]');
            const headers = ['Time', 'Critical', 'Immediate', 'Warning'];
            csvSections.push(headers.map(h => `"${h}"`).join(','));
            csvSections.push(...vmAlertWindow.map(data => [
                new Date(data.bucket).toLocaleString(),
                Math.round(parseFloat(data.avg_critical)),
                Math.round(parseFloat(data.avg_immediate)),
                Math.round(parseFloat(data.avg_warning))
            ].map(field => `"${field}"`).join(',')));
            csvSections.push('');
        }
        // CPU Usage
        if (vmCpuRamData && vmCpuRamData.length > 0) {
            csvSections.push('[CPU Usage Over Time]');
            const headers = ['Time', 'CPU Usage (%)'];
            csvSections.push(headers.map(h => `"${h}"`).join(','));
            csvSections.push(...vmCpuRamData.map(data => [
                new Date(data.interval_start).toLocaleString(),
                parseFloat(data.avg_cpu_usage_percent).toFixed(2)
            ].map(field => `"${field}"`).join(',')));
            csvSections.push('');
        }
        // Memory Usage
        if (vmCpuRamData && vmCpuRamData.length > 0) {
            csvSections.push('[Memory Usage Over Time]');
            const headers = ['Time', 'Memory Usage (%)'];
            csvSections.push(headers.map(h => `"${h}"`).join(','));
            csvSections.push(...vmCpuRamData.map(data => [
                new Date(data.interval_start).toLocaleString(),
                parseFloat(data.avg_memory_usage_percent).toFixed(2)
            ].map(field => `"${field}"`).join(',')));
            csvSections.push('');
        }
        // Disk Usage
        if (vmDiskData && vmDiskData.length > 0) {
            csvSections.push('[Disk Usage Over Time]');
            const headers = ['Time', 'Used (GB)', 'Provisioned (GB)', 'Usage (%)'];
            csvSections.push(headers.map(h => `"${h}"`).join(','));
            csvSections.push(...vmDiskData.map(data => [
                new Date(data.interval_start).toLocaleString(),
                parseFloat(data.avg_diskspace_used).toFixed(2),
                parseFloat(data.avg_diskspace_provisioned).toFixed(2),
                parseFloat(data.avg_disk_usage_percent).toFixed(2)
            ].map(field => `"${field}"`).join(',')));
            csvSections.push('');
        }
        if (csvSections.length === 0) {
            alert('No graph data available to export');
            return;
        }
        const csvContent = csvSections.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `DaaS App- All Graph Data-${selectedVM?.identity_name || 'vm'}-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Helper to filter data based on time range
    const filterDataByTimeRange = (data: any[], dateField: string, timeRange: string, customStartDate: string, customEndDate: string) => {
        if (!data || data.length === 0) return data;
        
        const now = new Date();
        let startDate: Date;
        
        switch (timeRange) {
            case '24h':
                startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                break;
            case '7d':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case '30d':
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                break;
            case 'custom':
                if (customStartDate && customEndDate) {
                    const start = new Date(customStartDate);
                    const end = new Date(customEndDate);
                    return data.filter(item => {
                        const itemDate = new Date(item[dateField]);
                        return itemDate >= start && itemDate <= end;
                    });
                }
                return data;
            default:
                return data;
        }
        
        return data.filter(item => {
            const itemDate = new Date(item[dateField]);
            return itemDate >= startDate;
        });
    };

    // Reusable Time Range Selector Component
    const TimeRangeSelector = ({ 
        timeRange, 
        setTimeRange, 
        customStartDate, 
        setCustomStartDate, 
        customEndDate, 
        setCustomEndDate, 
        showCustomDateRange, 
        setShowCustomDateRange 
    }: {
        timeRange: string;
        setTimeRange: (value: string) => void;
        customStartDate: string;
        setCustomStartDate: (value: string) => void;
        customEndDate: string;
        setCustomEndDate: (value: string) => void;
        showCustomDateRange: boolean;
        setShowCustomDateRange: (value: boolean) => void;
    }) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
                <Select
                    value={timeRange}
                    onChange={(e) => {
                        setTimeRange(e.target.value);
                        if (e.target.value !== 'custom') {
                            setShowCustomDateRange(false);
                        } else {
                            setShowCustomDateRange(true);
                        }
                    }}
                    displayEmpty
                    sx={{ 
                        fontSize: '0.875rem',
                        '& .MuiSelect-select': {
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            py: 1,
                            px: 1.5
                        }
                    }}
                    startAdornment={<IconClock size={20} style={{ marginRight: 8 }} />}
                >
                    <MenuItem value="24h" sx={{ fontSize: '0.875rem' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <IconClock size={18} />
                            24h
                        </Box>
                    </MenuItem>
                    <MenuItem value="7d" sx={{ fontSize: '0.875rem' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <IconCalendar size={18} />
                            7d
                        </Box>
                    </MenuItem>
                    <MenuItem value="30d" sx={{ fontSize: '0.875rem' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <IconCalendar size={18} />
                            30d
                        </Box>
                    </MenuItem>
                    <MenuItem value="custom" sx={{ fontSize: '0.875rem' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <IconCalendar size={18} />
                            Custom
                        </Box>
                    </MenuItem>
                </Select>
            </FormControl>
            
            {showCustomDateRange && (
                <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1.5,
                    p: 1,
                    borderRadius: 2,
                    backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                    border: '1px solid',
                    borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                }}>
                    <TextField
                        label="From"
                        type="datetime-local"
                        value={customStartDate}
                        onChange={(e) => setCustomStartDate(e.target.value)}
                        size="small"
                        InputLabelProps={{ 
                            shrink: true,
                            sx: { fontSize: '0.875rem' }
                        }}
                        sx={{ 
                            width: 160,
                            '& .MuiInputBase-input': {
                                fontSize: '0.875rem',
                                py: 1
                            }
                        }}
                    />
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>to</Typography>
                    <TextField
                        label="To"
                        type="datetime-local"
                        value={customEndDate}
                        onChange={(e) => setCustomEndDate(e.target.value)}
                        size="small"
                        InputLabelProps={{ 
                            shrink: true,
                            sx: { fontSize: '0.875rem' }
                        }}
                        sx={{ 
                            width: 160,
                            '& .MuiInputBase-input': {
                                fontSize: '0.875rem',
                                py: 1
                            }
                        }}
                    />
                </Box>
            )}
        </Box>
    );

    // Helper to aggregate and average alert data by unique time bucket
    const getAveragedAlertWindowData = (alertWindowArr: VMAlertWindow[]): { time: string; critical: number; immediate: number; warning: number }[] => {
        if (!alertWindowArr || alertWindowArr.length === 0) return [];
        
        // Filter data based on time range
        const filteredData = filterDataByTimeRange(alertWindowArr, 'bucket', alertTimeRange, alertCustomStartDate, alertCustomEndDate);
        
        const bucketMap: Record<string, { count: number; sum_critical: number; sum_immediate: number; sum_warning: number; identity_instance_uuid: string }> = {};
        filteredData.forEach((data: VMAlertWindow) => {
            const bucket = data.bucket;
            if (!bucketMap[bucket]) {
                bucketMap[bucket] = {
                    count: 0,
                    sum_critical: 0,
                    sum_immediate: 0,
                    sum_warning: 0,
                    identity_instance_uuid: data.identity_instance_uuid
                };
            }
            bucketMap[bucket].count += 1;
            bucketMap[bucket].sum_critical += parseFloat(data.avg_critical);
            bucketMap[bucket].sum_immediate += parseFloat(data.avg_immediate);
            bucketMap[bucket].sum_warning += parseFloat(data.avg_warning);
        });
        return Object.entries(bucketMap).map(([bucket, vals]) => {
            return {
                time: new Date(bucket).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                critical: vals.sum_critical / vals.count,
                immediate: vals.sum_immediate / vals.count,
                warning: vals.sum_warning / vals.count
            };
        });
    };

    return (
        <>
        <ParentCard title={
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                width: '100%',
                gap: 3
            }}>
                <Typography variant="h5">Individual VM Details</Typography>
                <Button
                    variant="outlined"
                    size="small"
                    onClick={exportAllGraphDataToCSV}
                    startIcon={<IconDownload size={20} />}
                    sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 600,
                        px: 3,
                        py: 1,
                        fontSize: '0.875rem',
                        borderColor: (theme) => theme.palette.success.main,
                        color: (theme) => theme.palette.success.main,
                        backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(76, 175, 80, 0.05)' : 'rgba(76, 175, 80, 0.02)',
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        ml: 2,
                        '&:hover': {
                            backgroundColor: (theme) => theme.palette.success.main,
                            color: 'white',
                            borderColor: (theme) => theme.palette.success.main,
                            transform: 'translateY(-1px)',
                            boxShadow: (theme) => `0 4px 12px ${theme.palette.success.main}40`,
                        },
                        '&:active': {
                            transform: 'translateY(0)',
                        }
                    }}
                >
                    Export All CSV
                </Button>
                {selectedVM && (
                    <Box sx={{ ml: 'auto' }}>
                        {/* <Button
                            variant="contained"
                            color={isVMPoweredOn ? "error" : "success"}
                            startIcon={<IconPower size={20} />}
                            onClick={onVMPowerToggle}
                            disabled={isPowerActionLoading}
                            sx={{
                                minWidth: 120,
                                '&:hover': {
                                    backgroundColor: isVMPoweredOn ? 'error.dark' : 'success.dark'
                                }
                            }}
                        >
                            {isPowerActionLoading ? (
                                <CircularProgress size={20} color="inherit" />
                            ) : isVMPoweredOn ? (
                                "Power Off"
                            ) : (
                                "Power On"
                            )}
                        </Button> */}
                    </Box>
                )}
            </Box>
        }>
            {selectedVM ? (
                loadingTelemetry ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                        <CircularProgress />
                    </Box>
                ) : vmTelemetry ? (
                    <Grid container spacing={3}>
                        {/* VM Overview */}
                        <Grid item xs={12}>
                            <Typography variant="h5" gutterBottom>
                                VM Name: {selectedVM.identity_name}
                            </Typography>
                            <Typography variant="subtitle1" color="textSecondary">
                                UUID: {selectedVM.identity_instance_uuid}
                            </Typography>
                            <Typography variant="subtitle1" color="textSecondary">
                                Region: {vmTelemetry?.vcenter_region || selectedVM.vcenter_region || 'Unknown'}
                            </Typography>
                            
                        </Grid>

                        {/* Resource Usage */}
                        <Grid item xs={12} md={4}>
                                <div ref={overviewCardsRef}>
                                    <Box
                                        sx={{
                                            cursor: 'pointer',
                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                            '&:hover': {
                                                transform: 'translateY(-4px)',
                                                '& .MuiCard-root': {
                                                    boxShadow: (theme) => `0 8px 25px ${theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.15)'}`,
                                                },
                                                '& .click-indicator': {
                                                    opacity: 1,
                                                    transform: 'translateY(0)',
                                                }
                                            }
                                        }}
                                        onClick={() => scrollToGraph(cpuGraphRef, 'cpu')}
                                    >
                                        <Box sx={{ position: 'relative' }}>
                                            <Box
                                                className="click-indicator"
                                                sx={{
                                                    position: 'absolute',
                                                    top: 8,
                                                    right: 8,
                                                    opacity: 0,
                                                    transform: 'translateY(-10px)',
                                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 0.5,
                                                    px: 1,
                                                    py: 0.5,
                                                    borderRadius: 1,
                                                    backgroundColor: (theme) => theme.palette.primary.main,
                                                    color: 'white',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 500
                                                }}
                                            >
                                                <IconChartLine size={14} />
                                                View Graph
                                            </Box>
                                        </Box>
                                        <ParentCard 
                                            title="CPU Usage"
                                            sx={{ 
                                                mb: 0,
                                                '& .MuiCard-root': {
                                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                }
                                            }}
                                        >
                                            <Box sx={{ position: 'relative' }}>
                                <Stack direction="row" alignItems="center" spacing={2}>
                                    <IconCpu size={32} color="#82ca9d" />
                                    <Box>
                                        <Typography variant="h4">
                                            {(() => {
                                                const filteredData = filterDataByTimeRange(vmCpuRamData, 'interval_start', cpuTimeRange, cpuCustomStartDate, cpuCustomEndDate);
                                                return filteredData.length > 0 && filteredData[filteredData.length - 1].avg_cpu_usage_percent
                                                    ? `${Number(filteredData[filteredData.length - 1].avg_cpu_usage_percent).toFixed(2)}%`
                                                    : vmTelemetry?.cpu_usage_avg 
                                                        ? `${Number(vmTelemetry.cpu_usage_avg).toFixed(2)}%`
                                                        : '0%';
                                            })()}
                                        </Typography>
                                        <Typography variant="subtitle2" color="textSecondary">
                                            {vmTelemetry?.cpu_count || 0} Cores ({vmTelemetry?.cpu_cores_per_socket || 0} per socket)
                                        </Typography>
                                    </Box>
                                </Stack>
                                            </Box>
                            </ParentCard>
                                    </Box>
                                </div>
                        </Grid>

                        <Grid item xs={12} md={4}>
                                <Box
                                    sx={{
                                        cursor: 'pointer',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        '&:hover': {
                                            transform: 'translateY(-4px)',
                                            '& .MuiCard-root': {
                                                boxShadow: (theme) => `0 8px 25px ${theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.15)'}`,
                                            },
                                            '& .click-indicator': {
                                                opacity: 1,
                                                transform: 'translateY(0)',
                                            }
                                        }
                                    }}
                                    onClick={() => scrollToGraph(memoryGraphRef, 'memory')}
                                >
                                    <Box sx={{ position: 'relative' }}>
                                        <Box
                                            className="click-indicator"
                                            sx={{
                                                position: 'absolute',
                                                top: 8,
                                                right: 8,
                                                opacity: 0,
                                                transform: 'translateY(-10px)',
                                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 0.5,
                                                px: 1,
                                                py: 0.5,
                                                borderRadius: 1,
                                                backgroundColor: (theme) => theme.palette.primary.main,
                                                color: 'white',
                                                fontSize: '0.75rem',
                                                fontWeight: 500
                                            }}
                                        >
                                            <IconChartLine size={14} />
                                            View Graph
                                        </Box>
                                    </Box>
                                    <ParentCard 
                                        title="Memory Usage"
                                        sx={{ 
                                            mb: 0,
                                            '& .MuiCard-root': {
                                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                            }
                                        }}
                                    >
                                        <Box sx={{ position: 'relative' }}>
                                <Stack direction="row" alignItems="center" spacing={2}>
                                    <IconDatabase size={32} color="#8884d8" />
                                    <Box>
                                        <Typography variant="h4">
                                            {(() => {
                                                const filteredData = filterDataByTimeRange(vmCpuRamData, 'interval_start', memoryTimeRange, memoryCustomStartDate, memoryCustomEndDate);
                                                return filteredData.length > 0 && filteredData[filteredData.length - 1].avg_memory_usage_percent
                                                    ? `${Number(filteredData[filteredData.length - 1].avg_memory_usage_percent).toFixed(2)}%`
                                                    : vmTelemetry?.memory_usage_avg 
                                                        ? `${Number(vmTelemetry.memory_usage_avg).toFixed(2)}%`
                                                        : '0%';
                                            })()}
                                        </Typography>
                                        <Typography variant="subtitle2" color="textSecondary">
                                            {Math.round((vmTelemetry?.memory_size_mib || 0) / 1024)} GB Total
                                        </Typography>
                                    </Box>
                                </Stack>
                                        </Box>
                            </ParentCard>
                                </Box>
                        </Grid>

                        <Grid item xs={12} md={4}>
                                <Box
                                    sx={{
                                        cursor: 'pointer',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        '&:hover': {
                                            transform: 'translateY(-4px)',
                                            '& .MuiCard-root': {
                                                boxShadow: (theme) => `0 8px 25px ${theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.15)'}`,
                                            },
                                            '& .click-indicator': {
                                                opacity: 1,
                                                transform: 'translateY(0)',
                                            }
                                        }
                                    }}
                                    onClick={() => scrollToGraph(diskGraphRef, 'disk')}
                                >
                                    <Box sx={{ position: 'relative' }}>
                                        <Box
                                            className="click-indicator"
                                            sx={{
                                                position: 'absolute',
                                                top: 8,
                                                right: 8,
                                                opacity: 0,
                                                transform: 'translateY(-10px)',
                                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 0.5,
                                                px: 1,
                                                py: 0.5,
                                                borderRadius: 1,
                                                backgroundColor: (theme) => theme.palette.primary.main,
                                                color: 'white',
                                                fontSize: '0.75rem',
                                                fontWeight: 500
                                            }}
                                        >
                                            <IconChartLine size={14} />
                                            View Graph
                                        </Box>
                                    </Box>
                                    <ParentCard 
                                        title="Disk Usage"
                                        sx={{ 
                                            mb: 0,
                                            '& .MuiCard-root': {
                                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                            }
                                        }}
                                    >
                                        <Box sx={{ position: 'relative' }}>
                                <Stack direction="row" alignItems="center" spacing={2}>
                                    <IconServer size={32} color="#ffc658" />
                                    <Box>
                                        <Typography variant="h4">
                                            {(() => {
                                                const filteredData = filterDataByTimeRange(vmDiskData, 'interval_start', diskTimeRange, diskCustomStartDate, diskCustomEndDate);
                                                return filteredData.length > 0 && filteredData[filteredData.length - 1].avg_disk_usage_percent
                                                    ? `${Number(filteredData[filteredData.length - 1].avg_disk_usage_percent).toFixed(2)}%`
                                                    : '0%';
                                            })()}
                                        </Typography>
                                        <Typography variant="subtitle2" color="textSecondary">
                                            {(() => {
                                                const filteredData = filterDataByTimeRange(vmDiskData, 'interval_start', diskTimeRange, diskCustomStartDate, diskCustomEndDate);
                                                return filteredData.length > 0 
                                                    ? `${Number(filteredData[filteredData.length - 1].avg_diskspace_used).toFixed(2)} GB Used / ${Number(filteredData[filteredData.length - 1].avg_diskspace_provisioned).toFixed(2)} GB Total`
                                                    : 'No disk data available';
                                            })()}
                                        </Typography>
                                    </Box>
                                </Stack>
                                        </Box>
                            </ParentCard>
                                </Box>
                        </Grid>

                        {/* System Health and Alerts in a row */}
                        <Grid item xs={12}>
                            <ParentCard title="System Health">
                                {vmHealthWindow.length > 0 ? (
                                    <>
                                        <Box sx={{ mb: 3 }}>
                                            <Grid container spacing={2}>
                                                <Grid item xs={12} md={4}>
                                                    <Box sx={{ textAlign: 'center' }}>
                                                        <Typography variant="h6" gutterBottom>
                                                            Health Score
                                                        </Typography>
                                                        <Box sx={{ 
                                                            width: 80, 
                                                            height: 80, 
                                                            borderRadius: '50%', 
                                                            display: 'flex', 
                                                            alignItems: 'center', 
                                                            justifyContent: 'center',
                                                            margin: '0 auto',
                                                                backgroundColor: getHealthColor(healthValue)
                                                        }}>
                                                            <Typography variant="h4" sx={{ color: 'white' }}>
                                                                    {healthValue.toFixed(1)}%
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </Grid>
                                                <Grid item xs={12} md={4}>
                                                    <Box sx={{ textAlign: 'center' }}>
                                                        <Typography variant="h6" gutterBottom>
                                                            Workload Score
                                                        </Typography>
                                                        <Box sx={{ 
                                                            width: 80, 
                                                            height: 80, 
                                                            borderRadius: '50%', 
                                                            display: 'flex', 
                                                            alignItems: 'center', 
                                                            justifyContent: 'center',
                                                            margin: '0 auto',
                                                                backgroundColor: getWorkloadColor(workloadValue)
                                                        }}>
                                                            <Typography variant="h4" sx={{ color: 'white' }}>
                                                                    {workloadValue.toFixed(1)}%
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </Grid>
                                                <Grid item xs={12} md={4}>
                                                    <Box sx={{ textAlign: 'center' }}>
                                                        <Typography variant="h6" gutterBottom>
                                                            Efficiency Score
                                                        </Typography>
                                                        <Box sx={{ 
                                                            width: 80, 
                                                            height: 80, 
                                                            borderRadius: '50%', 
                                                            display: 'flex', 
                                                            alignItems: 'center', 
                                                            justifyContent: 'center',
                                                            margin: '0 auto',
                                                                backgroundColor: getEfficiencyColor(efficiencyValue)
                                                        }}>
                                                            <Typography variant="h4" sx={{ color: 'white' }}>
                                                                    {efficiencyValue.toFixed(1)}%
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </Grid>
                                            </Grid>
                                        </Box>

                                        {isHealthInfoVisible ? (
                                            <Paper variant="outlined" sx={{ p: 2, mt: 2, position: 'relative', backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'grey.50', borderRadius: 2 }}>
                                                <Tooltip title="Dismiss explanation" arrow placement="top">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => setIsHealthInfoVisible(false)}
                                                        sx={{
                                                            position: 'absolute',
                                                            top: 8,
                                                            right: 8,
                                                            color: (theme) => theme.palette.text.secondary,
                                                            backgroundColor: 'rgba(0,0,0,0.04)',
                                                            borderRadius: '50%',
                                                            width: 32,
                                                            height: 32,
                                                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                                            '&:hover': {
                                                                color: (theme) => theme.palette.error.main,
                                                                backgroundColor: (theme) => theme.palette.error.light + '20',
                                                                transform: 'scale(1.1) rotate(90deg)',
                                                                boxShadow: (theme) => `0 4px 12px ${theme.palette.error.main}40`,
                                                            },
                                                            '&:active': {
                                                                transform: 'scale(0.95) rotate(90deg)',
                                                            }
                                                        }}
                                                    >
                                                        <IconX size={18} />
                                                    </IconButton>
                                                </Tooltip>
                                                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                                                    System Health Scores Explained
                                                </Typography>
                                                <Typography variant="body2" gutterBottom>
                                                    <b>Health Score:</b> Indicates the overall health and stability of the VM. Higher is better. <br/>
                                                    <b>Workload Score:</b> Shows how efficiently the VM is using its resources. Lower scores may mean over-provisioning.<br/>
                                                    <b>Efficiency Score:</b> Reflects how well the VM&apos;s resources are being utilized for its workload.
                                                </Typography>
                                                <Box sx={{ mt: 1 }}>
                                                    <Typography variant="body2" fontWeight={600}>Color Codes:</Typography>
                                                        <Typography variant="body2" fontWeight={500} sx={{ mt: 1 }}>Health/Efficiency:</Typography>
                                                    <Stack spacing={0.5} sx={{mt: 0.5}}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: '#4caf50' }} />
                                                                <Typography variant="caption">Green: Good/Healthy (≥75%)</Typography>
                                                        </Box>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: '#ff9800' }} />
                                                                <Typography variant="caption">Amber: Warning (50% - 74%)</Typography>
                                                        </Box>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: '#f44336' }} />
                                                                <Typography variant="caption">Red: Critical (&lt;50%)</Typography>
                                                            </Box>
                                                        </Stack>
                                                        <Typography variant="body2" fontWeight={500} sx={{ mt: 2 }}>Workload:</Typography>
                                                        <Stack spacing={0.5} sx={{mt: 0.5}}>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                <Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: '#4caf50' }} />
                                                                <Typography variant="caption">Green: Utilisation is low (0 - &lt;60)</Typography>
                                                            </Box>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                <Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: '#ff9800' }} />
                                                                <Typography variant="caption">Amber: Moderate utilisation (≥60 - &lt;80)</Typography>
                                                            </Box>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                <Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: '#f44336' }} />
                                                                <Typography variant="caption">Red: High utilisation, performance may be impacted (≥80 - 100)</Typography>
                                                        </Box>
                                                    </Stack>
                                                </Box>
                                            </Paper>
                                        ) : (
                                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                                                <Button
                                                    size="small"
                                                    onClick={() => setIsHealthInfoVisible(true)}
                                                    startIcon={<IconInfoCircle size={16} />}
                                                    variant="text"
                                                >
                                                    Show Health Score Explanation
                                                </Button>
                                            </Box>
                                        )}
                                    </>
                                ) : (
                                    <Typography variant="body2" color="textSecondary">
                                        No health data available
                                    </Typography>
                                )}
                            </ParentCard>
                        </Grid>



                        {/* Network Usage */}
                        <Grid item xs={12}>
                            <ParentCard title={
                                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                    <Typography variant="h5" sx={{ flex: 1 }}>Network Usage</Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <TimeRangeSelector
                                            timeRange={networkTimeRange}
                                            setTimeRange={setNetworkTimeRange}
                                            customStartDate={networkCustomStartDate}
                                            setCustomStartDate={setNetworkCustomStartDate}
                                            customEndDate={networkCustomEndDate}
                                            setCustomEndDate={setNetworkCustomEndDate}
                                            showCustomDateRange={showNetworkCustomDateRange}
                                            setShowCustomDateRange={setShowNetworkCustomDateRange}
                                        />
                                        {vmNetworkData.length > 0 && (
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                onClick={exportNetworkDataToCSV}
                                                startIcon={<IconDownload size={20} />}
                                                sx={{
                                                    borderRadius: 2,
                                                    textTransform: 'none',
                                                    fontWeight: 600,
                                                    px: 3,
                                                    py: 1,
                                                    fontSize: '0.875rem',
                                                    borderColor: (theme) => theme.palette.success.main,
                                                    color: (theme) => theme.palette.success.main,
                                                    backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(76, 175, 80, 0.05)' : 'rgba(76, 175, 80, 0.02)',
                                                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                                    '&:hover': {
                                                        backgroundColor: (theme) => theme.palette.success.main,
                                                        color: 'white',
                                                        borderColor: (theme) => theme.palette.success.main,
                                                        transform: 'translateY(-1px)',
                                                        boxShadow: (theme) => `0 4px 12px ${theme.palette.success.main}40`,
                                                    },
                                                    '&:active': {
                                                        transform: 'translateY(0)',
                                                    }
                                                }}
                                            >
                                                Export CSV
                                            </Button>
                                        )}
                                    </Box>
                                </Box>
                            }>
                                {vmNetworkData.length > 0 ? (
                                    <>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                            <Typography variant="subtitle1">
                                                Current Network Usage
                                            </Typography>
                                            <Typography variant="h4">
                                                {(() => {
                                                    const filteredData = filterDataByTimeRange(vmNetworkData, 'interval_start', networkTimeRange, networkCustomStartDate, networkCustomEndDate);
                                                    return filteredData.length > 0 
                                                        ? parseFloat(filteredData[filteredData.length - 1].avg_net_usage_kbps).toFixed(2)
                                                        : '0.00';
                                                })()} kbps
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                            <Typography variant="subtitle1">
                                                Network Received
                                            </Typography>
                                            <Typography variant="h4">
                                                {(() => {
                                                    const filteredData = filterDataByTimeRange(vmNetworkData, 'interval_start', networkTimeRange, networkCustomStartDate, networkCustomEndDate);
                                                    return filteredData.length > 0 
                                                        ? parseFloat(filteredData[filteredData.length - 1].avg_net_received_kbps).toFixed(2)
                                                        : '0.00';
                                                })()} kbps
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                            <Typography variant="subtitle1">
                                                Network Transmitted
                                            </Typography>
                                            <Typography variant="h4">
                                                {(() => {
                                                    const filteredData = filterDataByTimeRange(vmNetworkData, 'interval_start', networkTimeRange, networkCustomStartDate, networkCustomEndDate);
                                                    return filteredData.length > 0 && filteredData[filteredData.length - 1].avg_net_transmit_kbps
                                                        ? parseFloat(filteredData[filteredData.length - 1].avg_net_transmit_kbps).toFixed(2)
                                                        : '0.00';
                                                })()} kbps
                                            </Typography>
                                        </Box>
                                            
                                            {/* Graph Line Toggle Controls */}
                                            <Box sx={{ mb: 2 }}>
                                                <Typography variant="subtitle2" fontWeight={600} gutterBottom sx={{ mb: 1 }}>
                                                    <IconChartLine size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                                                    Toggle Graph Lines (Click to show/hide):
                                                </Typography>
                                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                                    <Button
                                                        size="small"
                                                        variant={showTotalUsage ? "contained" : "outlined"}
                                                        onClick={() => setShowTotalUsage(!showTotalUsage)}
                                                        sx={{
                                                            minWidth: 'auto',
                                                            px: 2.5,
                                                            py: 0.75,
                                                            backgroundColor: showTotalUsage ? '#f44336' : 'transparent',
                                                            color: showTotalUsage ? 'white' : '#f44336',
                                                            borderColor: '#f44336',
                                                            borderRadius: 2,
                                                            fontWeight: 600,
                                                            textTransform: 'none',
                                                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                                            '&:hover': {
                                                                backgroundColor: showTotalUsage ? '#d32f2f' : 'rgba(244, 67, 54, 0.1)',
                                                                transform: 'translateY(-1px)',
                                                                boxShadow: showTotalUsage ? '0 4px 12px rgba(244, 67, 54, 0.4)' : 'none',
                                                            },
                                                            '&:active': {
                                                                transform: 'translateY(0)',
                                                            }
                                                        }}
                                                    >
                                                        Total Usage
                                                    </Button>
                                                    <Button
                                                        size="small"
                                                        variant={showReceived ? "contained" : "outlined"}
                                                        onClick={() => setShowReceived(!showReceived)}
                                                        sx={{
                                                            minWidth: 'auto',
                                                            px: 2.5,
                                                            py: 0.75,
                                                            backgroundColor: showReceived ? '#ff9800' : 'transparent',
                                                            color: showReceived ? 'white' : '#ff9800',
                                                            borderColor: '#ff9800',
                                                            borderRadius: 2,
                                                            fontWeight: 600,
                                                            textTransform: 'none',
                                                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                                            '&:hover': {
                                                                backgroundColor: showReceived ? '#f57c00' : 'rgba(255, 152, 0, 0.1)',
                                                                transform: 'translateY(-1px)',
                                                                boxShadow: showReceived ? '0 4px 12px rgba(255, 152, 0, 0.4)' : 'none',
                                                            },
                                                            '&:active': {
                                                                transform: 'translateY(0)',
                                                            }
                                                        }}
                                                    >
                                                        Received
                                                    </Button>
                                                    <Button
                                                        size="small"
                                                        variant={showTransmitted ? "contained" : "outlined"}
                                                        onClick={() => setShowTransmitted(!showTransmitted)}
                                                        sx={{
                                                            minWidth: 'auto',
                                                            px: 2.5,
                                                            py: 0.75,
                                                            backgroundColor: showTransmitted ? '#4caf50' : 'transparent',
                                                            color: showTransmitted ? 'white' : '#4caf50',
                                                            borderColor: '#4caf50',
                                                            borderRadius: 2,
                                                            fontWeight: 600,
                                                            textTransform: 'none',
                                                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                                            '&:hover': {
                                                                backgroundColor: showTransmitted ? '#388e3c' : 'rgba(76, 175, 80, 0.1)',
                                                                transform: 'translateY(-1px)',
                                                                boxShadow: showTransmitted ? '0 4px 12px rgba(76, 175, 80, 0.4)' : 'none',
                                                            },
                                                            '&:active': {
                                                                transform: 'translateY(0)',
                                                            }
                                                        }}
                                                    >
                                                        Transmitted
                                                    </Button>
                                                </Box>
                                            </Box>
                                        
                                        <Box sx={{ height: 300, mt: 2 }}>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <LineChart
                                                    data={filterDataByTimeRange(vmNetworkData, 'interval_start', networkTimeRange, networkCustomStartDate, networkCustomEndDate).map(data => ({
                                                        time: new Date(data.interval_start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                                                        usage: parseFloat(data.avg_net_usage_kbps),
                                                        received: parseFloat(data.avg_net_received_kbps),
                                                        transmitted: parseFloat(data.avg_net_transmit_kbps)
                                                    }))}
                                                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                                >
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis 
                                                        dataKey="time"
                                                        angle={-45}
                                                        textAnchor="end"
                                                        height={60}
                                                        label={{ 
                                                            value: 'Time of Data Collection', 
                                                            position: 'insideBottom', 
                                                            offset: -50,
                                                            style: { textAnchor: 'middle', fontSize: '12px' }
                                                        }}
                                                    />
                                                    <YAxis 
                                                        label={{ 
                                                            value: 'Network Speed (kbps)', 
                                                            angle: -90, 
                                                            position: 'insideLeft',
                                                            style: { textAnchor: 'middle', fontSize: '12px' }
                                                        }}
                                                    />
                                                    <RechartsTooltip 
                                                        formatter={(value, name) => [
                                                            `${Number(value).toFixed(2)} kbps`, 
                                                            name === 'usage' ? 'Total Usage' : 
                                                            name === 'received' ? 'Data Received' : 'Data Sent'
                                                        ]}
                                                        labelFormatter={(label) => `Time: ${label}`}
                                                    />
                                                    <Legend />
                                                        {showTotalUsage && (
                                                    <Line 
                                                        type="monotone" 
                                                        dataKey="usage" 
                                                        name="Total Usage" 
                                                        stroke="#f44336" 
                                                        strokeWidth={2}
                                                    />
                                                        )}
                                                        {showReceived && (
                                                    <Line 
                                                        type="monotone" 
                                                        dataKey="received" 
                                                        name="Received" 
                                                        stroke="#ff9800" 
                                                        strokeWidth={2}
                                                    />
                                                        )}
                                                        {showTransmitted && (
                                                    <Line 
                                                        type="monotone" 
                                                        dataKey="transmitted" 
                                                        name="Transmitted" 
                                                        stroke="#4caf50" 
                                                        strokeWidth={2}
                                                    />
                                                        )}
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </Box>
                                        
                                        {isNetworkInfoVisible ? (
                                            <Paper variant="outlined" sx={{ p: 2, mt: 2, position: 'relative', backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'grey.50', borderRadius: 2 }}>
                                                <Tooltip title="Dismiss explanation" arrow placement="top">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => setIsNetworkInfoVisible(false)}
                                                        sx={{
                                                            position: 'absolute',
                                                            top: 8,
                                                            right: 8,
                                                            color: (theme) => theme.palette.text.secondary,
                                                            backgroundColor: 'rgba(0,0,0,0.04)',
                                                            borderRadius: '50%',
                                                            width: 32,
                                                            height: 32,
                                                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                                            '&:hover': {
                                                                color: (theme) => theme.palette.error.main,
                                                                backgroundColor: (theme) => theme.palette.error.light + '20',
                                                                transform: 'scale(1.1) rotate(90deg)',
                                                                boxShadow: (theme) => `0 4px 12px ${theme.palette.error.main}40`,
                                                            },
                                                            '&:active': {
                                                                transform: 'scale(0.95) rotate(90deg)',
                                                            }
                                                        }}
                                                    >
                                                        <IconX size={18} />
                                                    </IconButton>
                                                </Tooltip>
                                                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                                                    Network Activity Over Time
                                                </Typography>
                                                <Typography variant="body2" gutterBottom>
                                                    <b>X-Axis (Time):</b> Shows the time intervals when network data was collected
                                                </Typography>
                                                <Typography variant="body2" gutterBottom>
                                                    <b>Y-Axis (Speed):</b> Network speed in kilobits per second (kbps) - higher values mean faster data transfer
                                                </Typography>
                                                <Box sx={{ mt: 1 }}>
                                                    <Typography variant="body2" fontWeight={600}>Line Colors:</Typography>
                                                    <Stack spacing={0.5} sx={{mt: 0.5}}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: '#f44336' }} />
                                                            <Typography variant="caption">Red: Total Usage</Typography>
                                                        </Box>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: '#ff9800' }} />
                                                            <Typography variant="caption">Amber: Data Received</Typography>
                                                        </Box>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: '#4caf50' }} />
                                                            <Typography variant="caption">Green: Data Sent</Typography>
                                                        </Box>
                                                    </Stack>
                                                </Box>
                                                    <Box sx={{ mt: 2, p: 1.5, backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(25, 118, 210, 0.1)' : 'rgba(25, 118, 210, 0.05)', borderRadius: 1, border: '1px solid', borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(25, 118, 210, 0.3)' : 'rgba(25, 118, 210, 0.2)' }}>
                                                        <Typography variant="body2" sx={{ color: (theme) => theme.palette.primary.main, fontWeight: 500 }}>
                                                            <IconBulb size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                                                            <b>Tip:</b> Use the toggle buttons above the graph to show/hide specific network metrics for better analysis!
                                                        </Typography>
                                                    </Box>
                                            </Paper>
                                        ) : (
                                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                                                <Button
                                                    size="small"
                                                    onClick={() => setIsNetworkInfoVisible(true)}
                                                    startIcon={<IconInfoCircle size={16} />}
                                                    variant="text"
                                                >
                                                    Show Network Graph Explanation
                                                </Button>
                                            </Box>
                                        )}
                                    </>
                                ) : (
                                    <Typography variant="body2" color="textSecondary">
                                        No network data available
                                    </Typography>
                                )}
                            </ParentCard>
                        </Grid>

                        {/* CPU Usage Over Time */}
                        <Grid item xs={12}>
                                <div ref={cpuGraphRef}>
                                    <ParentCard 
                                        title={
                                            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                                <Typography variant="h5" sx={{ flex: 1 }}>CPU Usage Over Time</Typography>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                    <TimeRangeSelector
                                                        timeRange={cpuTimeRange}
                                                        setTimeRange={setCpuTimeRange}
                                                        customStartDate={cpuCustomStartDate}
                                                        setCustomStartDate={setCpuCustomStartDate}
                                                        customEndDate={cpuCustomEndDate}
                                                        setCustomEndDate={setCpuCustomEndDate}
                                                        showCustomDateRange={showCpuCustomDateRange}
                                                        setShowCustomDateRange={setShowCpuCustomDateRange}
                                                    />
                                                    {vmCpuRamData.length > 0 && (
                                                        <Button
                                                            variant="outlined"
                                                            size="small"
                                                            onClick={exportCpuDataToCSV}
                                                            startIcon={<IconDownload size={20} />}
                                                            sx={{
                                                                borderRadius: 2,
                                                                textTransform: 'none',
                                                                fontWeight: 600,
                                                                px: 3,
                                                                py: 1,
                                                                fontSize: '0.875rem',
                                                                borderColor: (theme) => theme.palette.success.main,
                                                                color: (theme) => theme.palette.success.main,
                                                                backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(76, 175, 80, 0.05)' : 'rgba(76, 175, 80, 0.02)',
                                                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                                                '&:hover': {
                                                                    backgroundColor: (theme) => theme.palette.success.main,
                                                                    color: 'white',
                                                                    borderColor: (theme) => theme.palette.success.main,
                                                                    transform: 'translateY(-1px)',
                                                                    boxShadow: (theme) => `0 4px 12px ${theme.palette.success.main}40`,
                                                                },
                                                                '&:active': {
                                                                    transform: 'translateY(0)',
                                                                }
                                                            }}
                                                        >
                                                            Export CSV
                                                        </Button>
                                                    )}
                                                    {activeGraph === 'cpu' && (
                                                        <Button
                                                            variant="outlined"
                                                            size="small"
                                                            onClick={scrollToOverview}
                                                            startIcon={<IconArrowUp size={20} />}
                                                            sx={{
                                                                borderRadius: 2,
                                                                textTransform: 'none',
                                                                fontWeight: 600,
                                                                px: 3,
                                                                py: 1,
                                                                fontSize: '0.875rem',
                                                                borderColor: (theme) => theme.palette.primary.main,
                                                                color: (theme) => theme.palette.primary.main,
                                                                backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(25, 118, 210, 0.05)' : 'rgba(25, 118, 210, 0.02)',
                                                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                                                '&:hover': {
                                                                    backgroundColor: (theme) => theme.palette.primary.main,
                                                                    color: 'white',
                                                                    borderColor: (theme) => theme.palette.primary.main,
                                                                    transform: 'translateY(-1px)',
                                                                    boxShadow: (theme) => `0 4px 12px ${theme.palette.primary.main}40`,
                                                                },
                                                                '&:active': {
                                                                    transform: 'translateY(0)',
                                                                }
                                                            }}
                                                        >
                                                            Back to Overview
                                                        </Button>
                                                    )}
                                                </Box>
                                            </Box>
                                        }
                                    >
                                {vmCpuRamData.length > 0 ? (
                                    <>
                                        <Box sx={{ height: 300, mt: 2 }}>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <LineChart
                                                    data={filterDataByTimeRange(vmCpuRamData, 'interval_start', cpuTimeRange, cpuCustomStartDate, cpuCustomEndDate).map(data => ({
                                                        time: new Date(data.interval_start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                                                        cpu: parseFloat(data.avg_cpu_usage_percent)
                                                    }))}
                                                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                                >
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis 
                                                        dataKey="time"
                                                        angle={-45}
                                                        textAnchor="end"
                                                        height={60}
                                                        label={{ 
                                                            value: 'Time of Data Collection', 
                                                            position: 'insideBottom', 
                                                            offset: -50,
                                                            style: { textAnchor: 'middle', fontSize: '12px' }
                                                        }}
                                                    />
                                                    <YAxis 
                                                        label={{ 
                                                            value: 'CPU Usage (%)', 
                                                            angle: -90, 
                                                            position: 'insideLeft',
                                                            style: { textAnchor: 'middle', fontSize: '12px' }
                                                        }}
                                                    />
                                                    <RechartsTooltip 
                                                        formatter={(value, name) => [
                                                            `${Number(value).toFixed(2)}%`, 
                                                            'CPU Usage'
                                                        ]}
                                                        labelFormatter={(label) => `Time: ${label}`}
                                                    />
                                                    <Legend />
                                                    <Line 
                                                        type="monotone" 
                                                        dataKey="cpu" 
                                                        name="CPU Usage" 
                                                        stroke="#ff9800" 
                                                        strokeWidth={2}
                                                    />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </Box>
                                        {isCpuInfoVisible ? (
                                            <Paper variant="outlined" sx={{ p: 2, mt: 2, position: 'relative', backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'grey.50', borderRadius: 2 }}>
                                                <Tooltip title="Dismiss explanation" arrow placement="top">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => setIsCpuInfoVisible(false)}
                                                        sx={{
                                                            position: 'absolute',
                                                            top: 8,
                                                            right: 8,
                                                            color: (theme) => theme.palette.text.secondary,
                                                            backgroundColor: 'rgba(0,0,0,0.04)',
                                                            borderRadius: '50%',
                                                            width: 32,
                                                            height: 32,
                                                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                                            '&:hover': {
                                                                color: (theme) => theme.palette.error.main,
                                                                backgroundColor: (theme) => theme.palette.error.light + '20',
                                                                transform: 'scale(1.1) rotate(90deg)',
                                                                boxShadow: (theme) => `0 4px 12px ${theme.palette.error.main}40`,
                                                            },
                                                            '&:active': {
                                                                transform: 'scale(0.95) rotate(90deg)',
                                                            }
                                                        }}
                                                    >
                                                        <IconX size={18} />
                                                    </IconButton>
                                                </Tooltip>
                                                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                                                    CPU Usage Over Time
                                                </Typography>
                                                <Typography variant="body2" gutterBottom>
                                                    <b>X-Axis (Time):</b> Shows the time intervals when CPU data was collected
                                                </Typography>
                                                <Typography variant="body2" gutterBottom>
                                                    <b>Y-Axis (Usage):</b> CPU usage percentage - higher values indicate more processing activity
                                                </Typography>
                                                <Box sx={{ mt: 1 }}>
                                                    <Typography variant="body2" fontWeight={600}>Line Color:</Typography>
                                                    <Stack spacing={0.5} sx={{mt: 0.5}}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: '#ff9800' }} />
                                                            <Typography variant="caption">Amber: CPU Usage</Typography>
                                                        </Box>
                                                    </Stack>
                                                </Box>
                                            </Paper>
                                        ) : (
                                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                                                <Button
                                                    size="small"
                                                    onClick={() => setIsCpuInfoVisible(true)}
                                                    startIcon={<IconInfoCircle size={16} />}
                                                    variant="text"
                                                >
                                                    Show CPU Graph Explanation
                                                </Button>
                                            </Box>
                                        )}
                                    </>
                                ) : (
                                    <Typography variant="body2" color="textSecondary">
                                        No CPU usage data available
                                    </Typography>
                                )}
                            </ParentCard>
                                </div>
                        </Grid>

                        {/* Memory Usage Over Time */}
                        <Grid item xs={12}>
                                <div ref={memoryGraphRef}>
                                    <ParentCard 
                                        title={
                                            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                                <Typography variant="h5" sx={{ flex: 1 }}>Memory Usage Over Time</Typography>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                    <TimeRangeSelector
                                                        timeRange={memoryTimeRange}
                                                        setTimeRange={setMemoryTimeRange}
                                                        customStartDate={memoryCustomStartDate}
                                                        setCustomStartDate={setMemoryCustomStartDate}
                                                        customEndDate={memoryCustomEndDate}
                                                        setCustomEndDate={setMemoryCustomEndDate}
                                                        showCustomDateRange={showMemoryCustomDateRange}
                                                        setShowCustomDateRange={setShowMemoryCustomDateRange}
                                                    />
                                                    {vmCpuRamData.length > 0 && (
                                                        <Button
                                                            variant="outlined"
                                                            size="small"
                                                            onClick={exportMemoryDataToCSV}
                                                            startIcon={<IconDownload size={20} />}
                                                            sx={{
                                                                borderRadius: 2,
                                                                textTransform: 'none',
                                                                fontWeight: 600,
                                                                px: 3,
                                                                py: 1,
                                                                fontSize: '0.875rem',
                                                                borderColor: (theme) => theme.palette.success.main,
                                                                color: (theme) => theme.palette.success.main,
                                                                backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(76, 175, 80, 0.05)' : 'rgba(76, 175, 80, 0.02)',
                                                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                                                '&:hover': {
                                                                    backgroundColor: (theme) => theme.palette.success.main,
                                                                    color: 'white',
                                                                    borderColor: (theme) => theme.palette.success.main,
                                                                    transform: 'translateY(-1px)',
                                                                    boxShadow: (theme) => `0 4px 12px ${theme.palette.success.main}40`,
                                                                },
                                                                '&:active': {
                                                                    transform: 'translateY(0)',
                                                                }
                                                            }}
                                                        >
                                                            Export CSV
                                                        </Button>
                                                    )}
                                                    {activeGraph === 'memory' && (
                                                        <Button
                                                            variant="outlined"
                                                            size="small"
                                                            onClick={scrollToOverview}
                                                            startIcon={<IconArrowUp size={20} />}
                                                            sx={{
                                                                borderRadius: 2,
                                                                textTransform: 'none',
                                                                fontWeight: 600,
                                                                px: 3,
                                                                py: 1,
                                                                fontSize: '0.875rem',
                                                                borderColor: (theme) => theme.palette.primary.main,
                                                                color: (theme) => theme.palette.primary.main,
                                                                backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(25, 118, 210, 0.05)' : 'rgba(25, 118, 210, 0.02)',
                                                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                                                '&:hover': {
                                                                    backgroundColor: (theme) => theme.palette.primary.main,
                                                                    color: 'white',
                                                                    borderColor: (theme) => theme.palette.primary.main,
                                                                    transform: 'translateY(-1px)',
                                                                    boxShadow: (theme) => `0 4px 12px ${theme.palette.primary.main}40`,
                                                                },
                                                                '&:active': {
                                                                    transform: 'translateY(0)',
                                                                }
                                                            }}
                                                        >
                                                            Back to Overview
                                                        </Button>
                                                    )}
                                                </Box>
                                            </Box>
                                        }
                                    >
                                {vmCpuRamData.length > 0 ? (
                                    <>
                                        <Box sx={{ height: 300, mt: 2 }}>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <LineChart
                                                    data={filterDataByTimeRange(vmCpuRamData, 'interval_start', memoryTimeRange, memoryCustomStartDate, memoryCustomEndDate).map(data => ({
                                                        time: new Date(data.interval_start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                                                        memory: parseFloat(data.avg_memory_usage_percent)
                                                    }))}
                                                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                                >
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis 
                                                        dataKey="time"
                                                        angle={-45}
                                                        textAnchor="end"
                                                        height={60}
                                                        label={{ 
                                                            value: 'Time of Data Collection', 
                                                            position: 'insideBottom', 
                                                            offset: -50,
                                                            style: { textAnchor: 'middle', fontSize: '12px' }
                                                        }}
                                                    />
                                                    <YAxis 
                                                        label={{ 
                                                            value: 'Memory Usage (%)', 
                                                            angle: -90, 
                                                            position: 'insideLeft',
                                                            style: { textAnchor: 'middle', fontSize: '12px' }
                                                        }}
                                                    />
                                                    <RechartsTooltip 
                                                        formatter={(value, name) => [
                                                            `${Number(value).toFixed(2)}%`, 
                                                            'Memory Usage'
                                                        ]}
                                                        labelFormatter={(label) => `Time: ${label}`}
                                                    />
                                                    <Legend />
                                                    <Line 
                                                        type="monotone" 
                                                        dataKey="memory" 
                                                        name="Memory Usage" 
                                                        stroke="#4caf50" 
                                                        strokeWidth={2}
                                                    />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </Box>
                                        {isMemoryInfoVisible ? (
                                            <Paper variant="outlined" sx={{ p: 2, mt: 2, position: 'relative', backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'grey.50', borderRadius: 2 }}>
                                                <Tooltip title="Dismiss explanation" arrow placement="top">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => setIsMemoryInfoVisible(false)}
                                                        sx={{
                                                            position: 'absolute',
                                                            top: 8,
                                                            right: 8,
                                                            color: (theme) => theme.palette.text.secondary,
                                                            backgroundColor: 'rgba(0,0,0,0.04)',
                                                            borderRadius: '50%',
                                                            width: 32,
                                                            height: 32,
                                                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                                            '&:hover': {
                                                                color: (theme) => theme.palette.error.main,
                                                                backgroundColor: (theme) => theme.palette.error.light + '20',
                                                                transform: 'scale(1.1) rotate(90deg)',
                                                                boxShadow: (theme) => `0 4px 12px ${theme.palette.error.main}40`,
                                                            },
                                                            '&:active': {
                                                                transform: 'scale(0.95) rotate(90deg)',
                                                            }
                                                        }}
                                                    >
                                                        <IconX size={18} />
                                                    </IconButton>
                                                </Tooltip>
                                                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                                                    Memory Usage Over Time
                                                </Typography>
                                                <Typography variant="body2" gutterBottom>
                                                    <b>X-Axis (Time):</b> Shows the time intervals when memory data was collected
                                                </Typography>
                                                <Typography variant="body2" gutterBottom>
                                                    <b>Y-Axis (Usage):</b> Memory usage percentage - higher values indicate more RAM being utilized
                                                </Typography>
                                                <Box sx={{ mt: 1 }}>
                                                    <Typography variant="body2" fontWeight={600}>Line Color:</Typography>
                                                    <Stack spacing={0.5} sx={{mt: 0.5}}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: '#4caf50' }} />
                                                            <Typography variant="caption">Green: Memory Usage</Typography>
                                                        </Box>
                                                    </Stack>
                                                </Box>
                                            </Paper>
                                        ) : (
                                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                                                <Button
                                                    size="small"
                                                    onClick={() => setIsMemoryInfoVisible(true)}
                                                    startIcon={<IconInfoCircle size={16} />}
                                                    variant="text"
                                                >
                                                    Show Memory Graph Explanation
                                                </Button>
                                            </Box>
                                        )}
                                    </>
                                ) : (
                                    <Typography variant="body2" color="textSecondary">
                                        No memory usage data available
                                    </Typography>
                                )}
                            </ParentCard>
                                </div>
                        </Grid>

                        {/* Disk Usage Over Time */}
                        <Grid item xs={12}>
                                <div ref={diskGraphRef}>
                                    <ParentCard 
                                        title={
                                            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                                <Typography variant="h5" sx={{ flex: 1 }}>Disk Usage Over Time</Typography>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                    <TimeRangeSelector
                                                        timeRange={diskTimeRange}
                                                        setTimeRange={setDiskTimeRange}
                                                        customStartDate={diskCustomStartDate}
                                                        setCustomStartDate={setDiskCustomStartDate}
                                                        customEndDate={diskCustomEndDate}
                                                        setCustomEndDate={setDiskCustomEndDate}
                                                        showCustomDateRange={showDiskCustomDateRange}
                                                        setShowCustomDateRange={setShowDiskCustomDateRange}
                                                    />
                                                    {vmDiskData.length > 0 && (
                                                        <Button
                                                            variant="outlined"
                                                            size="small"
                                                            onClick={exportDiskDataToCSV}
                                                            startIcon={<IconDownload size={20} />}
                                                            sx={{
                                                                borderRadius: 2,
                                                                textTransform: 'none',
                                                                fontWeight: 600,
                                                                px: 3,
                                                                py: 1,
                                                                fontSize: '0.875rem',
                                                                borderColor: (theme) => theme.palette.success.main,
                                                                color: (theme) => theme.palette.success.main,
                                                                backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(76, 175, 80, 0.05)' : 'rgba(76, 175, 80, 0.02)',
                                                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                                                '&:hover': {
                                                                    backgroundColor: (theme) => theme.palette.success.main,
                                                                    color: 'white',
                                                                    borderColor: (theme) => theme.palette.success.main,
                                                                    transform: 'translateY(-1px)',
                                                                    boxShadow: (theme) => `0 4px 12px ${theme.palette.success.main}40`,
                                                                },
                                                                '&:active': {
                                                                    transform: 'translateY(0)',
                                                                }
                                                            }}
                                                        >
                                                            Export CSV
                                                        </Button>
                                                    )}
                                                    {activeGraph === 'disk' && (
                                                        <Button
                                                            variant="outlined"
                                                            size="small"
                                                            onClick={scrollToOverview}
                                                            startIcon={<IconArrowUp size={20} />}
                                                            sx={{
                                                                borderRadius: 2,
                                                                textTransform: 'none',
                                                                fontWeight: 600,
                                                                px: 3,
                                                                py: 1,
                                                                fontSize: '0.875rem',
                                                                borderColor: (theme) => theme.palette.primary.main,
                                                                color: (theme) => theme.palette.primary.main,
                                                                backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(25, 118, 210, 0.05)' : 'rgba(25, 118, 210, 0.02)',
                                                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                                                '&:hover': {
                                                                    backgroundColor: (theme) => theme.palette.primary.main,
                                                                    color: 'white',
                                                                    borderColor: (theme) => theme.palette.primary.main,
                                                                    transform: 'translateY(-1px)',
                                                                    boxShadow: (theme) => `0 4px 12px ${theme.palette.primary.main}40`,
                                                                },
                                                                '&:active': {
                                                                    transform: 'translateY(0)',
                                                                }
                                                            }}
                                                        >
                                                            Back to Overview
                                                        </Button>
                                                    )}
                                                </Box>
                                            </Box>
                                        }
                                    >
                                {vmDiskData.length > 0 ? (
                                    <>
                                        <Box sx={{ height: 300, mt: 2 }}>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <LineChart
                                                    data={filterDataByTimeRange(vmDiskData, 'interval_start', diskTimeRange, diskCustomStartDate, diskCustomEndDate).map(data => ({
                                                        time: new Date(data.interval_start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                                                        used: parseFloat(data.avg_diskspace_used),
                                                        provisioned: parseFloat(data.avg_diskspace_provisioned),
                                                        percentage: parseFloat(data.avg_disk_usage_percent)
                                                    }))}
                                                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                                >
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis 
                                                        dataKey="time"
                                                        angle={-45}
                                                        textAnchor="end"
                                                        height={60}
                                                        label={{ 
                                                            value: 'Time of Data Collection', 
                                                            position: 'insideBottom', 
                                                            offset: -50,
                                                            style: { textAnchor: 'middle', fontSize: '12px' }
                                                        }}
                                                    />
                                                    <YAxis 
                                                        label={{ 
                                                            value: 'Disk Space (GB)', 
                                                            angle: -90, 
                                                            position: 'insideLeft',
                                                            style: { textAnchor: 'middle', fontSize: '12px' }
                                                        }}
                                                    />
                                                    <RechartsTooltip 
                                                        formatter={(value, name) => [
                                                            name === 'percentage' ? `${Number(value).toFixed(2)}%` : `${Number(value).toFixed(2)} GB`, 
                                                            name === 'used' ? 'Used Space' : 
                                                            name === 'provisioned' ? 'Total Provisioned' : 'Usage Percentage'
                                                        ]}
                                                        labelFormatter={(label) => `Time: ${label}`}
                                                    />
                                                    <Legend />
                                                    <Line 
                                                        type="monotone" 
                                                        dataKey="used" 
                                                        name="Used Space" 
                                                        stroke="#4caf50" 
                                                        strokeWidth={2}
                                                    />
                                                    <Line 
                                                        type="monotone" 
                                                        dataKey="provisioned" 
                                                        name="Total Provisioned" 
                                                        stroke="#ff9800" 
                                                        strokeWidth={2}
                                                    />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </Box>
                                        
                                        {isDiskInfoVisible ? (
                                            <Paper variant="outlined" sx={{ p: 2, mt: 2, position: 'relative', backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'grey.50', borderRadius: 2 }}>
                                                <Tooltip title="Dismiss explanation" arrow placement="top">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => setIsDiskInfoVisible(false)}
                                                        sx={{
                                                            position: 'absolute',
                                                            top: 8,
                                                            right: 8,
                                                            color: (theme) => theme.palette.text.secondary,
                                                            backgroundColor: 'rgba(0,0,0,0.04)',
                                                            borderRadius: '50%',
                                                            width: 32,
                                                            height: 32,
                                                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                                            '&:hover': {
                                                                color: (theme) => theme.palette.error.main,
                                                                backgroundColor: (theme) => theme.palette.error.light + '20',
                                                                transform: 'scale(1.1) rotate(90deg)',
                                                                boxShadow: (theme) => `0 4px 12px ${theme.palette.error.main}40`,
                                                            },
                                                            '&:active': {
                                                                transform: 'scale(0.95) rotate(90deg)',
                                                            }
                                                        }}
                                                    >
                                                        <IconX size={18} />
                                                    </IconButton>
                                                </Tooltip>
                                                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                                                    Disk Usage Over Time
                                                </Typography>
                                                <Typography variant="body2" gutterBottom>
                                                    <b>X-Axis (Time):</b> Shows the time intervals when disk data was collected
                                                </Typography>
                                                <Typography variant="body2" gutterBottom>
                                                    <b>Y-Axis (Space):</b> Disk space in gigabytes - shows both used and total provisioned space
                                                </Typography>
                                                <Box sx={{ mt: 1 }}>
                                                    <Typography variant="body2" fontWeight={600}>Line Colors:</Typography>
                                                    <Stack spacing={0.5} sx={{mt: 0.5}}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: '#4caf50' }} />
                                                            <Typography variant="caption">Green: Used Space</Typography>
                                                        </Box>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: '#ff9800' }} />
                                                            <Typography variant="caption">Orange: Total Provisioned</Typography>
                                                        </Box>
                                                    </Stack>
                                                </Box>
                                            </Paper>
                                        ) : (
                                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                                                <Button
                                                    size="small"
                                                    onClick={() => setIsDiskInfoVisible(true)}
                                                    startIcon={<IconInfoCircle size={16} />}
                                                    variant="text"
                                                >
                                                    Show Disk Graph Explanation
                                                </Button>
                                            </Box>
                                        )}
                                    </>
                                ) : (
                                    <Typography variant="body2" color="textSecondary">
                                        No disk usage data available
                                    </Typography>
                                )}
                            </ParentCard>
                                </div>
                        </Grid>

                        {/* System Alerts */}
                        <Grid item xs={12}>
                            <ParentCard title={
                                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                    <Typography variant="h5" sx={{ flex: 1 }}>System Alerts</Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <TimeRangeSelector
                                            timeRange={alertTimeRange}
                                            setTimeRange={setAlertTimeRange}
                                            customStartDate={alertCustomStartDate}
                                            setCustomStartDate={setAlertCustomStartDate}
                                            customEndDate={alertCustomEndDate}
                                            setCustomEndDate={setAlertCustomEndDate}
                                            showCustomDateRange={showAlertCustomDateRange}
                                            setShowCustomDateRange={setShowAlertCustomDateRange}
                                        />
                                        {vmAlertWindow.length > 0 && (
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                onClick={exportAlertsDataToCSV}
                                                startIcon={<IconDownload size={20} />}
                                                sx={{
                                                    borderRadius: 2,
                                                    textTransform: 'none',
                                                    fontWeight: 600,
                                                    px: 3,
                                                    py: 1,
                                                    fontSize: '0.875rem',
                                                    borderColor: (theme) => theme.palette.success.main,
                                                    color: (theme) => theme.palette.success.main,
                                                    backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(76, 175, 80, 0.05)' : 'rgba(76, 175, 80, 0.02)',
                                                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                                    '&:hover': {
                                                        backgroundColor: (theme) => theme.palette.success.main,
                                                        color: 'white',
                                                        borderColor: (theme) => theme.palette.success.main,
                                                        transform: 'translateY(-1px)',
                                                        boxShadow: (theme) => `0 4px 12px ${theme.palette.success.main}40`,
                                                    },
                                                    '&:active': {
                                                        transform: 'translateY(0)',
                                                    }
                                                }}
                                            >
                                                Export CSV
                                            </Button>
                                        )}
                                    </Box>
                                </Box>
                            }>
                                {vmAlertWindow.length > 0 && (
                                    <Box sx={{ mt: 3 }}>
                                        <Typography variant="subtitle1" gutterBottom>
                                            3-Day Alert Trends
                                        </Typography>
                                            
                                            {/* Alert Graph Line Toggle Controls */}
                                            <Box sx={{ mb: 2 }}>
                                                <Typography variant="subtitle2" fontWeight={600} gutterBottom sx={{ mb: 1 }}>
                                                    <IconChartLine size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                                                    Toggle Alert Lines (Click to show/hide):
                                                </Typography>
                                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                                    <Button
                                                        size="small"
                                                        variant={showCriticalAlerts ? "contained" : "outlined"}
                                                        onClick={() => setShowCriticalAlerts(!showCriticalAlerts)}
                                                        sx={{
                                                            minWidth: 'auto',
                                                            px: 2.5,
                                                            py: 0.75,
                                                            backgroundColor: showCriticalAlerts ? '#f44336' : 'transparent',
                                                            color: showCriticalAlerts ? 'white' : '#f44336',
                                                            borderColor: '#f44336',
                                                            borderRadius: 2,
                                                            fontWeight: 600,
                                                            textTransform: 'none',
                                                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                                            '&:hover': {
                                                                backgroundColor: showCriticalAlerts ? '#d32f2f' : 'rgba(244, 67, 54, 0.1)',
                                                                transform: 'translateY(-1px)',
                                                                boxShadow: showCriticalAlerts ? '0 4px 12px rgba(244, 67, 54, 0.4)' : 'none',
                                                            },
                                                            '&:active': {
                                                                transform: 'translateY(0)',
                                                            }
                                                        }}
                                                    >
                                                        Critical
                                                    </Button>
                                                    <Button
                                                        size="small"
                                                        variant={showImmediateAlerts ? "contained" : "outlined"}
                                                        onClick={() => setShowImmediateAlerts(!showImmediateAlerts)}
                                                        sx={{
                                                            minWidth: 'auto',
                                                            px: 2.5,
                                                            py: 0.75,
                                                            backgroundColor: showImmediateAlerts ? '#ff9800' : 'transparent',
                                                            color: showImmediateAlerts ? 'white' : '#ff9800',
                                                            borderColor: '#ff9800',
                                                            borderRadius: 2,
                                                            fontWeight: 600,
                                                            textTransform: 'none',
                                                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                                            '&:hover': {
                                                                backgroundColor: showImmediateAlerts ? '#f57c00' : 'rgba(255, 152, 0, 0.1)',
                                                                transform: 'translateY(-1px)',
                                                                boxShadow: showImmediateAlerts ? '0 4px 12px rgba(255, 152, 0, 0.4)' : 'none',
                                                            },
                                                            '&:active': {
                                                                transform: 'translateY(0)',
                                                            }
                                                        }}
                                                    >
                                                        Immediate
                                                    </Button>
                                                    <Button
                                                        size="small"
                                                        variant={showWarningAlerts ? "contained" : "outlined"}
                                                        onClick={() => setShowWarningAlerts(!showWarningAlerts)}
                                                        sx={{
                                                            minWidth: 'auto',
                                                            px: 2.5,
                                                            py: 0.75,
                                                            backgroundColor: showWarningAlerts ? '#4caf50' : 'transparent',
                                                            color: showWarningAlerts ? 'white' : '#4caf50',
                                                            borderColor: '#4caf50',
                                                            borderRadius: 2,
                                                            fontWeight: 600,
                                                            textTransform: 'none',
                                                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                                            '&:hover': {
                                                                backgroundColor: showWarningAlerts ? '#388e3c' : 'rgba(76, 175, 80, 0.1)',
                                                                transform: 'translateY(-1px)',
                                                                boxShadow: showWarningAlerts ? '0 4px 12px rgba(76, 175, 80, 0.4)' : 'none',
                                                            },
                                                            '&:active': {
                                                                transform: 'translateY(0)',
                                                            }
                                                        }}
                                                    >
                                                        Warning
                                                    </Button>
                                                </Box>
                                            </Box>
                                            
                                            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2, flexWrap: 'wrap', alignItems: 'flex-end', gap: 4 }}>
                                                {/* Stacked Bar Graph (inline, compact) */}
                                                <Box sx={{ minWidth: 220, maxWidth: 320, height: 100, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end' }}>
                                                    <Typography variant="caption" sx={{ color: 'error.main', fontWeight: 600, mb: 0.5 }}>
                                                        (Demo: Using dummy data)
                                                    </Typography>
                                                    <ResponsiveContainer width="100%" height={70}>
                                                        <BarChart
                                                            data={[
                                                                { period: 'Day 1', critical: 1, immediate: 2, warning: 3 },
                                                                { period: 'Day 2', critical: 0, immediate: 1, warning: 5 },
                                                                { period: 'Day 3', critical: 2, immediate: 3, warning: 1 },
                                                                { period: 'Current', critical: avgCritical, immediate: avgImmediate, warning: avgWarning }
                                                            ]}
                                                            margin={{ top: 0, right: 10, left: 10, bottom: 0 }}
                                                        >
                                                            <XAxis dataKey="period" />
                                                            <YAxis hide />
                                                            <Bar dataKey="critical" name="Critical" stackId="a" fill="#f44336" />
                                                            <Bar dataKey="immediate" name="Immediate" stackId="a" fill="#ff9800" />
                                                            <Bar dataKey="warning" name="Warning" stackId="a" fill="#4caf50" />
                                                        </BarChart>
                                                    </ResponsiveContainer>
                                                    <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                                                        <Box sx={{ width: 10, height: 10, bgcolor: '#f44336', borderRadius: '2px' }} />
                                                        <Box sx={{ width: 10, height: 10, bgcolor: '#ff9800', borderRadius: '2px' }} />
                                                        <Box sx={{ width: 10, height: 10, bgcolor: '#4caf50', borderRadius: '2px' }} />
                                                    </Box>
                                                </Box>
                                            </Box>
                                            
                                            {/* Time-based Alert Graph */}
                                        <Box sx={{ height: 200, mt: 2 }}>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <LineChart
                                                    data={getAveragedAlertWindowData(vmAlertWindow)}
                                                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                                >
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis 
                                                        dataKey="time"
                                                        angle={-45}
                                                        textAnchor="end"
                                                        height={60}
                                                        label={{ 
                                                            value: 'Time Period', 
                                                            position: 'insideBottom', 
                                                            offset: -50,
                                                            style: { textAnchor: 'middle', fontSize: '12px' }
                                                        }}
                                                    />
                                                    <YAxis 
                                                        label={{ 
                                                            value: 'Average Alert Count', 
                                                            angle: -90, 
                                                            position: 'insideLeft',
                                                            style: { textAnchor: 'middle', fontSize: '12px' }
                                                        }}
                                                        tickFormatter={(value) => Math.round(value).toString()}
                                                        domain={[0, 'dataMax + 1']}
                                                        ticks={(() => {
                                                            const maxValue = Math.max(
                                                                ...getAveragedAlertWindowData(vmAlertWindow).flatMap(d => [d.critical, d.immediate, d.warning])
                                                            );
                                                            const maxTick = Math.ceil(maxValue) + 1;
                                                            return Array.from({length: maxTick + 1}, (_, i) => i);
                                                        })()}
                                                    />
                                                    <RechartsTooltip 
                                                        formatter={(value, name) => [
                                                            `${Number(value).toFixed(2)} alerts`, 
                                                            name === 'critical' ? 'Critical Alerts' : 
                                                            name === 'immediate' ? 'Immediate Alerts' : 'Warning Alerts'
                                                        ]}
                                                        labelFormatter={(label) => `Time: ${label}`}
                                                    />
                                                    <Legend />
                                                        {showCriticalAlerts && (
                                                    <Line 
                                                        type="monotone" 
                                                        dataKey="critical" 
                                                        name="Critical" 
                                                        stroke="#f44336" 
                                                        strokeWidth={2}
                                                    />
                                                        )}
                                                        {showImmediateAlerts && (
                                                    <Line 
                                                        type="monotone" 
                                                        dataKey="immediate" 
                                                        name="Immediate" 
                                                        stroke="#ff9800" 
                                                        strokeWidth={2}
                                                    />
                                                        )}
                                                        {showWarningAlerts && (
                                                    <Line 
                                                        type="monotone" 
                                                        dataKey="warning" 
                                                        name="Warning" 
                                                        stroke="#4caf50" 
                                                        strokeWidth={2}
                                                    />
                                                        )}
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </Box>
                                            
                                            {/* Stacked Bar Graph */}
                                            <Box sx={{ mt: 4 }}>
                                                <Typography variant="h6" gutterBottom sx={{ textAlign: 'center', mb: 1 }}>
                                                    Alert Distribution (Stacked Bar View)
                                                </Typography>
                                                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                                                    <Typography variant="caption" sx={{ color: 'error.main', fontWeight: 600 }}>
                                                        (Demo: Using dummy data for visualization)
                                                    </Typography>
                                                </Box>
                                                <Box sx={{ height: 200, mt: 2 }}>
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <BarChart
                                                            data={[
                                                                {
                                                                    period: 'Current',
                                                                    critical: avgCritical,
                                                                    immediate: avgImmediate,
                                                                    warning: avgWarning
                                                                }
                                                            ]}
                                                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                                        >
                                                            <CartesianGrid strokeDasharray="3 3" />
                                                            <XAxis dataKey="period" />
                                                            <YAxis 
                                                                label={{ 
                                                                    value: 'Alert Count', 
                                                                    angle: -90, 
                                                                    position: 'insideLeft',
                                                                    style: { textAnchor: 'middle', fontSize: '12px' }
                                                                }}
                                                            />
                                                            <RechartsTooltip 
                                                                formatter={(value, name) => [
                                                                    `${Number(value).toFixed(0)} alerts`, 
                                                                    name === 'critical' ? 'Critical Alerts' : 
                                                                    name === 'immediate' ? 'Immediate Alerts' : 'Warning Alerts'
                                                                ]}
                                                            />
                                                            <Legend />
                                                            <Bar dataKey="critical" name="Critical" stackId="a" fill="#f44336" />
                                                            <Bar dataKey="immediate" name="Immediate" stackId="a" fill="#ff9800" />
                                                            <Bar dataKey="warning" name="Warning" stackId="a" fill="#4caf50" />
                                                        </BarChart>
                                                    </ResponsiveContainer>
                                                </Box>
                                            </Box>
                                        
                                        {isAlertInfoVisible ? (
                                            <Paper variant="outlined" sx={{ p: 2, mt: 2, position: 'relative', backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'grey.50', borderRadius: 2 }}>
                                                <Tooltip title="Dismiss explanation" arrow placement="top">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => setIsAlertInfoVisible(false)}
                                                        sx={{
                                                            position: 'absolute',
                                                            top: 8,
                                                            right: 8,
                                                            color: (theme) => theme.palette.text.secondary,
                                                            backgroundColor: 'rgba(0,0,0,0.04)',
                                                            borderRadius: '50%',
                                                            width: 32,
                                                            height: 32,
                                                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                                            '&:hover': {
                                                                color: (theme) => theme.palette.error.main,
                                                                backgroundColor: (theme) => theme.palette.error.light + '20',
                                                                transform: 'scale(1.1) rotate(90deg)',
                                                                boxShadow: (theme) => `0 4px 12px ${theme.palette.error.main}40`,
                                                            },
                                                            '&:active': {
                                                                transform: 'scale(0.95) rotate(90deg)',
                                                            }
                                                        }}
                                                    >
                                                        <IconX size={18} />
                                                    </IconButton>
                                                </Tooltip>
                                                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                                                    Alert Activity Over Time
                                                </Typography>
                                                <Typography variant="body2" gutterBottom>
                                                    <b>X-Axis (Time):</b> Shows the time periods when alert data was collected over 3 days
                                                </Typography>
                                                <Typography variant="body2" gutterBottom>
                                                    <b>Y-Axis (Count):</b> Average number of alerts - higher values indicate more system issues
                                                </Typography>
                                                <Box sx={{ mt: 1 }}>
                                                    <Typography variant="body2" fontWeight={600}>Line Colors:</Typography>
                                                    <Stack spacing={0.5} sx={{mt: 0.5}}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: '#f44336' }} />
                                                            <Typography variant="caption">Red: Critical Alerts</Typography>
                                                        </Box>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: '#ff9800' }} />
                                                            <Typography variant="caption">Amber: Immediate Alerts</Typography>
                                                        </Box>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: '#4caf50' }} />
                                                            <Typography variant="caption">Green: Warning Alerts</Typography>
                                                        </Box>
                                                    </Stack>
                                                </Box>
                                                    <Box sx={{ mt: 2, p: 1.5, backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(25, 118, 210, 0.1)' : 'rgba(25, 118, 210, 0.05)', borderRadius: 1, border: '1px solid', borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(25, 118, 210, 0.3)' : 'rgba(25, 118, 210, 0.2)' }}>
                                                        <Typography variant="body2" sx={{ color: (theme) => theme.palette.primary.main, fontWeight: 500 }}>
                                                            <IconBulb size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                                                            <b>Tip:</b> Use the toggle buttons above the graph to show/hide specific alert types for better analysis!
                                                        </Typography>
                                                    </Box>
                                            </Paper>
                                        ) : (
                                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                                                <Button
                                                    size="small"
                                                    onClick={() => setIsAlertInfoVisible(true)}
                                                    startIcon={<IconInfoCircle size={16} />}
                                                    variant="text"
                                                >
                                                    Show Alert Graph Explanation
                                                </Button>
                                            </Box>
                                        )}
                                    </Box>
                                )}
                            </ParentCard>
                        </Grid>
                    </Grid>
                ) : (
                    <Typography variant="body1" color="error">
                        Failed to load VM telemetry data. Please try again.
                    </Typography>
                )
            ) : (
                <Typography variant="body1" color="textSecondary">
                    Select a VM from the VM Data table to view detailed information.
                </Typography>
            )}
        </ParentCard>
        </>
    );
};

export default VMDataIndividual; 