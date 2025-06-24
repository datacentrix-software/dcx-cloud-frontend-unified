"use client"

import React, { useState } from "react";
import {
    Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Typography, Paper, Chip, Box,
    TablePagination, TableSortLabel, Tooltip
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import SortIcon from "@mui/icons-material/Sort";
import { getDateRangeLabel, getMonthRange } from "@/app/(DashboardLayout)/utilities/helpers/dashboard.helper";
import ParentCard from "@/app/components/shared/ParentCard";

type VMRow = {
    "Identity name": string;
    "Total Hours Powered On": number;
    "vm_status": string;
    "power_state": string;
    "vcenter_name": string;
};

const getPowerChipColor = (value: string) => {
    switch (value) {
        case "POWERED_ON":
            return "success";
        case "POWERED_OFF":
            return "error";
        default:
            return "default";
    }
};

const getVMStatusStyle = (value: string) => ({
    color: value === "Existing VM" ? "#1976d2" : "#757575",
    fontStyle: "italic"
});

const getHourColor = (hours: number) => {
    if (hours < 360) return "red";
    if (hours < 720) return "gold";
    return "#00af64";
};

// Add table styles
const tableContainerStyle = {
    width: '100%',
    overflowX: 'auto',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    borderRadius: '8px',
    backgroundColor: 'white',
    mb: 4
};

const tableStyle = {
    minWidth: 650,
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    '& th, & td': {
        border: '1px solid #e0e0e0',
        padding: '16px',
        textAlign: 'center',
    },
    '& th': {
        backgroundColor: '#f5f5f5',
        fontWeight: 'bold',
    }
};

const paginationStyle = {
    display: 'flex',
    justifyContent: 'flex-end',
    padding: '16px',
    backgroundColor: 'white',
    borderTop: '1px solid #e0e0e0',
    '& .MuiTablePagination-toolbar': {
        padding: '0px',
    },
    '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
        margin: 0,
    }
};

const VMStatusTable = ({ data }: { data: VMRow[] }) => {
    const headers = Object.keys(data[0]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [order, setOrder] = useState<'asc' | 'desc'>('asc');
    const [orderBy, setOrderBy] = useState<string>('Identity name');

    const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);
    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleRequestSort = (property: string) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const pagedData = data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    return (
        <ParentCard
            title={
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
                    <Typography variant="h5">VM Details</Typography>
                    <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.875rem' }}>
                        {getMonthRange(new Date())}
                    </Typography>
                </Box>
            }
            subtitle="Displays the VM details, power status and total hours powered on"
        >
            <Box sx={tableContainerStyle}>
                {/* Info Tip Box */}
                <Box 
                    sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1, 
                        p: 2, 
                        mb: 2,
                        backgroundColor: '#f8f9fa',
                        borderRadius: 1,
                        border: '1px solid #e9ecef'
                    }}
                >
                    <InfoIcon color="info" />
                    <Typography variant="body2" color="text.secondary">
                        Tip: Click on any column header to sort the table. Click again to reverse the sort order.
                    </Typography>
                </Box>

                {/* Table Header with Sort Info */}
                <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    mb: 2
                }}>
                    <Typography variant="h6" component="h2" sx={{ 
                        fontWeight: 600,
                        color: 'text.primary',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                    }}>
                        <InfoIcon color="primary" sx={{ fontSize: 24 }} />
                        VM Details
                    </Typography>
                    <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1,
                        color: 'text.secondary'
                    }}>
                        <SortIcon />
                        <Typography variant="body2">
                            Currently sorted by: {orderBy} ({order === 'asc' ? 'ascending' : 'descending'})
                        </Typography>
                    </Box>
                </Box>

                <Table sx={tableStyle}>
                    <TableHead>
                        <TableRow>
                            {headers.map((key) => (
                                <TableCell 
                                    key={key} 
                                    sx={{ 
                                        backgroundColor: '#f5f5f5',
                                        '&:hover': {
                                            backgroundColor: '#e0e0e0',
                                        },
                                    }}
                                >
                                    <Tooltip title={`Click to sort by ${key}`} arrow placement="top">
                                        <TableSortLabel
                                            active={orderBy === key}
                                            direction={orderBy === key ? order : 'asc'}
                                            onClick={() => handleRequestSort(key)}
                                            sx={{ 
                                                fontWeight: 'bold',
                                                display: 'flex',
                                                alignItems: 'center',
                                                width: '100%',
                                                '& .MuiTableSortLabel-icon': {
                                                    opacity: 0.5,
                                                },
                                            }}
                                        >
                                            {key.replace(/_/g, " ").replace(/\w\S*/g, w => w[0].toUpperCase() + w.slice(1).toLowerCase())}
                                        </TableSortLabel>
                                    </Tooltip>
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {pagedData.map((row, i) => (
                            <TableRow 
                                key={i}
                                sx={{ 
                                    '&:hover': { backgroundColor: '#f8f8f8' }
                                }}
                            >
                                {headers.map((key) => (
                                    <TableCell key={key}>
                                        {key === "power_state" ? (
                                            <Chip label={row[key]} color={getPowerChipColor(row[key])} size="small" />
                                        ) : key === "vm_status" ? (
                                            <span style={getVMStatusStyle(row[key])}>{row[key]}</span>
                                        ) : key === "Total Hours Powered On" ? (
                                            <Box display="flex" alignItems="center" gap={1}>
                                                <span style={{
                                                    display: 'inline-block',
                                                    minWidth: 12,
                                                    minHeight: 12,
                                                    borderRadius: '50%',
                                                    backgroundColor: getHourColor(row[key]),
                                                }} />
                                                <span>{row[key] < 360 ? "Running at less than 360 hours" : row[key] > 360 && row[key] < 720 ? "Running at less than 720 hours" : "All Good"}</span>
                                            </Box>
                                        ) : (
                                            row[key as keyof VMRow]
                                        )}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                <TablePagination
                    component="div"
                    rowsPerPageOptions={[5, 10, 25, 50, 100]}
                    count={data.length}
                    page={page}
                    rowsPerPage={rowsPerPage}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    sx={paginationStyle}
                    labelRowsPerPage="Rows per page:"
                    labelDisplayedRows={({ from, to, count }) => 
                        `${from}-${to} of ${count !== -1 ? count : ''}`}
                />
            </Box>
        </ParentCard>
    );
};

export default VMStatusTable;
