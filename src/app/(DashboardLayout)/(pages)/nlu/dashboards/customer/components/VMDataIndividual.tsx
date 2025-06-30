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
    IconButton
} from '@mui/material';
import { IconServer, IconCpu, IconDatabase, IconPower, IconInfoCircle, IconX, IconChartLine, IconBulb, IconArrowUp } from '@tabler/icons-react';
import ParentCard from '@/app/components/shared/ParentCard';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, Area } from 'recharts';

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

    // Parse values for health, workload, and efficiency
    const healthValue = vmHealthWindow.length > 0 ? parseFloat(vmHealthWindow[0].avg_badge_health) : 0;
    const workloadValue = vmHealthWindow.length > 0 ? parseFloat(vmHealthWindow[0].avg_badge_workload) : 0;
    const efficiencyValue = vmHealthWindow.length > 0 ? parseFloat(vmHealthWindow[0].avg_badge_efficiency) : 0;

    // Color logic functions
    const getHealthColor = (val: number) => val >= 75 ? '#4caf50' : val >= 50 ? '#ff9800' : '#f44336';
    const getEfficiencyColor = (val: number) => val >= 75 ? '#4caf50' : val >= 50 ? '#ff9800' : '#f44336';
    const getWorkloadColor = (val: number) => val < 60 ? '#4caf50' : val < 80 ? '#ff9800' : '#f44336';

    return (
        <ParentCard title={
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                width: '100%',
                gap: 3
            }}>
                <Typography variant="h5">Individual VM Details</Typography>
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
                                            {vmCpuRamData.length > 0 && vmCpuRamData[vmCpuRamData.length - 1].avg_cpu_usage_percent
                                                ? `${Number(vmCpuRamData[vmCpuRamData.length - 1].avg_cpu_usage_percent).toFixed(2)}%`
                                                : vmTelemetry?.cpu_usage_avg 
                                                    ? `${Number(vmTelemetry.cpu_usage_avg).toFixed(2)}%`
                                                    : '0%'}
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
                                            {vmCpuRamData.length > 0 && vmCpuRamData[vmCpuRamData.length - 1].avg_memory_usage_percent
                                                ? `${Number(vmCpuRamData[vmCpuRamData.length - 1].avg_memory_usage_percent).toFixed(2)}%`
                                                : vmTelemetry?.memory_usage_avg 
                                                    ? `${Number(vmTelemetry.memory_usage_avg).toFixed(2)}%`
                                                    : '0%'}
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
                                            {vmDiskData.length > 0 && vmDiskData[vmDiskData.length - 1].avg_disk_usage_percent
                                                ? `${Number(vmDiskData[vmDiskData.length - 1].avg_disk_usage_percent).toFixed(2)}%`
                                                : '0%'}
                                        </Typography>
                                        <Typography variant="subtitle2" color="textSecondary">
                                            {vmDiskData.length > 0 
                                                ? `${Number(vmDiskData[vmDiskData.length - 1].avg_diskspace_used).toFixed(2)} GB Used / ${Number(vmDiskData[vmDiskData.length - 1].avg_diskspace_provisioned).toFixed(2)} GB Total`
                                                : 'No disk data available'}
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
                            <ParentCard title="Network Usage">
                                {vmNetworkData.length > 0 ? (
                                    <>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                            <Typography variant="subtitle1">
                                                Current Network Usage
                                            </Typography>
                                            <Typography variant="h4">
                                                {parseFloat(vmNetworkData[vmNetworkData.length - 1].avg_net_usage_kbps).toFixed(2)} kbps
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                            <Typography variant="subtitle1">
                                                Network Received
                                            </Typography>
                                            <Typography variant="h4">
                                                {parseFloat(vmNetworkData[vmNetworkData.length - 1].avg_net_received_kbps).toFixed(2)} kbps
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                            <Typography variant="subtitle1">
                                                Network Transmitted
                                            </Typography>
                                            <Typography variant="h4">
                                                {vmNetworkData.length > 0 && vmNetworkData[vmNetworkData.length - 1].avg_net_transmit_kbps
                                                    ? parseFloat(vmNetworkData[vmNetworkData.length - 1].avg_net_transmit_kbps).toFixed(2)
                                                    : '0.00'} kbps
                                            </Typography>
                                        </Box>
                                        
                                        {/* Graph Line Toggle Controls */}
                                        <Box sx={{ mb: 2 }}>
                                            <Typography variant="subtitle2" fontWeight={600} gutterBottom sx={{ mb: 1 }}>
                                                <IconChartLine size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                                                Toggle Graph Lines (Click to show/hide):
                                            </Typography>
                                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                                <Button
                                                    size="small"
                                                    variant={showTotalUsage ? "contained" : "outlined"}
                                                    onClick={() => setShowTotalUsage(!showTotalUsage)}
                                                    sx={{
                                                        minWidth: 'auto',
                                                        px: 2,
                                                        py: 0.5,
                                                        backgroundColor: showTotalUsage ? '#8884d8' : 'transparent',
                                                        color: showTotalUsage ? 'white' : '#8884d8',
                                                        borderColor: '#8884d8',
                                                        '&:hover': {
                                                            backgroundColor: showTotalUsage ? '#7a73c7' : 'rgba(136, 132, 216, 0.1)',
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
                                                        px: 2,
                                                        py: 0.5,
                                                        backgroundColor: showReceived ? '#82ca9d' : 'transparent',
                                                        color: showReceived ? 'white' : '#82ca9d',
                                                        borderColor: '#82ca9d',
                                                        '&:hover': {
                                                            backgroundColor: showReceived ? '#6bb88c' : 'rgba(130, 202, 157, 0.1)',
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
                                                        px: 2,
                                                        py: 0.5,
                                                        backgroundColor: showTransmitted ? '#ffc658' : 'transparent',
                                                        color: showTransmitted ? 'white' : '#ffc658',
                                                        borderColor: '#ffc658',
                                                        '&:hover': {
                                                            backgroundColor: showTransmitted ? '#e6b24f' : 'rgba(255, 198, 88, 0.1)',
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
                                                    data={vmNetworkData.map(data => ({
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
                                                        stroke="#8884d8" 
                                                        strokeWidth={2}
                                                    />
                                                    )}
                                                    {showReceived && (
                                                    <Line 
                                                        type="monotone" 
                                                        dataKey="received" 
                                                        name="Received" 
                                                        stroke="#82ca9d" 
                                                        strokeWidth={2}
                                                    />
                                                    )}
                                                    {showTransmitted && (
                                                    <Line 
                                                        type="monotone" 
                                                        dataKey="transmitted" 
                                                        name="Transmitted" 
                                                        stroke="#ffc658" 
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
                                                            <Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: '#8884d8' }} />
                                                            <Typography variant="caption">Purple: Total Usage</Typography>
                                                        </Box>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: '#82ca9d' }} />
                                                            <Typography variant="caption">Green: Data Received</Typography>
                                                        </Box>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: '#ffc658' }} />
                                                            <Typography variant="caption">Orange: Data Sent</Typography>
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
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                            <Typography variant="h5">CPU Usage Over Time</Typography>
                                            {activeGraph === 'cpu' && (
                                                <Button
                                                    variant="outlined"
                                                    size="small"
                                                    onClick={scrollToOverview}
                                                    startIcon={<IconArrowUp size={16} />}
                                                    sx={{
                                                        borderRadius: 2,
                                                        textTransform: 'none',
                                                        fontWeight: 500,
                                                        px: 2,
                                                        py: 0.5,
                                                        borderColor: (theme) => theme.palette.primary.main,
                                                        color: (theme) => theme.palette.primary.main,
                                                        ml: 2,
                                                        '&:hover': {
                                                            backgroundColor: (theme) => theme.palette.primary.main,
                                                            color: 'white',
                                                            borderColor: (theme) => theme.palette.primary.main,
                                                        }
                                                    }}
                                                >
                                                    Back to Overview
                                                </Button>
                                            )}
                                        </Box>
                                    }
                                >
                                {vmCpuRamData.length > 0 ? (
                                    <>
                                        <Box sx={{ height: 300, mt: 2 }}>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <LineChart
                                                    data={vmCpuRamData.map(data => ({
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
                                                        stroke="#82ca9d" 
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
                                                            <Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: '#82ca9d' }} />
                                                            <Typography variant="caption">Green: CPU Usage</Typography>
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
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                            <Typography variant="h5">Memory Usage Over Time</Typography>
                                            {activeGraph === 'memory' && (
                                                <Button
                                                    variant="outlined"
                                                    size="small"
                                                    onClick={scrollToOverview}
                                                    startIcon={<IconArrowUp size={16} />}
                                                    sx={{
                                                        borderRadius: 2,
                                                        textTransform: 'none',
                                                        fontWeight: 500,
                                                        px: 2,
                                                        py: 0.5,
                                                        borderColor: (theme) => theme.palette.primary.main,
                                                        color: (theme) => theme.palette.primary.main,
                                                        ml: 2,
                                                        '&:hover': {
                                                            backgroundColor: (theme) => theme.palette.primary.main,
                                                            color: 'white',
                                                            borderColor: (theme) => theme.palette.primary.main,
                                                        }
                                                    }}
                                                >
                                                    Back to Overview
                                                </Button>
                                            )}
                                        </Box>
                                    }
                                >
                                {vmCpuRamData.length > 0 ? (
                                    <>
                                        <Box sx={{ height: 300, mt: 2 }}>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <LineChart
                                                    data={vmCpuRamData.map(data => ({
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
                                                        stroke="#8884d8" 
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
                                                            <Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: '#8884d8' }} />
                                                            <Typography variant="caption">Purple: Memory Usage</Typography>
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
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                            <Typography variant="h5">Disk Usage Over Time</Typography>
                                            {activeGraph === 'disk' && (
                                                <Button
                                                    variant="outlined"
                                                    size="small"
                                                    onClick={scrollToOverview}
                                                    startIcon={<IconArrowUp size={16} />}
                                                    sx={{
                                                        borderRadius: 2,
                                                        textTransform: 'none',
                                                        fontWeight: 500,
                                                        px: 2,
                                                        py: 0.5,
                                                        borderColor: (theme) => theme.palette.primary.main,
                                                        color: (theme) => theme.palette.primary.main,
                                                        ml: 2,
                                                        '&:hover': {
                                                            backgroundColor: (theme) => theme.palette.primary.main,
                                                            color: 'white',
                                                            borderColor: (theme) => theme.palette.primary.main,
                                                        }
                                                    }}
                                                >
                                                    Back to Overview
                                                </Button>
                                            )}
                                        </Box>
                                    }
                                >
                                {vmDiskData.length > 0 ? (
                                    <>
                                        <Box sx={{ height: 300, mt: 2 }}>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <LineChart
                                                    data={vmDiskData.map(data => ({
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
                                                        stroke="#ffc658" 
                                                        strokeWidth={2}
                                                    />
                                                    <Line 
                                                        type="monotone" 
                                                        dataKey="provisioned" 
                                                        name="Total Provisioned" 
                                                        stroke="#ff8042" 
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
                                                            <Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: '#ffc658' }} />
                                                            <Typography variant="caption">Yellow: Used Space</Typography>
                                                        </Box>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: '#ff8042' }} />
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
                            <ParentCard title="System Alerts">
                                {vmAlertWindow.length > 0 && (
                                    <Box sx={{ mt: 3 }}>
                                        <Typography variant="subtitle1" gutterBottom>
                                            3-Day Alert Trends
                                        </Typography>
                                        
                                        {/* Alert Graph Line Toggle Controls */}
                                        <Box sx={{ mb: 2 }}>
                                            <Typography variant="subtitle2" fontWeight={600} gutterBottom sx={{ mb: 1 }}>
                                                <IconChartLine size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                                                Toggle Alert Lines (Click to show/hide):
                                            </Typography>
                                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                                <Button
                                                    size="small"
                                                    variant={showCriticalAlerts ? "contained" : "outlined"}
                                                    onClick={() => setShowCriticalAlerts(!showCriticalAlerts)}
                                                    sx={{
                                                        minWidth: 'auto',
                                                        px: 2,
                                                        py: 0.5,
                                                        backgroundColor: showCriticalAlerts ? '#f44336' : 'transparent',
                                                        color: showCriticalAlerts ? 'white' : '#f44336',
                                                        borderColor: '#f44336',
                                                        '&:hover': {
                                                            backgroundColor: showCriticalAlerts ? '#d32f2f' : 'rgba(244, 67, 54, 0.1)',
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
                                                        px: 2,
                                                        py: 0.5,
                                                        backgroundColor: showImmediateAlerts ? '#2196f3' : 'transparent',
                                                        color: showImmediateAlerts ? 'white' : '#2196f3',
                                                        borderColor: '#2196f3',
                                                        '&:hover': {
                                                            backgroundColor: showImmediateAlerts ? '#1976d2' : 'rgba(33, 150, 243, 0.1)',
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
                                                        px: 2,
                                                        py: 0.5,
                                                        backgroundColor: showWarningAlerts ? '#ff9800' : 'transparent',
                                                        color: showWarningAlerts ? 'white' : '#ff9800',
                                                        borderColor: '#ff9800',
                                                        '&:hover': {
                                                            backgroundColor: showWarningAlerts ? '#f57c00' : 'rgba(255, 152, 0, 0.1)',
                                                        }
                                                    }}
                                                >
                                                    Warning
                                                </Button>
                                            </Box>
                                        </Box>
                                        
                                        <Box sx={{ height: 200, mt: 2 }}>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <LineChart
                                                    data={vmAlertWindow.map(data => ({
                                                        time: new Date(data.bucket).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                                                        critical: parseFloat(data.avg_critical),
                                                        immediate: parseFloat(data.avg_immediate),
                                                        warning: parseFloat(data.avg_warning)
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
                                                        stroke="#2196f3" 
                                                        strokeWidth={2}
                                                    />
                                                    )}
                                                    {showWarningAlerts && (
                                                    <Line 
                                                        type="monotone" 
                                                        dataKey="warning" 
                                                        name="Warning" 
                                                        stroke="#ff9800" 
                                                        strokeWidth={2}
                                                    />
                                                    )}
                                                </LineChart>
                                            </ResponsiveContainer>
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
                                                            <Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: '#2196f3' }} />
                                                            <Typography variant="caption">Blue: Immediate Alerts</Typography>
                                                        </Box>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: '#ff9800' }} />
                                                            <Typography variant="caption">Orange: Warning Alerts</Typography>
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
    );
};

export default VMDataIndividual; 