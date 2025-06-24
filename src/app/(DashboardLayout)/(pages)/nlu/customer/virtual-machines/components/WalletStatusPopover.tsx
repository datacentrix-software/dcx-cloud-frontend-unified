'use client';

import {
    Badge,
    Popover,
    IconButton,
    Typography,
    Box,
    Divider,
    Stack
} from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { useState, useEffect } from 'react';
import dayjs from 'dayjs';

interface Wallet {
    balance: number;
    currency: string;
    updatedAt: string;
}

interface Props {
    organisationId: number;
    token: string;
}

export default function WalletStatusPopover({ wallet }: { wallet: Wallet }) {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const open = Boolean(anchorEl);
    const id = open ? 'wallet-popover' : undefined;

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(anchorEl ? null : event.currentTarget);
    };

    return (
        <>
            <IconButton
                color="inherit"
                aria-describedby={id}
                onClick={handleClick}
                aria-label="wallet"
            >
                <Badge
                    color={wallet?.balance === 0 ? 'error' : 'primary'}
                    variant="dot"
                    invisible={wallet === null}
                >
                    <AccountBalanceWalletIcon />
                </Badge>
            </IconButton>

            <Popover
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={() => setAnchorEl(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                PaperProps={{ sx: { width: 320, p: 2 } }}
            >
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    Wallet Status
                </Typography>
                <Divider sx={{ mb: 1 }} />

                {wallet ? (
                    <Stack spacing={1}>
                        <Typography variant="body1">
                            <strong>Balance:</strong>  R{wallet?.balance > 0 ? (Math.ceil(wallet?.balance / 100)).toFixed(2) : '0.00'}
                        </Typography>
                        {
                            !wallet?.balance && (
                                <Typography variant="body2" color="text.secondary">
                                    <strong>Last Updated:</strong> {dayjs(wallet.updatedAt).format('MMM D, YYYY • h:mm A')}
                                </Typography>
                            )
                        }
                    </Stack>
                ) : (
                    <Typography variant="body2" color="text.secondary">
                        No wallet data available.
                    </Typography>
                )}
            </Popover>
        </>
    );
}
