'use client';
import React, { useState } from 'react';
import {
    Box,
    Typography,
    Grid,
    Paper,
    CircularProgress,
    Button,
    Stack
} from '@mui/material';
import { IconServer, IconCpu, IconDatabase, IconPower } from '@tabler/icons-react';
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
                            {/* <Typography variant="subtitle1" color="textSecondary">
                                Region: {selectedVM.vcenter_region}
                            </Typography> */}
                            
                        </Grid>

                        {/* Resource Usage */}
                        <Grid item xs={12} md={4}>
                            <ParentCard title="CPU Usage">
                                <Stack direction="row" alignItems="center" spacing={2}>
                                    <IconCpu size={32} color="#82ca9d" />
                                    <Box>
                                        <Typography variant="h4">
                                            {vmCpuRamData.length > 0 && vmCpuRamData[vmCpuRamData.length - 1].cpu_usage_avg
                                                ? `${Number(vmCpuRamData[vmCpuRamData.length - 1].cpu_usage_avg).toFixed(2)}%`
                                                : vmTelemetry?.cpu_usage_avg 
                                                    ? `${Number(vmTelemetry.cpu_usage_avg).toFixed(2)}%`
                                                    : '0%'}
                                        </Typography>
                                        <Typography variant="subtitle2" color="textSecondary">
                                            {vmTelemetry?.cpu_count || 0} Cores ({vmTelemetry?.cpu_cores_per_socket || 0} per socket)
                                        </Typography>
                                    </Box>
                                </Stack>
                            </ParentCard>
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <ParentCard title="Memory Usage">
                                <Stack direction="row" alignItems="center" spacing={2}>
                                    <IconDatabase size={32} color="#8884d8" />
                                    <Box>
                                        <Typography variant="h4">
                                            {vmCpuRamData.length > 0 && vmCpuRamData[vmCpuRamData.length - 1].memory_usage_avg
                                                ? `${Number(vmCpuRamData[vmCpuRamData.length - 1].memory_usage_avg).toFixed(2)}%`
                                                : vmTelemetry?.memory_usage_avg 
                                                    ? `${Number(vmTelemetry.memory_usage_avg).toFixed(2)}%`
                                                    : '0%'}
                                        </Typography>
                                        <Typography variant="subtitle2" color="textSecondary">
                                            {Math.round((vmTelemetry?.memory_size_mib || 0) / 1024)} GB Total
                                        </Typography>
                                    </Box>
                                </Stack>
                            </ParentCard>
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <ParentCard title="Disk Usage">
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
                            </ParentCard>
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
                                                            backgroundColor: vmHealthWindow[0].badge_health_status === 'green' ? '#4caf50' :
                                                                            vmHealthWindow[0].badge_health_status === 'amber' ? '#ff9800' : '#f44336'
                                                        }}>
                                                            <Typography variant="h4" sx={{ color: 'white' }}>
                                                                {parseFloat(vmHealthWindow[0].avg_badge_health).toFixed(1)}%
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
                                                            backgroundColor: vmHealthWindow[0].badge_workload_status === 'green' ? '#4caf50' :
                                                                            vmHealthWindow[0].badge_workload_status === 'amber' ? '#ff9800' : '#f44336'
                                                        }}>
                                                            <Typography variant="h4" sx={{ color: 'white' }}>
                                                                {parseFloat(vmHealthWindow[0].avg_badge_workload).toFixed(1)}%
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
                                                            backgroundColor: vmHealthWindow[0].badge_efficiency_status === 'green' ? '#4caf50' :
                                                                            vmHealthWindow[0].badge_efficiency_status === 'amber' ? '#ff9800' : '#f44336'
                                                        }}>
                                                            <Typography variant="h4" sx={{ color: 'white' }}>
                                                                {parseFloat(vmHealthWindow[0].avg_badge_efficiency).toFixed(1)}%
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </Grid>
                                            </Grid>
                                        </Box>
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
                                        <Box sx={{ height: 300, mt: 2 }}>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <LineChart
                                                    data={vmNetworkData.map(data => ({
                                                        time: new Date(data.interval_start).toLocaleTimeString(),
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
                                                    />
                                                    <YAxis />
                                                    <RechartsTooltip />
                                                    <Legend />
                                                    <Line 
                                                        type="monotone" 
                                                        dataKey="usage" 
                                                        name="Total Usage" 
                                                        stroke="#8884d8" 
                                                        strokeWidth={2}
                                                    />
                                                    <Line 
                                                        type="monotone" 
                                                        dataKey="received" 
                                                        name="Received" 
                                                        stroke="#82ca9d" 
                                                        strokeWidth={2}
                                                    />
                                                    <Line 
                                                        type="monotone" 
                                                        dataKey="transmitted" 
                                                        name="Transmitted" 
                                                        stroke="#ffc658" 
                                                        strokeWidth={2}
                                                    />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </Box>
                                        {/* <Typography variant="caption" color="textSecondary" sx={{ mt: 2, display: 'block' }}>
                                            Last updated: {new Date(vmNetworkData[vmNetworkData.length - 1].interval_start).toLocaleString()}
                                        </Typography> */}
                                    </>
                                ) : (
                                    <Typography variant="body2" color="textSecondary">
                                        No network data available
                                    </Typography>
                                )}
                            </ParentCard>
                        </Grid>



                        {/* System Alerts */}
                        <Grid item xs={12}>
                            <ParentCard title="System Alerts">
                                {/* <Box sx={{ mb: 2 }}>
                                    <Typography variant="subtitle1" gutterBottom>
                                        Total Alerts: {vmTelemetry?.systemattributes_total_alert_count}
                                    </Typography>
                                    <Typography variant="body2" color="error">
                                        Critical: {vmTelemetry?.systemattributes_alert_count_critical}
                                    </Typography>
                                    <Typography variant="body2" color="warning.main">
                                        Warning: {vmTelemetry?.systemattributes_alert_count_warning}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="subtitle1" gutterBottom>
                                        System Health: {vmTelemetry?.systemattributes_health}
                                    </Typography>
                                </Box> */}
                                {vmAlertWindow.length > 0 && (
                                    <Box sx={{ mt: 3 }}>
                                        <Typography variant="subtitle1" gutterBottom>
                                            3-Day Alert Trends
                                        </Typography>
                                        <Box sx={{ height: 200, mt: 2 }}>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <LineChart
                                                    data={vmAlertWindow.map(data => ({
                                                        time: new Date(data.bucket).toLocaleTimeString(),
                                                        critical: parseFloat(data.avg_critical),
                                                        immediate: parseFloat(data.avg_immediate),
                                                        warning: parseFloat(data.avg_warning),
                                                        info: parseFloat(data.avg_info)
                                                    }))}
                                                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                                >
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis 
                                                        dataKey="time"
                                                        angle={-45}
                                                        textAnchor="end"
                                                        height={60}
                                                    />
                                                    <YAxis />
                                                    <RechartsTooltip />
                                                    <Legend />
                                                    <Line 
                                                        type="monotone" 
                                                        dataKey="critical" 
                                                        name="Critical" 
                                                        stroke="#f44336" 
                                                        strokeWidth={2}
                                                    />
                                                    <Line 
                                                        type="monotone" 
                                                        dataKey="immediate" 
                                                        name="Immediate" 
                                                        stroke="#ff9800" 
                                                        strokeWidth={2}
                                                    />
                                                    <Line 
                                                        type="monotone" 
                                                        dataKey="warning" 
                                                        name="Warning" 
                                                        stroke="#ffc107" 
                                                        strokeWidth={2}
                                                    />
                                                    <Line 
                                                        type="monotone" 
                                                        dataKey="info" 
                                                        name="Info" 
                                                        stroke="#2196f3" 
                                                        strokeWidth={2}
                                                    />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </Box>
                                        {/* <Typography variant="caption" color="textSecondary" sx={{ mt: 2, display: 'block' }}>
                                            Last updated: {new Date(vmAlertWindow[vmAlertWindow.length - 1].bucket).toLocaleString()}
                                        </Typography> */}
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