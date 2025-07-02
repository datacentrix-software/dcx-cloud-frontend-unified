'use client';
import React, { useState } from 'react';
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
    Button,
    CircularProgress
} from '@mui/material';
import { IconServer, IconCpu, IconDownload } from '@tabler/icons-react';
import ParentCard from '@/app/components/shared/ParentCard';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, Area } from 'recharts';

interface BillingData {
    org_name: string;
    "Memory GB": string;
    "CPU Cores": string;
    "Disk Capacity TB": string;
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

interface VMBillingData {
    cost_estimate: string;
    license_cost: string;
    // Siya to check 1
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

interface BillingProps {
    billingData: BillingData | null;
    vmData: VMBillingData[];
    // Siya to check 2
    pastBills: PastBill[];
    selectedMonth: string | null;
    lineItems: LineItem[];
    loadingLineItems: boolean;
    lineItemPage: number;
    lineItemRowsPerPage: number;
    lineItemSortConfig: LineItemSortConfig;
    lineItemFilter: LineItemFilter;
    paginatedLineItems: LineItem[];
    filteredAndSortedLineItems: LineItem[];
    onMonthClick: (month: string) => void;
    onLineItemSort: (key: keyof LineItem) => void;
    onLineItemFilterChange: (field: keyof LineItemFilter, value: string) => void;
    onLineItemPageChange: (event: unknown, newPage: number) => void;
    onLineItemRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const Billing: React.FC<BillingProps> = ({ 
    billingData, 
    vmData, 
    pastBills, 
    selectedMonth,
    lineItems,
    loadingLineItems,
    lineItemPage,
    lineItemRowsPerPage,
    lineItemSortConfig,
    lineItemFilter,
    paginatedLineItems,
    filteredAndSortedLineItems,
    onMonthClick,
    onLineItemSort,
    onLineItemFilterChange,
    onLineItemPageChange,
    onLineItemRowsPerPageChange
}) => {
    const handleMonthClick = async (month: string) => {
        onMonthClick(month);
    };

    const handleLineItemSort = (key: keyof LineItem) => {
        onLineItemSort(key);
    };

    const handleLineItemFilterChange = (field: keyof LineItemFilter, value: string) => {
        onLineItemFilterChange(field, value);
    };

    const handleLineItemPageChange = (event: unknown, newPage: number) => {
        onLineItemPageChange(event, newPage);
    };

    const handleLineItemRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        onLineItemRowsPerPageChange(event);
    };

