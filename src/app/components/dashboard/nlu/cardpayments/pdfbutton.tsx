import { useState, useEffect, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Image from 'next/image'; // Assuming you're using Next.js
import React from 'react';
import { FiEye, FiDownload } from 'react-icons/fi';
import { Box, Button, Dialog, DialogContent, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';

// import Logo from "../../shared/logo/Logo";

interface VM {
  id: string;
  name: string;
  cpu: number;
  ram: number;
  cpuCost: number;
  memoryCost: number;
  storageType: string;
  storage: number;
  storageCost: number;
}
interface User {
  address: string;
  address2?: string;
  companyRegNumber: string;
  contact: string;
  firstName: string;
  lastName: string;
  organisation: string;
  postal: string;
  postal2?: string;
  userEmail: string;
  vatNumber: string;
}

const formatDate = (date: Date) => {
  const day = ('0' + date.getDate()).slice(-2);
  const month = ('0' + (date.getMonth() + 1)).slice(-2);
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};
const VMComponent: React.FC = () => {
  const cpuCostPerHour = 78 / 730;
  const ramCostPerHour = 103 / 730;
  const diskCostPerHour = 1.8 / 730;
  const [amount, setAmount] = useState('0');
  const [paidAmount, setpaidAmount] = useState(0);
  const [vms, setVms] = useState<VM[]>([]);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const today = new Date();
  const [userDetails, setUserDetails] = useState<User | null>(null);
  const firewallCost = 75;
  const ipCost = 95;
  const [IpCount, setIpCount] = useState(0);
  const dialogRef = useRef<HTMLDivElement>(null);
  const [hideButtons, setHideButtons] = useState(false);

  // Get the first day of the current month
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  // Get the last day of the current month
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const [fromDate, setFromDate] = useState(formatDate(firstDayOfMonth));
  const [toDate, setToDate] = useState(formatDate(lastDayOfMonth));
  useEffect(() => {
    // Update the dates when component is loaded
    setFromDate(formatDate(firstDayOfMonth));
    setToDate(formatDate(lastDayOfMonth));
    const payments: any = sessionStorage.getItem('totalAmount');
    setpaidAmount(payments - 1500);
  }, []);
  // Fetch data for VMs
  const fetchData = async () => {
    const email = sessionStorage.getItem('email');
    if (email) {
      try {
        const response = await fetch(
          `https://daas.dev.datacentrix.cloud/api/fetch_vm/?email=${encodeURIComponent(email)}`
        );
        const data = await response.json();
        setVms(data);
        const uniqueExternalIps = new Set(
          data.map((vm: { external: any }) => vm.external)
        );


        const IpCount = uniqueExternalIps.size;
        setIpCount(IpCount);


        return data;
      } catch (error) {
        console.log('Error fetching virtual machines:', error);
        return [];
      }
    } else {
      console.log('No email found in sessionStorage.');
      return [];
    }
  };

  // Fetch and calculate VM data
  const handleGetVmData = async () => {
    const email = sessionStorage.getItem('email') || '';
    handleFetchUser(email);
    const fromDate = sessionStorage.getItem('fromDate');
    const toDate = sessionStorage.getItem('toDate');


    // Await the fetchData to complete before proceeding
    const vmNames = await fetchData();

    try {
      // Update API call to include fromDate and toDate
      const response = await fetch(
        `https://daas.dev.datacentrix.cloud/api/vm_logs/?email=${encodeURIComponent(email)}&from=${fromDate}&to=${toDate}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const vmData = await response.json();
        console.log('VM running time data:', vmData);
        let totalCost = 0;

        const updatedVMs = vmData
          .map((vm: any) => {
            const { vm_name, total_running_hours, total_hours_since_creation } =
              vm;


            const matchedVM = vmNames.find(
              (v: { name: string }) => v.name === vm_name
            );


            if (!matchedVM) {
              console.log(`No matching VM found for ${vm_name}`);
              return null;
            }

            const { cpu, ram, storage, id, storageType } = matchedVM;

            const cpuCost = total_running_hours * cpuCostPerHour * cpu;
            const ramCost = total_running_hours * ramCostPerHour * ram;
            const diskCost =
              total_hours_since_creation * diskCostPerHour * storage;

            // Total cost calculation
            const vmTotalCost = cpuCost + ramCost + diskCost;

            totalCost += vmTotalCost;

            return {
              id,
              name: vm_name,
              cpu,
              ram,
              storage,
              storageType,
              cpuCost,
              memoryCost: ramCost,
              storageCost: diskCost,
              totalCost: vmTotalCost
            };
          })
          .filter(Boolean); 

        setVms(updatedVMs as VM[]);
        setAmount(totalCost.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ','));
        console.log('VM Costs:', updatedVMs);
        console.log(
          'Total Cost for all VMs:',
          totalCost.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
        );
      } else {
        console.error('Failed to fetch VM data');
      }
    } catch (e) {
      console.log('Error:', e);
    }
  };

  

  const downloadPDF = async () => {
    setHideButtons(true); 
    await new Promise((r) => setTimeout(r, 100)); 
    if (dialogRef.current) {
      const canvas = await html2canvas(dialogRef.current, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('invoice.pdf');
    }
    setHideButtons(false); 
  };


  useEffect(() => {
    fetchData();
    handleGetVmData();
  }, []);
  useEffect(() => {
    const subtotal = vms
      .reduce(
        (acc, vm) =>
          acc +
          (vm.cpuCost || 0) +
          (vm.memoryCost || 0) +
          (vm.storageCost || 0),
        0
      )
      .toFixed(2)
      .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    sessionStorage.setItem('vm_subtotal', subtotal);
    console.log(subtotal, 'cndkncdknc--o-o-o');
  }, [vms]);

  const handleOpenPopup = () => {
    handleGetVmData();
    setIsSummaryOpen(true);
  };

  const handleFetchUser = async (email: string) => {
    try {
      const response = await fetch(
        `https://daas.dev.datacentrix.cloud/api/get_user_by_email/?email=${encodeURIComponent(email)}`
      );

      if (response.ok) {
        const data = await response.json();
        setUserDetails(data as User);
        console.log(data, 'Fetched user data');
      } else {
      }
    } catch (error) {
      console.log('Fetch error:', error);
    }
  };

  const monthly = vms.reduce(
    (acc, vm) =>
      acc + (vm.cpuCost || 0) + (vm.memoryCost || 0) + (vm.storageCost || 0),
    0
  );
  const total12Months = monthly * 12;

  

  return (
    <>
      <IconButton size="small" onClick={handleOpenPopup}>
        <FiEye />
      </IconButton>

      <Dialog open={isSummaryOpen} onClose={() => setIsSummaryOpen(false)} maxWidth="xl" fullWidth>
        <DialogContent>
          <Box ref={dialogRef} sx={{ p: 2 }} >
            {/* Header */}
            <Box display="flex" justifyContent="space-between" alignItems="center" my={2}>
              <Box>{/* <Image /> placeholder */}</Box>
              <Typography variant="h6" fontWeight="bold">
                Invoice Number: IN001
              </Typography>
            </Box>

 
            <Box mb={4}>
              <Box display="flex" justifyContent="space-between">
                <Box>
                  <Typography variant="subtitle2" fontWeight="bold">Billing From:</Typography>
                  <Typography variant="body2">Datacentrix (Pty) Ltd</Typography>
                  <Typography variant="body2">238 Roan Crescent, Old Pretoria Road</Typography>
                  <Typography variant="body2">Midrand, 1685</Typography>
                  <Typography variant="body2">Reg no. 1996/015808/07</Typography>
                </Box>

                {userDetails ? (
                  <Box>
                    <Typography variant="subtitle2" fontWeight="bold">Billing To:</Typography>
                    <Typography variant="body2">{userDetails.organisation}</Typography>
                    <Typography variant="body2">
                      {userDetails.address}, {userDetails.address2}
                    </Typography>
                    <Typography variant="body2">
                      {userDetails.postal}, {userDetails.postal2}
                    </Typography>
                  </Box>
                ) : (
                  <Typography>No user data available</Typography>
                )}
              </Box>
              <Box mt={2}>
                <Typography variant="subtitle2" fontWeight="bold" display="inline">
                  Billing Period:
                </Typography>
                <Typography variant="body2" display="inline" ml={1}>
                  {fromDate} - {toDate}
                </Typography>
              </Box>
            </Box>

            {/* VM Summary Table */}
            <TableContainer component={Paper} sx={{ mb: 4 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><b>Resource</b></TableCell>
                    <TableCell><b>Description</b></TableCell>
                    <TableCell><b>Quantity</b></TableCell>
                    <TableCell><b>Unit Price</b></TableCell>
                    <TableCell><b>Total</b></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {vms.map((vm, index) => (
                    <React.Fragment key={vm.id}>
                      <TableRow>
                        {index === 0 && (
                          <TableCell rowSpan={vms.length * 2} sx={{ verticalAlign: 'top', fontWeight: 'bold' }}>
                            Virtual Machines
                          </TableCell>
                        )}
                        <TableCell>
                          {vm.name} - Virtual Machine {vm.cpu} vCPU {vm.ram} GB RAM
                        </TableCell>
                        <TableCell>1</TableCell>
                        <TableCell>
                          R{((vm.cpuCost || 0) + (vm.memoryCost || 0)).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        </TableCell>
                        <TableCell>
                          R{((vm.cpuCost || 0) + (vm.memoryCost || 0)).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Virtual Storage {vm.storageType} Encryption (GB)</TableCell>
                        <TableCell>{vm.storage}</TableCell>
                        <TableCell>
                          R{((vm.storageCost || 0) / (vm.storage || 1)).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        </TableCell>
                        <TableCell>
                          R{(vm.storageCost || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  ))}

                  {IpCount > 0 && (
                    <TableRow>
                      <TableCell rowSpan={2} sx={{ verticalAlign: 'top', fontWeight: 'bold' }}>
                        Network
                      </TableCell>
                      <TableCell>Public IP Address</TableCell>
                      <TableCell>{IpCount}</TableCell>
                      <TableCell>
                        R{ipCost.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>
                        R{(ipCost * IpCount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      </TableCell>
                    </TableRow>
                  )}

                  <TableRow>
                    <TableCell rowSpan={2} sx={{ verticalAlign: 'top', fontWeight: 'bold' }}>
                      Security
                    </TableCell>
                    <TableCell>Firewall</TableCell>
                    <TableCell>1</TableCell>
                    <TableCell>
                      R{firewallCost.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>
                      R{firewallCost.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>

            {/* Subtotal */}
            <Box display="flex" justifyContent="flex-end" pr={4}>
              <Table size="small" sx={{ width: 'auto', border: '1px solid black' }}>
                <TableBody>
                  <TableRow>
                    <TableCell>Subtotal</TableCell>
                    <TableCell align="right">
                      R{vms.reduce((acc, vm) => acc + (vm.cpuCost || 0) + (vm.memoryCost || 0) + (vm.storageCost || 0), 0)
                        .toFixed(2)
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Paid Amount</TableCell>
                    <TableCell align="right">
                      R{(paidAmount || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Amount Due</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                      R{Math.max(
                        vms.reduce((acc, vm) => acc + (vm.cpuCost || 0) + (vm.memoryCost || 0) + (vm.storageCost || 0), 0) -
                        (paidAmount || 0),
                        0
                      )
                        .toFixed(2)
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Box>

            {/* Footer buttons */}

              {!hideButtons && (
           <Box mt={4} display="flex" justifyContent="flex-end" gap={2}>
              <Button variant="contained" color="inherit" onClick={() => setIsSummaryOpen(false)}>
                Close
              </Button>
              <Button variant="contained" color="primary" onClick={downloadPDF}>
                Download PDF
              </Button>
            </Box>
        )}
           
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default VMComponent;