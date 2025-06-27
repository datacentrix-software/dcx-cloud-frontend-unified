import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Typography, 
  Box, 
  Accordion, 
  AccordionSummary, 
  AccordionDetails,
  IconButton
} from '@mui/material';
import { useState, useEffect } from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CloseIcon from '@mui/icons-material/Close';
import BackupServices from './BackupServices';
import SoftwareLicensing from './SoftwareLicensing';
import AdditionalServices from './AdditionalServices';
import { ISimpleProduct, IBackupServicesSelected, IAdditionalServicesSelected, IProductOption, IVMConfig } from '@/types';

interface AdditionalProductsDialogProps {
  open: boolean;
  onClose: () => void;
  products: ISimpleProduct[];
  onProductsUpdate: (products: ISimpleProduct[]) => void;
  existingProducts: (ISimpleProduct | IVMConfig)[];
}

export default function AdditionalProductsDialog({
  open,
  onClose,
  products,
  onProductsUpdate,
  existingProducts
}: AdditionalProductsDialogProps) {
  const [expanded, setExpanded] = useState<string | false>('backup');
  
  // State for each service type
  const [backupServicesSelected, setBackupServicesSelected] = useState<IBackupServicesSelected>({ baas: [], draas: [] });
  const [softwareLicensingSelected, setSoftwareLicensingSelected] = useState<ISimpleProduct[]>([]);
  const [additionalServicesSelected, setAdditionalServicesSelected] = useState<IAdditionalServicesSelected>({
    professional: [],
    naas: [],
    faas: [],
    collocation: [],
  });

  // Sync dialog state with existing products when dialog opens or existingProducts changes
  useEffect(() => {
    if (open && existingProducts) {
      // Filter out VMs to get only additional products
      const additionalProducts = existingProducts.filter(product => product.type !== 'virtualMachine') as ISimpleProduct[];
      
      // Helper to get product IDs by Category
      const getProductIds = (categoryNames: string[]) => {
        return additionalProducts
          .filter(product => categoryNames.some(name => product.Category?.name?.includes(name)))
          .map(product => String(product.id));
      };

      // Update backup services state
      const backupBaasIds = getProductIds(['Backup as a Service']);
      const backupDraasIds = getProductIds(['Disaster Recovery']);
      setBackupServicesSelected({
        baas: backupBaasIds,
        draas: backupDraasIds
      });

      // Update software licensing state
      const softwareLicensingProducts = additionalProducts.filter(product => 
        product.Category?.name?.includes('M365')
      );
      setSoftwareLicensingSelected(softwareLicensingProducts);

      // Update additional services state
      const professionalIds = getProductIds(['Professional Services']);
      const naasIds = getProductIds(['Network as a Service']);
      const faasIds = getProductIds(['Firewall as a Service']);
      const collocationIds = getProductIds(['Collocation']);
      
      setAdditionalServicesSelected({
        professional: professionalIds,
        naas: naasIds,
        faas: faasIds,
        collocation: collocationIds
      });
    }
  }, [open, existingProducts]);

  // Filter products for each service
  const backupServiceProducts = products.filter((p: ISimpleProduct) =>
    p.Category?.name === 'Cloud Services - Backup as a Service (BaaS)' ||
    p.Category?.name === 'Cloud Services -  Backup as a Service (BaaS)' ||
    p.Category?.name === 'Cloud Services - Disaster Recovery as a Service (DraaS)' ||
    p.Category?.name === 'Cloud Services -  Disaster Recovery as a Service (DraaS)'
  );
  
  const softwareLicensingProducts = products.filter((p: ISimpleProduct) =>
    p.Category?.name === 'Cloud Services - M365'
  );
  
  const additionalServicesProducts = products.filter((p: ISimpleProduct) =>
    [
      'Cloud Services - Professional Services',
      'Cloud Services - Network as a Service (NaaS)',
      'Cloud Services -  Network as a Service (NaaS)',
      'Cloud Services - Firewall as a Service (FaaS)',
      'Cloud Services -  Firewall as a Service (FaaS)',
      'Cloud Services - Collocation',
      'Cloud Services -  Collocation'
    ].includes(p.Category?.name || '')
  );

  const handleAccordionChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  const handleBackupServicesSelect = (options: ISimpleProduct[]) => {
    // The BackupServices component handles its own state, we just need to update all products
    updateAllProducts();
  };

  const handleSoftwareLicensingSelect = (options: ISimpleProduct[]) => {
    // Update the state with the new options
    setSoftwareLicensingSelected(options);
    // Update all products with the new options
    updateAllProductsWithSoftwareLicensing(options);
  };

  const handleAdditionalServicesSelect = (options: ISimpleProduct[]) => {
    // The AdditionalServices component manages its own state, we just need to update all products
    updateAllProductsWithAdditionalServices(options);
  };

  // const handleAdditionalProductsUpdate = (newProducts: ISimpleProduct[]) => {
  //   // Update the parent with the new products
  //   onProductsUpdate(newProducts);
  // };

  const updateAllProducts = () => {
    // Helper to get selected product objects by ID
    const getSelectedProducts = (ids: string[], options: IProductOption[]) => {
      const idSet = new Set(ids);
      return options.filter((opt) => idSet.has(String(opt.value))).map((opt) => opt.product);
    };

    // Convert options to the format expected by getSelectedProducts
    const toOptions = (products: ISimpleProduct[]): IProductOption[] => {
      return products.map((p) => ({
        value: String(p.id),
        label: `${p.title}${p.price ? ` (R${p.price})` : ''}`,
        product: p,
      }));
    };

    // Get backup services products
    const backupBaasProducts = getSelectedProducts(
      backupServicesSelected.baas || [], 
      toOptions(backupServiceProducts.filter(p => 
        p.Category?.name === 'Cloud Services - Backup as a Service (BaaS)' ||
        p.Category?.name === 'Cloud Services -  Backup as a Service (BaaS)'
      ))
    );
    const backupDraasProducts = getSelectedProducts(
      backupServicesSelected.draas || [], 
      toOptions(backupServiceProducts.filter(p => 
        p.Category?.name === 'Cloud Services - Disaster Recovery as a Service (DraaS)' ||
        p.Category?.name === 'Cloud Services -  Disaster Recovery as a Service (DraaS)'
      ))
    );

    // Get additional services products
    const additionalProfessionalProducts = getSelectedProducts(
      additionalServicesSelected.professional || [],
      toOptions(additionalServicesProducts.filter(p => p.Category?.name === 'Cloud Services - Professional Services'))
    );
    const additionalNaasProducts = getSelectedProducts(
      additionalServicesSelected.naas || [],
      toOptions(additionalServicesProducts.filter(p => 
        p.Category?.name === 'Cloud Services - Network as a Service (NaaS)' ||
        p.Category?.name === 'Cloud Services -  Network as a Service (NaaS)'
      ))
    );
    const additionalFaasProducts = getSelectedProducts(
      additionalServicesSelected.faas || [],
      toOptions(additionalServicesProducts.filter(p => 
        p.Category?.name === 'Cloud Services - Firewall as a Service (FaaS)' ||
        p.Category?.name === 'Cloud Services -  Firewall as a Service (FaaS)'
      ))
    );
    const additionalCollocationProducts = getSelectedProducts(
      additionalServicesSelected.collocation || [],
      toOptions(additionalServicesProducts.filter(p => 
        p.Category?.name === 'Cloud Services - Collocation' ||
        p.Category?.name === 'Cloud Services -  Collocation'
      ))
    );

    // Combine all selected additional products (only the ones currently selected in the dialog)
    const allSelectedAdditionalProducts = [
      ...backupBaasProducts,
      ...backupDraasProducts,
      ...softwareLicensingSelected,
      ...additionalProfessionalProducts,
      ...additionalNaasProducts,
      ...additionalFaasProducts,
      ...additionalCollocationProducts
    ];
    
    // Get existing VMs from the existing products
    const existingVMs = existingProducts.filter(product => product.type === 'virtualMachine') as ISimpleProduct[];
    
    // Combine VMs with the new additional products
    const allProducts = [...existingVMs, ...allSelectedAdditionalProducts];
    
    // Update parent with all products
    onProductsUpdate(allProducts);
  };

  const updateAllProductsWithSoftwareLicensing = (softwareLicensingOptions: ISimpleProduct[]) => {
    // Helper to get selected product objects by ID
    const getSelectedProducts = (ids: string[], options: IProductOption[]) => {
      const idSet = new Set(ids);
      return options.filter((opt) => idSet.has(String(opt.value))).map((opt) => opt.product);
    };

    // Convert options to the format expected by getSelectedProducts
    const toOptions = (products: ISimpleProduct[]): IProductOption[] => {
      return products.map((p) => ({
        value: String(p.id),
        label: `${p.title}${p.price ? ` (R${p.price})` : ''}`,
        product: p,
      }));
    };

    // Get backup services products
    const backupBaasProducts = getSelectedProducts(
      backupServicesSelected.baas || [], 
      toOptions(backupServiceProducts.filter(p => 
        p.Category?.name === 'Cloud Services - Backup as a Service (BaaS)' ||
        p.Category?.name === 'Cloud Services -  Backup as a Service (BaaS)'
      ))
    );
    const backupDraasProducts = getSelectedProducts(
      backupServicesSelected.draas || [], 
      toOptions(backupServiceProducts.filter(p => 
        p.Category?.name === 'Cloud Services - Disaster Recovery as a Service (DraaS)' ||
        p.Category?.name === 'Cloud Services -  Disaster Recovery as a Service (DraaS)'
      ))
    );

    // Get additional services products
    const additionalProfessionalProducts = getSelectedProducts(
      additionalServicesSelected.professional || [],
      toOptions(additionalServicesProducts.filter(p => p.Category?.name === 'Cloud Services - Professional Services'))
    );
    const additionalNaasProducts = getSelectedProducts(
      additionalServicesSelected.naas || [],
      toOptions(additionalServicesProducts.filter(p => 
        p.Category?.name === 'Cloud Services - Network as a Service (NaaS)' ||
        p.Category?.name === 'Cloud Services -  Network as a Service (NaaS)'
      ))
    );
    const additionalFaasProducts = getSelectedProducts(
      additionalServicesSelected.faas || [],
      toOptions(additionalServicesProducts.filter(p => 
        p.Category?.name === 'Cloud Services - Firewall as a Service (FaaS)' ||
        p.Category?.name === 'Cloud Services -  Firewall as a Service (FaaS)'
      ))
    );
    const additionalCollocationProducts = getSelectedProducts(
      additionalServicesSelected.collocation || [],
      toOptions(additionalServicesProducts.filter(p => 
        p.Category?.name === 'Cloud Services - Collocation' ||
        p.Category?.name === 'Cloud Services -  Collocation'
      ))
    );

    // Combine all selected additional products (only the ones currently selected in the dialog)
    const allSelectedAdditionalProducts = [
      ...backupBaasProducts,
      ...backupDraasProducts,
      ...softwareLicensingOptions, // Use the passed options directly
      ...additionalProfessionalProducts,
      ...additionalNaasProducts,
      ...additionalFaasProducts,
      ...additionalCollocationProducts
    ];
    
    // Get existing VMs from the existing products
    const existingVMs = existingProducts.filter(product => product.type === 'virtualMachine') as ISimpleProduct[];
    
    // Combine VMs with the new additional products
    const allProducts = [...existingVMs, ...allSelectedAdditionalProducts];
    
    // Update parent with all products
    onProductsUpdate(allProducts);
  };

  const updateAllProductsWithAdditionalServices = (additionalServicesOptions: ISimpleProduct[]) => {
    // Helper to get selected product objects by ID
    const getSelectedProducts = (ids: string[], options: IProductOption[]) => {
      const idSet = new Set(ids);
      return options.filter((opt) => idSet.has(String(opt.value))).map((opt) => opt.product);
    };

    // Convert options to the format expected by getSelectedProducts
    const toOptions = (products: ISimpleProduct[]): IProductOption[] => {
      return products.map((p) => ({
        value: String(p.id),
        label: `${p.title}${p.price ? ` (R${p.price})` : ''}`,
        product: p,
      }));
    };

    // Get backup services products
    const backupBaasProducts = getSelectedProducts(
      backupServicesSelected.baas || [], 
      toOptions(backupServiceProducts.filter(p => 
        p.Category?.name === 'Cloud Services - Backup as a Service (BaaS)' ||
        p.Category?.name === 'Cloud Services -  Backup as a Service (BaaS)'
      ))
    );
    const backupDraasProducts = getSelectedProducts(
      backupServicesSelected.draas || [], 
      toOptions(backupServiceProducts.filter(p => 
        p.Category?.name === 'Cloud Services - Disaster Recovery as a Service (DraaS)' ||
        p.Category?.name === 'Cloud Services -  Disaster Recovery as a Service (DraaS)'
      ))
    );

    // Get additional services products using the passed options directly
    const additionalProfessionalProducts = additionalServicesOptions.filter(p => 
      p.Category?.name === 'Cloud Services - Professional Services'
    );
    const additionalNaasProducts = additionalServicesOptions.filter(p => 
      p.Category?.name === 'Cloud Services - Network as a Service (NaaS)' ||
      p.Category?.name === 'Cloud Services -  Network as a Service (NaaS)'
    );
    const additionalFaasProducts = additionalServicesOptions.filter(p => 
      p.Category?.name === 'Cloud Services - Firewall as a Service (FaaS)' ||
      p.Category?.name === 'Cloud Services -  Firewall as a Service (FaaS)'
    );
    const additionalCollocationProducts = additionalServicesOptions.filter(p => 
      p.Category?.name === 'Cloud Services - Collocation' ||
      p.Category?.name === 'Cloud Services -  Collocation'
    );

    // Combine all selected additional products (only the ones currently selected in the dialog)
    const allSelectedAdditionalProducts = [
      ...backupBaasProducts,
      ...backupDraasProducts,
      ...softwareLicensingSelected,
      ...additionalProfessionalProducts,
      ...additionalNaasProducts,
      ...additionalFaasProducts,
      ...additionalCollocationProducts
    ];
    
    // Get existing VMs from the existing products
    const existingVMs = existingProducts.filter(product => product.type === 'virtualMachine') as ISimpleProduct[];
    
    // Combine VMs with the new additional products
    const allProducts = [...existingVMs, ...allSelectedAdditionalProducts];
    
    // Update parent with all products
    onProductsUpdate(allProducts);
  };

  const handleSave = () => {
    updateAllProducts();
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          maxHeight: '90vh',
          minHeight: '70vh'
        }
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" fontWeight={700}>
          Add Additional Products
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ pb: 2 }}>
        <Typography variant="body2" color="text.secondary" mb={3}>
          Select additional services to add to your quote. Click on each section to expand and configure your options.
        </Typography>

        {/* Backup Services Section */}
        <Accordion 
          expanded={expanded === 'backup'} 
          onChange={handleAccordionChange('backup')}
          sx={{ mb: 2 }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6" fontWeight={600}>
              Backup Services & Recovery
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <BackupServices
              onSelect={handleBackupServicesSelect}
              products={backupServiceProducts}
              selected={backupServicesSelected}
              setSelected={setBackupServicesSelected}
            />
          </AccordionDetails>
        </Accordion>

        {/* Software Licensing Section */}
        <Accordion 
          expanded={expanded === 'software'} 
          onChange={handleAccordionChange('software')}
          sx={{ mb: 2 }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6" fontWeight={600}>
              Software Licensing
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <SoftwareLicensing
              onSelect={handleSoftwareLicensingSelect}
              products={softwareLicensingProducts}
              selected={softwareLicensingSelected}
              setSelected={setSoftwareLicensingSelected}
            />
          </AccordionDetails>
        </Accordion>

        {/* Additional Services Section */}
        <Accordion 
          expanded={expanded === 'additional'} 
          onChange={handleAccordionChange('additional')}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6" fontWeight={600}>
              Additional Services
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <AdditionalServices
              onSelect={handleAdditionalServicesSelect}
              products={additionalServicesProducts}
              selected={additionalServicesSelected}
              setSelected={setAdditionalServicesSelected}
            />
          </AccordionDetails>
        </Accordion>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          Add to Quote
        </Button>
      </DialogActions>
    </Dialog>
  );
} 