    return (
        <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
                <ParentCard title="Current Bill">
                    <Typography variant="h4" gutterBottom>
                        Resource Usage Summary
                    </Typography>
                    <Typography variant="subtitle1" color="textSecondary">
                        Memory: {Number(billingData?.["Memory GB"] || '0').toLocaleString()} GB
                    </Typography>
                    <Typography variant="subtitle1" color="textSecondary">
                        CPU: {Number(billingData?.["CPU Cores"] || '0').toLocaleString()} Cores
                    </Typography>
                    <Typography variant="subtitle1" color="textSecondary">
                        Storage: {Number(billingData?.["Disk Capacity TB"] || '0').toLocaleString()} TB
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<IconDownload />}
                        sx={{ mt: 2 }}
                    >
                        Download Current Bill
                    </Button>
                </ParentCard>
            </Grid>
            <Grid item xs={12} md={6}>
                <ParentCard title="VM Summary">
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6">Active VMs</Typography>
                        <Typography variant="h4">
                            {vmData.length.toLocaleString()}
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="subtitle1" color="textSecondary">Total Cost</Typography>
                        <Typography variant="subtitle1">
                            R{vmData.reduce((sum, vm) => sum + parseFloat(vm.cost_estimate), 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="subtitle1" color="textSecondary">Total License Cost</Typography>
                        <Typography variant="subtitle1">
                            R{vmData.reduce((sum, vm) => sum + parseFloat(vm.license_cost), 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                        </Typography>
                    </Box>
                    <Button
                        variant="outlined"
                        startIcon={<IconDownload />}
                        sx={{ mt: 2 }}
                    >
                        Download VM Details
                    </Button>
                </ParentCard>
            </Grid>

            {/* Past Bills Section */}
            <Grid item xs={12}>
                <ParentCard title={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <IconServer size={24} color="#8884d8" />
                        <Typography variant="h5">
                            Past Bills for {pastBills[0]?.organisation}
                        </Typography>
                    </Box>
                }>
                    {pastBills.length > 0 && (
                        <>
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={5}>
                                    <Paper 
                                        elevation={3} 
                                        sx={{ 
                                            p: 2,
                                            borderRadius: 2,
                                            backgroundColor: 'background.paper',
                                            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                                        }}
                                    >
                                        <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
                                            Monthly Breakdown
                                        </Typography>
                                        <TableContainer>
                                            <Table>
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell sx={{ fontWeight: 'bold' }}>Billing Month</TableCell>
                                                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>Cost Estimate</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {pastBills.map((bill, index) => (
                                                        <TableRow 
                                                            key={index}
                                                            onClick={() => handleMonthClick(bill.billing_month)}
                                                            sx={{ 
                                                                '&:hover': { 
                                                                    backgroundColor: 'action.hover',
                                                                    transition: 'background-color 0.2s'
                                                                },
                                                                cursor: 'pointer',
                                                                backgroundColor: selectedMonth === bill.billing_month ? 'action.selected' : 'inherit'
                                                            }}
                                                        >
                                                            <TableCell>
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                    <IconCpu size={16} color="#8884d8" />
                                                                    {bill.billing_month}
                                                                </Box>
                                                            </TableCell>
                                                            <TableCell align="right">
                                                                <Typography 
                                                                    sx={{ 
                                                                        fontWeight: 'medium',
                                                                        color: 'primary.main'
                                                                    }}
                                                                >
                                                                    R{Number(bill.cost_estimate).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                                                </Typography>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </Paper>
                                </Grid>

                                <Grid item xs={12} md={7}>
                                    <Paper 
                                        elevation={3} 
                                        sx={{ 
                                            p: 2,
                                            borderRadius: 2,
                                            backgroundColor: 'background.paper',
                                            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                                        }}
                                    >
                                        <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
                                            Cost Trend Analysis
                                        </Typography>
                                        <Box sx={{ height: 300, mt: 2 }}>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <LineChart
                                                    data={pastBills.map(bill => ({
                                                        month: bill.billing_month,
                                                        cost: Number(bill.cost_estimate)
                                                    }))}
                                                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                                >
                                                    <defs>
                                                        <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                                                            <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1}/>
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid 
                                                        strokeDasharray="3 3" 
                                                        stroke="#f0f0f0"
                                                    />
                                                    <XAxis 
                                                        dataKey="month"
                                                        angle={-45}
                                                        textAnchor="end"
                                                        height={60}
                                                        tick={{ fill: '#666' }}
                                                    />
                                                    <YAxis 
                                                        tick={{ fill: '#666' }}
                                                        tickFormatter={(value) => `R${(value/1000).toFixed(0)}k`}
                                                    />
                                                    <RechartsTooltip 
                                                        formatter={(value) => [`R${Number(value).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, 'Cost']}
                                                        contentStyle={{
                                                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                                            borderRadius: '8px',
                                                            border: '1px solid #f0f0f0',
                                                            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                                                        }}
                                                    />
                                                    <Legend />
                                                    <Line 
                                                        type="monotone" 
                                                        dataKey="cost" 
                                                        name="Monthly Cost" 
                                                        stroke="#8884d8" 
                                                        strokeWidth={3}
                                                        dot={{ 
                                                            fill: '#8884d8',
                                                            strokeWidth: 2,
                                                            r: 4
                                                        }}
                                                        activeDot={{ 
                                                            r: 6,
                                                            stroke: '#8884d8',
                                                            strokeWidth: 2,
                                                            fill: 'white'
                                                        }}
                                                    />
                                                    <Area
                                                        type="monotone"
                                                        dataKey="cost"
                                                        stroke="#8884d8"
                                                        fillOpacity={1}
                                                        fill="url(#colorCost)"
                                                    />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </Box>
                                    </Paper>
                                </Grid>
                            </Grid>
                        </>
                    )}
                </ParentCard>
            </Grid>

            {/* Line Items Table Section */}
            {selectedMonth && (
                <Grid item xs={12}>
                    <ParentCard title={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <IconServer size={24} color="#8884d8" />
                            <Typography variant="h5">
                                Line Items for {selectedMonth}
                            </Typography>
                        </Box>
                    }>
                        {loadingLineItems ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                                <CircularProgress />
                            </Box>
                        ) : (
                            <Paper 
                                elevation={3} 
                                sx={{ 
                                    p: 2,
                                    borderRadius: 2,
                                    backgroundColor: 'background.paper',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                                }}
                            >
                                <TableContainer>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell 
                                                    onClick={() => handleLineItemSort('vm_name')}
                                                    sx={{ 
                                                        cursor: 'pointer', 
                                                        fontWeight: 'bold',
                                                        color: 'primary.main',
                                                        '&:hover': {
                                                            backgroundColor: 'action.hover'
                                                        }
                                                    }}
                                                >
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <IconServer size={16} color="#8884d8" />
                                                        VM Name {lineItemSortConfig.key === 'vm_name' && (lineItemSortConfig.direction === 'asc' ? '↑' : '↓')}
                                                    </Box>
                                                </TableCell>
                                                <TableCell 
                                                    onClick={() => handleLineItemSort('guest_os')}
                                                    sx={{ 
                                                        cursor: 'pointer', 
                                                        fontWeight: 'bold',
                                                        color: 'primary.main',
                                                        '&:hover': {
                                                            backgroundColor: 'action.hover'
                                                        }
                                                    }}
                                                >
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <IconCpu size={16} color="#8884d8" />
                                                        OS {lineItemSortConfig.key === 'guest_os' && (lineItemSortConfig.direction === 'asc' ? '↑' : '↓')}
                                                    </Box>
                                                </TableCell>
                                                <TableCell 
                                                    onClick={() => handleLineItemSort('vcpus')}
                                                    align="right"
                                                    sx={{ 
                                                        cursor: 'pointer', 
                                                        fontWeight: 'bold',
                                                        color: 'primary.main',
                                                        '&:hover': {
                                                            backgroundColor: 'action.hover'
                                                        }
                                                    }}
                                                >
                                                    vCPUs {lineItemSortConfig.key === 'vcpus' && (lineItemSortConfig.direction === 'asc' ? '↑' : '↓')}
                                                </TableCell>
                                                <TableCell 
                                                    onClick={() => handleLineItemSort('memory_size')}
                                                    align="right"
                                                    sx={{ 
                                                        cursor: 'pointer', 
                                                        fontWeight: 'bold',
                                                        color: 'primary.main',
                                                        '&:hover': {
                                                            backgroundColor: 'action.hover'
                                                        }
                                                    }}
                                                >
                                                    Memory (GB) {lineItemSortConfig.key === 'memory_size' && (lineItemSortConfig.direction === 'asc' ? '↑' : '↓')}
                                                </TableCell>
                                                <TableCell 
                                                    onClick={() => handleLineItemSort('total_hours')}
                                                    align="right"
                                                    sx={{ 
                                                        cursor: 'pointer', 
                                                        fontWeight: 'bold',
                                                        color: 'primary.main',
                                                        '&:hover': {
                                                            backgroundColor: 'action.hover'
                                                        }
                                                    }}
                                                >
                                                    Hours {lineItemSortConfig.key === 'total_hours' && (lineItemSortConfig.direction === 'asc' ? '↑' : '↓')}
                                                </TableCell>
                                                <TableCell 
                                                    onClick={() => handleLineItemSort('cost_estimate')}
                                                    align="right"
                                                    sx={{ 
                                                        cursor: 'pointer', 
                                                        fontWeight: 'bold',
                                                        color: 'primary.main',
                                                        '&:hover': {
                                                            backgroundColor: 'action.hover'
                                                        }
                                                    }}
                                                >
                                                    Cost {lineItemSortConfig.key === 'cost_estimate' && (lineItemSortConfig.direction === 'asc' ? '↑' : '↓')}
                                                </TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {paginatedLineItems.map((item, index) => (
                                                <TableRow 
                                                    key={index}
                                                    sx={{ 
                                                        '&:hover': { 
                                                            backgroundColor: 'action.hover',
                                                            transition: 'background-color 0.2s'
                                                        }
                                                    }}
                                                >
                                                    <TableCell>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <IconServer size={16} color="#8884d8" />
                                                            {item.vm_name}
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <IconCpu size={16} color="#8884d8" />
                                                            {item.guest_os}
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        {item.vcpus}
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        {item.memory_size}
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        {item.total_hours}
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <Typography sx={{ color: 'primary.main', fontWeight: 'medium' }}>
                                                            R{Number(item.cost_estimate).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                                        </Typography>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                                <TablePagination
                                    component="div"
                                    count={filteredAndSortedLineItems.length}
                                    page={lineItemPage}
                                    onPageChange={handleLineItemPageChange}
                                    rowsPerPage={lineItemRowsPerPage}
                                    onRowsPerPageChange={handleLineItemRowsPerPageChange}
                                    sx={{
                                        '.MuiTablePagination-select': {
                                            color: 'primary.main'
                                        },
                                        '.MuiTablePagination-selectIcon': {
                                            color: 'primary.main'
                                        }
                                    }}
                                />
                            </Paper>
                        )}
                    </ParentCard>
                </Grid>
            )}
        </Grid>
    );
};

export default Billing; 