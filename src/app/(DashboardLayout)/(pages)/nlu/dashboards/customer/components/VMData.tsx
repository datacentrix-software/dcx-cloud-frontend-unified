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
import { IconServer, IconInfoCircle, IconCpu, IconDatabase } from '@tabler/icons-react';
import ParentCard from '@/app/components/shared/ParentCard';

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
    os: string;
    minMemory: string;
    maxMemory: string;
    minCpu: string;
    maxCpu: string;
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
                                    <IconInfoCircle size={20} />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    }>
                        <Stack spacing={2}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <IconDatabase size={32} color="#8884d8" />
                                <Typography variant="h4">
                                    {Number(billingData?.["Memory GB"] || '0').toLocaleString()} GB
                                </Typography>
                            </Box>
                            <Typography variant="body2" color="textSecondary">
                                Total allocated memory across all VMs
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
                                    <IconInfoCircle size={20} />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    }>
                        <Stack spacing={2}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <IconCpu size={32} color="#82ca9d" />
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
                                    <IconInfoCircle size={20} />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    }>
                        <Stack spacing={2}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <IconServer size={32} color="#ffc658" />
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
                                    <IconInfoCircle size={20} />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    }>
                        <Stack spacing={2}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <IconServer size={32} color="#ff8042" />
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
                            <IconServer size={20} />
                            Click on any VM row to view detailed information
                        </Typography>
                    </Box>
                }
            >
                {/* Filter Controls */}
                <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <FormControl sx={{ minWidth: 200 }}>
                        <InputLabel>OS Filter</InputLabel>
                        <Select
                            value={vmFilter.os}
                            label="OS Filter"
                            onChange={(e) => handleVmFilterChange('os', e.target.value)}
                        >
                            <MenuItem value="">All OS</MenuItem>
                            <MenuItem value="WINDOWS">Windows</MenuItem>
                            <MenuItem value="LINUX">Linux</MenuItem>
                        </Select>
                    </FormControl>

                    <TextField
                        label="Min Memory (GB)"
                        type="number"
                        value={vmFilter.minMemory}
                        onChange={(e) => handleVmFilterChange('minMemory', e.target.value)}
                        sx={{ width: 150 }}
                    />

                    <TextField
                        label="Max Memory (GB)"
                        type="number"
                        value={vmFilter.maxMemory}
                        onChange={(e) => handleVmFilterChange('maxMemory', e.target.value)}
                        sx={{ width: 150 }}
                    />

                    <TextField
                        label="Min CPU"
                        type="number"
                        value={vmFilter.minCpu}
                        onChange={(e) => handleVmFilterChange('minCpu', e.target.value)}
                        sx={{ width: 150 }}
                    />

                    <TextField
                        label="Max CPU"
                        type="number"
                        value={vmFilter.maxCpu}
                        onChange={(e) => handleVmFilterChange('maxCpu', e.target.value)}
                        sx={{ width: 150 }}
                    />
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
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <IconServer size={16} color="#8884d8" />
                                        VM Name
                                    </Box>
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
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <IconCpu size={16} color="#8884d8" />
                                        OS
                                    </Box>
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
                                        active={vmSortConfig.key === 'cpu'}
                                        direction={vmSortConfig.key === 'cpu' ? vmSortConfig.direction : 'asc'}
                                        onClick={() => handleVmSort('cpu')}
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
                                        active={vmSortConfig.key === 'memory'}
                                        direction={vmSortConfig.key === 'memory' ? vmSortConfig.direction : 'asc'}
                                        onClick={() => handleVmSort('memory')}
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
                                    <TableSortLabel
                                        active={vmSortConfig.key === 'Powered on hours'}
                                        direction={vmSortConfig.key === 'Powered on hours' ? vmSortConfig.direction : 'asc'}
                                        onClick={() => handleVmSort('Powered on hours')}
                                        sx={{ color: 'primary.main' }}
                                    >
                                        Powered On Hours
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
                                        active={vmSortConfig.key === 'cost_estimate'}
                                        direction={vmSortConfig.key === 'cost_estimate' ? vmSortConfig.direction : 'asc'}
                                        onClick={() => handleVmSort('cost_estimate')}
                                        sx={{ color: 'primary.main' }}
                                    >
                                        Cost Estimate
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
                                        active={vmSortConfig.key === 'license_cost'}
                                        direction={vmSortConfig.key === 'license_cost' ? vmSortConfig.direction : 'asc'}
                                        onClick={() => handleVmSort('license_cost')}
                                        sx={{ color: 'primary.main' }}
                                    >
                                        License Cost
                                    </TableSortLabel>
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
                                            <IconServer size={16} color="#8884d8" />
                                            {vm.identity_name}
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <IconCpu size={16} color="#8884d8" />
                                            {vm.os}
                                        </Box>
                                    </TableCell>
                                    <TableCell align="right">{Number(vm.cpu).toLocaleString()}</TableCell>
                                    <TableCell align="right">{Number(vm.memory).toLocaleString()} GB</TableCell>
                                    <TableCell align="right">{Number(vm["Powered on hours"]).toLocaleString()}</TableCell>
                                    <TableCell align="right">
                                        <Typography sx={{ color: 'primary.main', fontWeight: 'medium' }}>
                                            R{Number(vm.cost_estimate).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="right">
                                        <Typography sx={{ color: 'primary.main', fontWeight: 'medium' }}>
                                            R{Number(vm.license_cost).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
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