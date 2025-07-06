'use client';
import React, { useState } from 'react';
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    TableSortLabel,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    IconButton,
    Tooltip,
    Grid,
    Stack
} from '@mui/material';
import ComputerIcon from '@mui/icons-material/Computer';
import InfoIcon from '@mui/icons-material/Info';
import MemoryIcon from '@mui/icons-material/Memory';
import StorageIcon from '@mui/icons-material/Storage';
import ParentCard from '@/app/components/shared/ParentCard';

interface VMData {
    identity_instance_uuid: string;
    identity_name: string;
    power_state: string;
    guest_os: string;
    memory_size_mib: number;
    cpu_count: number;
    vcenter_name: string;
    resource_pool_name: string;
}

interface BillingData {
    org_name: string;
    "Memory GB": string;
    "CPU Cores": string;
    "Disk Capacity TB": string;
}

interface VMSortConfig {
    key: string;
    direction: 'asc' | 'desc';
}

interface VMFilter {
    guest_os: string;
    minMemory: string;
    maxMemory: string;
    minCpu: string;
    maxCpu: string;
    search: string;
}

interface VMDataProps {
    vmData: VMData[];
    vmFilter: VMFilter;
    vmSortConfig: VMSortConfig;
    vmPage: number;
    vmRowsPerPage: number;
    paginatedVMs: VMData[];
    filteredAndSortedVMs: VMData[];
    billingData: BillingData | null;
    onVmSort: (key: string) => void;
    onVmPageChange: (event: unknown, newPage: number) => void;
    onVmRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onVmFilterChange: (field: keyof VMFilter, value: string) => void;
    onVMClick: (vm: VMData) => void;
}

