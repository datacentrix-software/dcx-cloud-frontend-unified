'use client';

import {
    Table, TableBody, TableCell, TableHead, TablePagination, TableRow, TableSortLabel, Box, Typography, Tooltip
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import SortIcon from '@mui/icons-material/Sort';
import { useState } from 'react';
import { paginationStyle, tableContainerStyle, tableStyle } from '@/app/(DashboardLayout)/nlu/sdm/constants/tableStyles';

type Order = 'asc' | 'desc';
type Column = {
    label: string;
    key: string;
    render?: (value: any, row: any) => React.ReactNode;
}

interface DynamicNLUTableProps {
    data: any[];
    columns: Column[];
    title?: string;
    subtitle?: string;
}

export default function DynamicNLUTable({ data, columns, title, subtitle }: DynamicNLUTableProps) {
    const [order, setOrder] = useState<Order>('asc');
    const [orderBy, setOrderBy] = useState<string>(columns[0]?.key || '');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const handleRequestSort = (key: string) => {
        const isAsc = orderBy === key && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(key);
    };

    const getComparator = (order: Order, key: string) => (a: any, b: any) =>
        order === 'asc' ? (a[key] > b[key] ? 1 : -1) : (a[key] < b[key] ? 1 : -1);

    const sortedData = [...data].sort(getComparator(order, orderBy));
    const paginatedData = sortedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    return (
        <Box sx={tableContainerStyle}>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        p: 2,
                        mb: 2,
                        backgroundColor: '#f8f9fa',
                        borderRadius: 1,
                        border: '1px solid #e9ecef',
                        width: '100%'
                    }}
                >
                    <InfoIcon color="info" />
                    <Typography variant="body2" color="text.secondary" fontSize={14}>
                        {subtitle || 'Tip: Click a column header to sort. Click again to reverse the sort.'}
                    </Typography>
                </Box>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                {title && (
                    <Typography variant="h6" fontWeight={600}>{title}</Typography>
                )}
                {orderBy && (
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
                )}
            </Box>
            <Table size="small" sx={tableStyle}>
                <TableHead>
                    <TableRow>
                        {columns.map((col) => (
                            <TableCell key={col.key}>
                                <Tooltip title={`Sort by ${col.label}`} arrow>
                                    <TableSortLabel
                                        active={orderBy === col.key}
                                        direction={orderBy === col.key ? order : 'asc'}
                                        onClick={() => handleRequestSort(col.key)}
                                    >
                                        {col.label}
                                    </TableSortLabel>
                                </Tooltip>
                            </TableCell>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {paginatedData.map((row, idx) => (
                        <TableRow key={idx}>
                            {columns.map((col) => (
                                <TableCell key={col.key}> {col.render ? col.render(row[col.key], row) : (row[col.key] ?? 'No Data')}</TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={data.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={(_, newPage) => setPage(newPage)}
                onRowsPerPageChange={(e) => {
                    setRowsPerPage(parseInt(e.target.value, 5));
                    setPage(0);
                }}
                sx={paginationStyle}
                labelRowsPerPage="Rows per page:"
                labelDisplayedRows={({ from, to, count }) =>
                    `${from}-${to} of ${count !== -1 ? count : ''}`}
            />
        </Box>
    );
}