const VMData: React.FC<VMDataProps> = ({ 
    vmData, 
    vmFilter,
    vmSortConfig,
    vmPage,
    vmRowsPerPage,
    paginatedVMs,
    filteredAndSortedVMs,
    billingData,
    onVmSort,
    onVmPageChange,
    onVmRowsPerPageChange,
    onVmFilterChange,
    onVMClick 
}) => {
    // Extract unique values from VM data for dropdowns
    const uniqueMemoryValues = React.useMemo(() => {
        const memorySet = new Set<string>();
        vmData.forEach(vm => {
            if (vm.memory_size_mib) {
                const memoryGB = Math.round(vm.memory_size_mib / 1024);
                memorySet.add(`${memoryGB} GB`);
            }
        });
        return Array.from(memorySet).sort((a, b) => parseInt(a) - parseInt(b));
    }, [vmData]);

    const uniqueCpuValues = React.useMemo(() => {
        const cpuSet = new Set<number>();
        vmData.forEach(vm => {
            if (vm.cpu_count !== undefined && vm.cpu_count !== null) {
                cpuSet.add(vm.cpu_count);
            }
        });
        return Array.from(cpuSet).sort((a, b) => a - b);
    }, [vmData]);

    const handleVmSort = (key: string) => {
        onVmSort(key);
    };

    const handleVmPageChange = (event: unknown, newPage: number) => {
        onVmPageChange(event, newPage);
    };

    const handleVmRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        onVmRowsPerPageChange(event);
    };

    const handleVmFilterChange = (field: keyof VMFilter, value: string) => {
        onVmFilterChange(field, value);
    };

    return (
        <>
            {/* Resource Usage Cards */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={3}>
                    <ParentCard title={
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', px: 2 }}>
                            <Typography variant="h6" sx={{ flex: 1 }}>Memory Usage</Typography>
                            <Tooltip title="Memory usage represents the total amount of RAM allocated to your virtual machines. This includes both active and reserved memory.">
                                <IconButton size="small">
                                    <InfoIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    }>
                        <Stack spacing={2}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <StorageIcon sx={{ fontSize: 32, color: "#8884d8" }} />
                                <Typography variant="h4">
                                    {Number(billingData?.["Memory GB"] || '0').toLocaleString()} GB
                                </Typography>
                            </Box>
                            <Typography variant="body2" color="textSecondary">
                                Total memory across all VMs
                            </Typography>
                        </Stack>
                    </ParentCard>
                </Grid>
                <Grid item xs={12} md={3}>
                    <ParentCard title={
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', px: 2 }}>
                            <Typography variant="h6" sx={{ flex: 1 }}>CPU Usage</Typography>
                            <Tooltip title="CPU cores represent the total processing power allocated to your virtual machines. Each core can handle multiple tasks simultaneously.">
                                <IconButton size="small">
                                    <InfoIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    }>
                        <Stack spacing={2}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <MemoryIcon sx={{ fontSize: 32, color: "#82ca9d" }} />
                                <Typography variant="h4">
                                    {Number(billingData?.["CPU Cores"] || '0').toLocaleString()} Cores
                                </Typography>
                            </Box>
                            <Typography variant="body2" color="textSecondary">
                                Total CPU cores allocated to VMs
                            </Typography>
                        </Stack>
                    </ParentCard>
                </Grid>
                <Grid item xs={12} md={3}>
                    <ParentCard title={
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', px: 2 }}>
                            <Typography variant="h6" sx={{ flex: 1 }}>Storage Usage</Typography>
                            <Tooltip title="Storage usage represents the total disk space allocated to your virtual machines, including operating systems, applications, and data.">
                                <IconButton size="small">
                                    <InfoIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    }>
                        <Stack spacing={2}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <ComputerIcon sx={{ fontSize: 32, color: "#ffc658" }} />
                                <Typography variant="h4">
                                    {Number(billingData?.["Disk Capacity TB"] || '0').toLocaleString()} TB
                                </Typography>
                            </Box>
                            <Typography variant="body2" color="textSecondary">
                                Total storage capacity allocated
                            </Typography>
                        </Stack>
                    </ParentCard>
                </Grid>
                <Grid item xs={12} md={3}>
                    <ParentCard title={
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', px: 2 }}>
                            <Typography variant="h6" sx={{ flex: 1 }}>Total VMs</Typography>
                            <Tooltip title="Total VMs shows the number of virtual machines currently running in your environment. Each VM is an isolated computing environment.">
                                <IconButton size="small">
                                    <InfoIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    }>
                        <Stack spacing={2}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <ComputerIcon sx={{ fontSize: 32, color: "#ff8042" }} />
                                <Typography variant="h4">
                                    {vmData.length.toLocaleString()}
                                </Typography>
                            </Box>
                            <Typography variant="body2" color="textSecondary">
                                Number of active virtual machines
                            </Typography>
                        </Stack>
                    </ParentCard>
                </Grid>
            </Grid>

            <ParentCard 
                title={
                    <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        width: '100%', 
                        gap: 2,
                        px: 0,
                        mx: 0
                    }}>
                        <Typography variant="h5">Virtual Machines</Typography>
                        <Typography variant="subtitle1" color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 'auto' }}>
                            <ComputerIcon fontSize="small" />
                            Click on any VM row to view detailed information
                        </Typography>
                    </Box>
                }
            >
                {/* Filter Controls */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', fontWeight: 'medium' }}>
                        Filter & Search VMs
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={4}>
                            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                <Typography variant="body2" sx={{ mb: 1, fontWeight: 'medium', color: 'text.secondary' }}>
                                    Search VMs
                                </Typography>
                                <TextField
                                    placeholder="Search VMs..."
                                    value={vmFilter.search}
                                    onChange={(e) => handleVmFilterChange('search', e.target.value)}
                                    fullWidth
                                    variant="outlined"
                                    size="small"
                                    InputProps={{
                                        startAdornment: (
                                            <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                                                <InfoIcon fontSize="small" sx={{ color: "#8884d8" }} />
                                            </Box>
                                        ),
                                    }}
                                />
                            </Box>
                        </Grid>

                        <Grid item xs={12} md={2}>
                            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                <Typography variant="body2" sx={{ mb: 1, fontWeight: 'medium', color: 'text.secondary' }}>
                                    Operating System
                                </Typography>
                                <FormControl fullWidth size="small">
                                    <Select
                                        value={vmFilter.guest_os}
                                        onChange={(e) => handleVmFilterChange('guest_os', e.target.value)}
                                        variant="outlined"
                                        displayEmpty
                                    >
                                        <MenuItem value="">All OS</MenuItem>
                                        <MenuItem value="WINDOWS">Windows</MenuItem>
                                        <MenuItem value="LINUX">Linux</MenuItem>
                                    </Select>
                                </FormControl>
                            </Box>
                        </Grid>

                        <Grid item xs={12} md={1.5}>
                            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                <Typography variant="body2" sx={{ mb: 1, fontWeight: 'medium', color: 'text.secondary' }}>
                                    Min Memory (GB)
                                </Typography>
                                <FormControl fullWidth size="small">
                                    <Select
                                        value={vmFilter.minMemory}
                                        onChange={(e) => handleVmFilterChange('minMemory', e.target.value)}
                                        variant="outlined"
                                        displayEmpty
                                    >
                                        <MenuItem value="">Any Memory</MenuItem>
                                        {uniqueMemoryValues.map((memory) => (
                                            <MenuItem key={`min-${memory}`} value={memory}>
                                                {memory} GB
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Box>
                        </Grid>

                        <Grid item xs={12} md={1.5}>
                            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                <Typography variant="body2" sx={{ mb: 1, fontWeight: 'medium', color: 'text.secondary' }}>
                                    Max Memory (GB)
                                </Typography>
                                <FormControl fullWidth size="small">
                                    <Select
                                        value={vmFilter.maxMemory}
                                        onChange={(e) => handleVmFilterChange('maxMemory', e.target.value)}
                                        variant="outlined"
                                        displayEmpty
                                    >
                                        <MenuItem value="">Any Memory</MenuItem>
                                        {uniqueMemoryValues.map((memory) => (
                                            <MenuItem key={`max-${memory}`} value={memory}>
                                                {memory} GB
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Box>
                        </Grid>

                        <Grid item xs={12} md={1.5}>
                            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                <Typography variant="body2" sx={{ mb: 1, fontWeight: 'medium', color: 'text.secondary' }}>
                                    Min CPU
                                </Typography>
                                <FormControl fullWidth size="small">
                                    <Select
                                        value={vmFilter.minCpu}
                                        onChange={(e) => handleVmFilterChange('minCpu', e.target.value)}
                                        variant="outlined"
                                        displayEmpty
                                    >
                                        <MenuItem value="">Any CPU</MenuItem>
                                        {uniqueCpuValues.map((cpu) => (
                                            <MenuItem key={`min-${cpu}`} value={cpu.toString()}>
                                                {cpu} Cores
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Box>
                        </Grid>

                        <Grid item xs={12} md={1.5}>
                            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                <Typography variant="body2" sx={{ mb: 1, fontWeight: 'medium', color: 'text.secondary' }}>
                                    Max CPU
                                </Typography>
                                <FormControl fullWidth size="small">
                                    <Select
                                        value={vmFilter.maxCpu}
                                        onChange={(e) => handleVmFilterChange('maxCpu', e.target.value)}
                                        variant="outlined"
                                        displayEmpty
                                    >
                                        <MenuItem value="">Any CPU</MenuItem>
                                        {uniqueCpuValues.map((cpu) => (
                                            <MenuItem key={`max-${cpu}`} value={cpu.toString()}>
                                                {cpu} Cores
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>

                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell 
                                    sx={{ 
                                        fontWeight: 'bold',
                                        color: 'primary.main',
                                        '&:hover': {
                                            backgroundColor: 'action.hover'
                                        }
                                    }}
                                >
                                    <TableSortLabel
                                        active={vmSortConfig.key === 'identity_name'}
                                        direction={vmSortConfig.key === 'identity_name' ? vmSortConfig.direction : 'asc'}
                                        onClick={() => handleVmSort('identity_name')}
                                        sx={{ color: 'primary.main' }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <ComputerIcon fontSize="small" sx={{ color: "#8884d8" }} />
                                            VM Name
                                        </Box>
                                    </TableSortLabel>
                                </TableCell>
                                <TableCell 
                                    sx={{ 
                                        fontWeight: 'bold',
                                        color: 'primary.main',
                                        '&:hover': {
                                            backgroundColor: 'action.hover'
                                        }
                                    }}
                                >
                                    <TableSortLabel
                                        active={vmSortConfig.key === 'guest_os'}
                                        direction={vmSortConfig.key === 'guest_os' ? vmSortConfig.direction : 'asc'}
                                        onClick={() => handleVmSort('guest_os')}
                                        sx={{ color: 'primary.main' }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <MemoryIcon fontSize="small" sx={{ color: "#8884d8" }} />
                                            OS
                                        </Box>
                                    </TableSortLabel>
                                </TableCell>
                                <TableCell 
                                    align="right"
                                    sx={{ 
                                        fontWeight: 'bold',
                                        color: 'primary.main',
                                        '&:hover': {
                                            backgroundColor: 'action.hover'
                                        }
                                    }}
                                >
                                    <TableSortLabel
                                        active={vmSortConfig.key === 'cpu_count'}
                                        direction={vmSortConfig.key === 'cpu_count' ? vmSortConfig.direction : 'asc'}
                                        onClick={() => handleVmSort('cpu_count')}
                                        sx={{ color: 'primary.main' }}
                                    >
                                        CPU
                                    </TableSortLabel>
                                </TableCell>
                                <TableCell 
                                    align="right"
                                    sx={{ 
                                        fontWeight: 'bold',
                                        color: 'primary.main',
                                        '&:hover': {
                                            backgroundColor: 'action.hover'
                                        }
                                    }}
                                >
                                    <TableSortLabel
                                        active={vmSortConfig.key === 'memory_size_mib'}
                                        direction={vmSortConfig.key === 'memory_size_mib' ? vmSortConfig.direction : 'asc'}
                                        onClick={() => handleVmSort('memory_size_mib')}
                                        sx={{ color: 'primary.main' }}
                                    >
                                        Memory
                                    </TableSortLabel>
                                </TableCell>
                                <TableCell 
                                    align="right"
                                    sx={{ 
                                        fontWeight: 'bold',
                                        color: 'primary.main',
                                        '&:hover': {
                                            backgroundColor: 'action.hover'
                                        }
                                    }}
                                >
                                    Powered On Hours
                                </TableCell>
                                <TableCell 
                                    align="right"
                                    sx={{ 
                                        fontWeight: 'bold',
                                        color: 'primary.main',
                                        '&:hover': {
                                            backgroundColor: 'action.hover'
                                        }
                                    }}
                                >
                                    Cost Estimate
                                </TableCell>
                                <TableCell 
                                    align="right"
                                    sx={{ 
                                        fontWeight: 'bold',
                                        color: 'primary.main',
                                        '&:hover': {
                                            backgroundColor: 'action.hover'
                                        }
                                    }}
                                >
                                    License Cost
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {paginatedVMs.map((vm) => (
                                <TableRow 
                                    key={vm.identity_instance_uuid}
                                    onClick={() => onVMClick(vm)}
                                    sx={{ 
                                        cursor: 'pointer',
                                        '&:hover': { 
                                            backgroundColor: 'action.hover',
                                            transition: 'background-color 0.2s'
                                        }
                                    }}
                                >
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <ComputerIcon fontSize="small" sx={{ color: "#8884d8" }} />
                                            {vm.identity_name}
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <MemoryIcon fontSize="small" sx={{ color: "#8884d8" }} />
                                            {vm.guest_os}
                                        </Box>
                                    </TableCell>
                                    <TableCell align="right">{vm.cpu_count}</TableCell>
                                    <TableCell align="right">{Math.round(vm.memory_size_mib / 1024)} GB</TableCell>
                                    <TableCell align="right">720</TableCell>
                                    <TableCell align="right">
                                        <Typography sx={{ color: 'primary.main', fontWeight: 'medium' }}>
                                            R{(vm.cpu_count * 425).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="right">
                                        <Typography sx={{ color: 'primary.main', fontWeight: 'medium' }}>
                                            R{(vm.cpu_count * 75).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {paginatedVMs.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} align="center">
                                        No VMs found matching the current filters
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25]}
                        component="div"
                        count={filteredAndSortedVMs.length}
                        rowsPerPage={vmRowsPerPage}
                        page={vmPage}
                        onPageChange={handleVmPageChange}
                        onRowsPerPageChange={handleVmRowsPerPageChange}
                        sx={{
                            '.MuiTablePagination-select': {
                                color: 'primary.main'
                            },
                            '.MuiTablePagination-selectIcon': {
                                color: 'primary.main'
                            }
                        }}
                    />
                </TableContainer>
            </ParentCard>
        </>
    );
};

export default VMData; 