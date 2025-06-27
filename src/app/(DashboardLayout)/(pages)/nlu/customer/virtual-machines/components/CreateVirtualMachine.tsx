import { Box, Typography, Button, TextField, Alert, Divider, Tooltip, Grid, RadioGroup, FormControlLabel, Radio, Card, CardContent, ToggleButtonGroup, ToggleButton, Select, MenuItem, FormControl, InputLabel, FormHelperText, IconButton, Fade } from '@mui/material';
import { useState, useEffect, useRef } from 'react';
import ParentCard from '@/app/components/shared/ParentCard';
import MemoryIcon from '@mui/icons-material/Memory';
import StorageIcon from '@mui/icons-material/Storage';
import SpeedIcon from '@mui/icons-material/Speed';
import DeleteIcon from '@mui/icons-material/Delete';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import AdditionalProductsDialog from './AdditionalProductsDialog';
import { useVirtualMachineOptions } from '@/store/useVirtualMachineStore';

// SVG flag icons for regions
const FlagIcon = ({ code, alt }: { code: string; alt: string }) => (
  <img
    src={`https://flagcdn.com/32x24/${code}.png`}
    alt={alt}
    style={{ borderRadius: 3, marginRight: 8, verticalAlign: 'middle', boxShadow: '0 1px 2px rgba(0,0,0,0.07)' }}
    width={32}
    height={24}
    loading="lazy"
  />
);

const WindowsSVGIcon = ({ fontSize = 32 }: { fontSize?: number }) => (
  <svg
    width={fontSize}
    height={fontSize}
    viewBox="0 0 32 32"
    fill="none"
    style={{ display: 'block' }}
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="2" y="5" width="12" height="10" fill="#00ADEF" />
    <rect x="16" y="5" width="14" height="10" fill="#00ADEF" />
    <rect x="2" y="17" width="12" height="10" fill="#00ADEF" />
    <rect x="16" y="17" width="14" height="10" fill="#00ADEF" />
  </svg>
);

const LinuxSVGIcon = ({ fontSize = 32 }: { fontSize?: number }) => (
  <svg width={fontSize} height={fontSize} viewBox="0 0 32 32" fill="none" style={{ display: 'block' }} xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="16" cy="16" rx="14" ry="14" fill="#222" />
    <ellipse cx="16" cy="20" rx="8" ry="6" fill="#fff" />
    <ellipse cx="13" cy="15" rx="2" ry="3" fill="#fff" />
    <ellipse cx="19" cy="15" rx="2" ry="3" fill="#fff" />
    <ellipse cx="13" cy="15" rx="1" ry="1.5" fill="#222" />
    <ellipse cx="19" cy="15" rx="1" ry="1.5" fill="#222" />
  </svg>
);

const regions = [
  { label: 'Johannesburg', value: 'JHB3', flag: 'za', alt: 'South Africa' },
  { label: 'Cape Town', value: 'CPT3', flag: 'za', alt: 'South Africa' },
];

const osOptions = [
  { label: 'Windows', value: 'Windows', icon: <WindowsSVGIcon fontSize={32} /> },
  { label: 'Linux', value: 'Linux', icon: <LinuxSVGIcon fontSize={32} /> },
];

interface VMConfig {
  id: string;
  region: string;
  os: string;
  serverName: string;
  description: string;
  tier: string;
  configuration: any;
  price: number;
}

interface CreateVirtualMachineProps {
  onSelect: (options: any) => void;
  onAdditionalProductsUpdate?: (products: any[]) => void;
  vmTemplates: any[];
  products: Array<{
    id: number;
    title: string;
    cost: number;
    price: number;
    profit: number;
  }>;
  selectedVMs?: VMConfig[];
}

export default function CreateVirtualMachine({ onSelect, onAdditionalProductsUpdate, vmTemplates, products, selectedVMs = [] }: CreateVirtualMachineProps) {


  // Use selectedVMs from props instead of local state
  const { region, os, tier, serverName, description, buildType, selectedTemplate, selectedSize, customSpecs, createdVMs, setRegion, setOs, setTier, setServerName, setDescription, setBuildType, setSelectedTemplate, setSelectedSize, setCustomSpecs, setCreatedVMs } = useVirtualMachineOptions();

  const didInit = useRef(false);

  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;

    if (Array.isArray(selectedVMs)) {
      const migratedVMs = selectedVMs
        .map(migrateVMConfig)
        .filter((vm): vm is NonNullable<typeof vm> => vm !== null);

      setCreatedVMs(migratedVMs);
    }
  }, []);

  // Form validation state
  const [errors, setErrors] = useState({
    region: false,
    os: false,
    serverName: false,
    tier: false,
    template: false,
    customSpecs: false
  });

  // Add touched state for form fields
  const [touched, setTouched] = useState({
    serverName: false
  });

  // Add isFormValid state
  const [isFormValid, setIsFormValid] = useState(false);

  // Move validation to useEffect
  useEffect(() => {
    const newErrors = {
      region: !region,
      os: !os,
      serverName: touched.serverName && !serverName.trim(),
      tier: !tier,
      template: buildType === 'template' && !selectedTemplate,
      customSpecs: buildType === 'custom' && (!customSpecs.vcpus || !customSpecs.memory || !customSpecs.storage || !customSpecs.ghz)
    };
    setErrors(newErrors);
    setIsFormValid(!Object.values(newErrors).some(error => error));
  }, [region, os, serverName, tier, buildType, selectedTemplate, customSpecs, touched.serverName]);

  // Update validateForm to use the stored validation state
  const validateForm = () => {
    return isFormValid;
  };

  // Update handleCreateResource to log the VM configuration
  const handleCreateResource = () => {
    if (!validateForm()) {
      // Find the first error and scroll to it
      const firstError = Object.entries(errors).find(([_, hasError]) => hasError);
      if (firstError) {
        const element = document.getElementById(firstError[0]);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
      return;
    }

    // Check if we've reached the VM limit
    if (createdVMs.length >= 5) {
      alert('You can only create up to 5 VMs at a time.');
      return;
    }

    // Validate template data
    if (buildType === 'template' && !selectedTemplate) {
      console.error('No template selected');
      return;
    }

    // Get the specs based on build type
    const specs = buildType === 'template' ? {
      vcpus: selectedTemplate.vcpus,
      memory: selectedTemplate.memory,
      storage: selectedTemplate.storage,
      ghz: selectedTemplate.ghz
    } : customSpecs;

    // Create the VM configuration
    const vmConfig = {
      id: `vm-${Date.now()}`,
      region,
      os,
      serverName,
      description,
      tier,
      configuration: {
        type: buildType,
        specs,
        templateId: selectedTemplate?.id || ''
      },
      price: calculatePrice(specs)
    };

    // Add to created VMs
    const updatedVMs = [...createdVMs, vmConfig];
    setCreatedVMs(updatedVMs);

    // Mark step 4 as completed
    markStepCompleted(4);

    // Notify parent of all VMs for quote integration
    const vmProductsForQuote = updatedVMs.map(vm => {
      const specs = vm.configuration.specs;
      const product = {
        id: vm.id,
        title: `${vm.serverName} - ${vm.os} ${vm.tier} VM`,
        description: vm.description || `${specs.vcpus} vCPU, ${specs.memory}GB RAM, ${specs.storage}GB Storage, ${specs.ghz}GHz`,
        price: vm.price,
        units: 1,
        unit: 'month',
        type: 'virtualMachine',
        details: {
          region: vm.region,
          os: vm.os,
          tier: vm.tier,
          configuration: {
            type: vm.configuration.type,
            templateId: vm.configuration.templateId || selectedTemplate?.id || '',
            specs: {
              vcpus: specs.vcpus,
              memory: specs.memory,
              storage: specs.storage,
              ghz: specs.ghz
            }
          }
        }
      };
      return product;
    });

    // Ensure we're always passing an array
    onSelect(Array.isArray(vmProductsForQuote) ? vmProductsForQuote : [vmProductsForQuote]);

    // Reset form and go back to step 1
    setServerName('');
    setDescription('');
    setSelectedTemplate(null);
    setSelectedSize(null);
    setCustomSpecs({
      vcpus: 2,
      memory: 8,
      storage: 50,
      ghz: 2.0,
    });
    setTouched({ serverName: false });
    setErrors(prev => ({ ...prev, serverName: false }));
    setStep(0);
  };

  // Update migrateVMConfig to be more defensive
  const migrateVMConfig = (vm: any) => {

    if (!vm) {
      return null;
    }

    // If the VM is already in the correct format, return it as is
    if (vm.configuration?.specs && vm.region && vm.os && vm.tier) {
      return vm;
    }

    // If the VM is in the quote format, extract the details
    if (vm.details) {
      const migratedVM = {
        id: vm.id,
        region: vm.details.region,
        os: vm.details.os,
        serverName: vm.title.split(' - ')[0],
        description: vm.description,
        tier: vm.details.tier,
        configuration: { ...vm.details.configuration, templateId: vm.details.configuration.templateId || '' },
        price: vm.price
      };

      return migratedVM;
    }

    // If the VM is in the old format, migrate it
    const config = vm.configuration || {};
    const migratedVM = {
      ...vm,
      configuration: {
        type: config.type || 'template',
        specs: {
          vcpus: Number(config.specs?.vcpus || config.vcpus || 0),
          memory: Number(config.specs?.memory || config.memory || 0),
          storage: Number(config.specs?.storage || config.storage || 0),
          ghz: Number(config.specs?.ghz || config.ghz || 0)
        },
        templateId: config.templateId || ''
      }
    };

    return migratedVM;
  };

  // Update useEffect to handle null VMs
  useEffect(() => {

    if (Array.isArray(selectedVMs)) {
      const migratedVMs = selectedVMs
        .map(migrateVMConfig)
        .filter((vm): vm is NonNullable<typeof vm> => vm !== null);

      setCreatedVMs(migratedVMs);
    }
  }, [selectedVMs]);

  // Update handleDeleteVM to handle null VMs
  const handleDeleteVM = (vmId: string) => {

    const updatedVMs = createdVMs
      .filter(vm => vm.id !== vmId)
      .map(migrateVMConfig)
      .filter((vm): vm is NonNullable<typeof vm> => vm !== null);


    setCreatedVMs(updatedVMs);

    // Notify parent of remaining VMs
    const remainingVmProducts = updatedVMs.map(vm => {
      const product = {
        id: vm.id,
        title: `${vm.serverName} - ${vm.os} ${vm.tier} VM`,
        description: vm.description || `Custom ${vm.configuration.specs.vcpus} vCPU, ${vm.configuration.specs.memory}GB RAM, ${vm.configuration.specs.storage}GB Storage, ${vm.configuration.specs.ghz}GHz`,
        price: vm.price,
        units: 1,
        unit: 'month',
        type: 'virtualMachine',
        details: {
          region: vm.region,
          os: vm.os,
          tier: vm.tier,
          configuration: {
            type: vm.configuration.type,
            specs: {
              vcpus: vm.configuration.specs.vcpus,
              memory: vm.configuration.specs.memory,
              storage: vm.configuration.specs.storage,
              ghz: vm.configuration.specs.ghz
            },
            templateId: vm.configuration?.templateId || ''
          }
        }
      };

      return product;
    });


    onSelect(Array.isArray(remainingVmProducts) ? remainingVmProducts : [remainingVmProducts]);
  };

  // Calculate total price
  const totalPrice = Array.isArray(createdVMs) ? createdVMs.reduce((sum, vm) => sum + (vm?.price || 0), 0) : 0;

  // Calculate price for any VM configuration
  const calculatePrice = (specs: { vcpus: number; memory: number; storage: number; ghz: number }) => {
    // Input validation
    if (!specs) {
      console.error('No specs provided for price calculation');
      return 0;
    }

    if (!products || products.length === 0) {
      console.error('No products available for pricing calculation');
      return 0;
    }

    // Get the base costs from the products table
    const cpuProduct = products.find(p =>
      p.title.toLowerCase().includes('cpu') &&
      p.title.toLowerCase().includes(`${specs.ghz}ghz`) &&
      !p.title.toLowerCase().includes('engineer') &&
      !p.title.toLowerCase().includes('manager')
    );
    const memoryProduct = products.find(p =>
      (p.title.toLowerCase().includes('memory') || p.title.toLowerCase().includes('ram')) &&
      !p.title.toLowerCase().includes('engineer') &&
      !p.title.toLowerCase().includes('manager')
    );

    // Find storage product based on tier
    const storageProduct = products.find(p =>
      p.title.toLowerCase().includes('storage') &&
      p.title.toLowerCase().includes(tier.toLowerCase()) &&
      !p.title.toLowerCase().includes('engineer') &&
      !p.title.toLowerCase().includes('manager')
    );

    // Detailed validation with specific error messages
    const validationErrors = [];

    if (!cpuProduct) {
      validationErrors.push(`No CPU product found for ${specs.ghz}`);
      console.warn(`No CPU product found for ${specs.ghz}. Available CPU products:`,
        products.filter(p => p.title.toLowerCase().includes('cpu'))
          .map(p => ({ title: p.title, price: p.price, cost: p.cost }))
      );
    }

    if (!memoryProduct) {
      validationErrors.push('No memory product found');
      console.warn('No memory product found. Available memory products:',
        products.filter(p => p.title.toLowerCase().includes('memory') || p.title.toLowerCase().includes('ram'))
          .map(p => ({ title: p.title, price: p.price, cost: p.cost }))
      );
    }

    if (!storageProduct) {
      validationErrors.push(`No ${tier} storage product found`);
      console.warn(`No ${tier} storage product found. Available storage products:`,
        products.filter(p => p.title.toLowerCase().includes('storage'))
          .map(p => ({ title: p.title, price: p.price, cost: p.cost }))
      );
    }

    if (validationErrors.length > 0) {
      console.warn('Validation warnings:', validationErrors);
    }

    // Ensure all specs are valid numbers with defensive checks
    const vcpus = typeof specs.vcpus === 'number' ? specs.vcpus :
      typeof specs.vcpus === 'string' ? parseFloat(specs.vcpus) : 0;
    const memory = typeof specs.memory === 'number' ? specs.memory :
      typeof specs.memory === 'string' ? parseFloat(specs.memory) : 0;
    const storage = typeof specs.storage === 'number' ? specs.storage :
      typeof specs.storage === 'string' ? parseFloat(specs.storage) : 0;
    const ghz = typeof specs.ghz === 'number' ? specs.ghz :
      typeof specs.ghz === 'string' ? parseFloat(specs.ghz) : 0;

    // Log the converted values for debugging


    // Validate numeric inputs
    if (isNaN(vcpus) || isNaN(memory) || isNaN(storage) || isNaN(ghz)) {
      console.error('Invalid numeric conversion:', {
        original: specs,
        converted: { vcpus, memory, storage, ghz }
      });
      return 0;
    }

    if (vcpus <= 0 || memory <= 0 || storage <= 0 || ghz <= 0) {
      console.error('Non-positive numeric inputs:', { vcpus, memory, storage, ghz });
      return 0;
    }

    // Calculate CPU cost: (cost / (1 - (profit/100))) * quantity
    const cpuCost = Math.ceil(cpuProduct ?
      (cpuProduct.cost / (1 - (cpuProduct.profit / 100))) * vcpus :
      vcpus * (ghz === 1 ? (30.98 / (1 - (60 / 100))) : (61.97 / (1 - (60 / 100))))); // Fallback price based on GHz

    // Calculate Memory cost: (cost / (1 - (profit/100))) * quantity
    const memoryCost = Math.ceil(memoryProduct ?
      (memoryProduct.cost / (1 - (memoryProduct.profit / 100))) * memory :
      memory * (50 / (1 - (60 / 100)))); // Fallback price if product not found

    // Calculate Storage cost based on tier
    const storageCost = storageProduct ?
      storageProduct.price * storage : // Use price directly for storage
      storage * (tier === 'Premium SSD' ? 2.75 : 1.8); // Fallback prices based on tier

    const total = cpuCost + memoryCost + storageCost;

    return total;
  };

  // Update notifyParent to include all details
  const notifyParent = (next: any = {}) => {
    if (buildType === 'custom') {
      const specs = customSpecs;
      // Validate specs before calculating price
      if (specs && specs.vcpus > 0 && specs.memory > 0 && specs.storage > 0 && specs.ghz > 0) {
        onSelect({
          region: next.region ?? region,
          os: next.os ?? os,
          serverName: next.serverName ?? serverName,
          description: next.description ?? description,
          tier: next.tier ?? tier,
          template: [{
            id: 'custom',
            title: 'Custom Build',
            vcpus: specs.vcpus,
            memory: specs.memory,
            storage: specs.storage,
            ghz: specs.ghz,
            price: calculatePrice(specs),
            description: `${specs.vcpus} vCPU, ${specs.memory}GB RAM, ${specs.storage}GB Storage, ${specs.ghz}GHz`
          }]
        });
      } else {
        // If specs are invalid, send empty template array
        onSelect({
          region: next.region ?? region,
          os: next.os ?? os,
          serverName: next.serverName ?? serverName,
          description: next.description ?? description,
          tier: next.tier ?? tier,
          template: []
        });
      }
    } else {
      const template = next.template ?? selectedTemplate;
      if (template && template.vcpus > 0 && template.memory > 0 && template.storage > 0 && template.ghz > 0) {
        const specs = {
          vcpus: template.vcpus,
          memory: template.memory,
          storage: template.storage,
          ghz: template.ghz
        };
        const templateWithPrice = {
          ...template,
          price: calculatePrice(specs)
        };
        onSelect({
          region: next.region ?? region,
          os: next.os ?? os,
          serverName: next.serverName ?? serverName,
          description: next.description ?? description,
          tier: next.tier ?? tier,
          template: [templateWithPrice]
        });
      } else {
        // If template is invalid or null, send empty template array
        onSelect({
          region: next.region ?? region,
          os: next.os ?? os,
          serverName: next.serverName ?? serverName,
          description: next.description ?? description,
          tier: next.tier ?? tier,
          template: []
        });
      }
    }
  };

  // Get unique sizes from templates
  const sizes = ['Small', 'Medium', 'Large'].filter(size =>
    vmTemplates.some(t => t.group === size)
  );

  // Get templates for selected size
  const getTemplatesForSize = (size: string) => {
    // At step 2, we don't have OS and tier selected yet, so only filter by size
    if (step < 2) {
      return vmTemplates.filter(template => template.group === size);
    }
    
    // At later steps, filter by all criteria
    return vmTemplates.filter(template =>
      template.group === size &&
      template.osType.toLowerCase().includes(os.toLowerCase()) &&
      template.type.toLowerCase().includes(tier.toLowerCase())
    );
  };

  const [showTierTip, setShowTierTip] = useState(true);

  // Additional Products Dialog state
  const [additionalProductsDialogOpen, setAdditionalProductsDialogOpen] = useState(false);

  // Step state and refs
  const [step, setStep] = useState(0);
  const regionRef = useRef<HTMLDivElement>(null);
  const templateRef = useRef<HTMLDivElement>(null);
  // Add refs for all steps (future-proof)
  const tierRef = useRef<HTMLDivElement>(null);
  const osRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLDivElement>(null);

  // Step labels
  const stepLabels = [
    'Region',
    'Template/Custom',
    'Tier',
    'Operating System',
    'Name & Description',
  ];

  // Scroll to step when step changes
  useEffect(() => {
    const refs = [regionRef, templateRef, tierRef, osRef, nameRef];
    const currentRef = refs[step];
    if (currentRef && currentRef.current) {
      currentRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [step]);

  // Stepper click handler
  const handleStepClick = (idx: number) => {
    // Allow navigation to any completed step or current step
    if (idx === step || isStepCompleted(idx) || idx < step) {
      setStep(idx);
    } else if (idx === step + 1 && validateCurrentStep()) {
      // Allow progression to next step if current step is valid
      markStepCompleted(step);
      setStep(idx);
    }
  };

  // Validate current step before allowing progression
  const validateCurrentStep = () => {
    switch (step) {
      case 0: // Region selection
        return !!region;
      case 1: // Template selection
        return buildType === 'template' ? !!selectedTemplate : 
               buildType === 'custom' ? (!!customSpecs.vcpus && !!customSpecs.memory && !!customSpecs.storage && !!customSpecs.ghz) : false;
      case 2: // Tier selection
        return !!tier;
      case 3: // OS selection
        return !!os;
      case 4: // Name and description
        return !!serverName.trim();
      default:
        return true;
    }
  };

  // Additional Products Dialog handlers
  const handleOpenAdditionalProducts = () => {
    setAdditionalProductsDialogOpen(true);
  };

  const handleCloseAdditionalProducts = () => {
    setAdditionalProductsDialogOpen(false);
  };

  const handleAdditionalProductsUpdate = (newProducts: any[]) => {
    // Use the dedicated callback for additional products if provided
    if (onAdditionalProductsUpdate) {
      onAdditionalProductsUpdate(newProducts);
    } else {
      // Fallback to the old behavior
      onSelect(newProducts);
    }
  };

  // Add state to track completed steps
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  // Function to mark a step as completed
  const markStepCompleted = (stepIndex: number) => {
    setCompletedSteps(prev => new Set([...Array.from(prev), stepIndex]));
  };

  // Function to check if a step is completed
  const isStepCompleted = (stepIndex: number) => {
    return completedSteps.has(stepIndex);
  };

  // Function to check if a step can be accessed
  const canAccessStep = (stepIndex: number) => {
    // Allow access to current step, completed steps, or next step if current is valid
    return stepIndex === step || isStepCompleted(stepIndex) || (stepIndex === step + 1 && validateCurrentStep());
  };

  return (
    <>
      {/* Step Progress Indicator */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" fontWeight={700} color="primary" mb={2}>
          Create Virtual Machine
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {stepLabels.map((label, index) => {
            const isCompleted = isStepCompleted(index);
            const isCurrent = index === step;
            const canAccess = canAccessStep(index);
            
            return (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  backgroundColor: isCurrent ? 'primary.main' : 
                                 isCompleted ? 'success.light' : 
                                 'grey.100',
                  color: isCurrent ? 'white' : 
                         isCompleted ? 'success.dark' : 
                         'text.secondary',
                  cursor: canAccess ? 'pointer' : 'default',
                  opacity: canAccess ? 1 : 0.5,
                  transition: 'all 0.2s',
                  '&:hover': canAccess ? {
                    backgroundColor: isCurrent ? 'primary.dark' : 
                                   isCompleted ? 'success.main' : 
                                   'grey.200',
                  } : {},
                }}
                onClick={() => canAccess && handleStepClick(index)}
              >
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: isCurrent ? 'white' : 
                                   isCompleted ? 'success.main' : 
                                   'grey.300',
                    color: isCurrent ? 'primary.main' : 
                           isCompleted ? 'white' : 
                           'text.secondary',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                  }}
                >
                  {isCompleted ? '✓' : index + 1}
                </Box>
                <Typography 
                  variant="body2" 
                  fontWeight={isCurrent ? 600 : 500}
                  sx={{ whiteSpace: 'nowrap' }}
                >
                  {label}
                </Typography>
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* Step 1: Select Data Centre Region */}
      <div ref={regionRef} id="region-step">
        <Fade in={step === 0} timeout={500} unmountOnExit>
          <div>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h4" fontWeight={700} color="primary">
                Step 1 of 5: {stepLabels[0]}
              </Typography>
              <Tooltip 
                title={createdVMs.length === 0 ? "You need to create a virtual machine first before adding additional products" : ""}
                placement="top"
              >
                <span>
                  <Button
                    variant="outlined"
                    // disabled={createdVMs.length === 0} CHAND
                    sx={{ textTransform: 'none' }}
                    onClick={handleOpenAdditionalProducts}
                  >
                    Add Additional Products
                  </Button>
                </span>
              </Tooltip>
            </Box>
            <ParentCard sx={{ mb: 3, bgcolor: '#fafbfc', '& .MuiCardContent-root': { pt: 0, px: 2 } }} id="region">
              <Typography variant="h6" fontWeight={600} mb={1}>
                Select Data Centre Region
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                Select the closest region for low-latency and compliance.
              </Typography>
              {!region && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  Please select a data centre region to continue with your VM configuration.
                </Alert>
              )}
              {errors.region && (
                <FormHelperText error>Please select a region</FormHelperText>
              )}
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {regions.map((r) => (
                  <Button
                    key={r.value}
                    variant={region === r.value ? 'contained' : 'outlined'}
                    color={region === r.value ? 'primary' : 'inherit'}
                    sx={{
                      flex: 1,
                      minWidth: 180,
                      height: '55px',
                      borderRadius: 2,
                      boxShadow: region === r.value ? 2 : 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-start',
                      fontWeight: 600,
                      fontSize: '1.1rem',
                      borderColor: region === r.value ? 'primary.main' : 'grey.300',
                      transition: 'all 0.2s',
                      textTransform: 'none',
                      background: region === r.value ? 'primary.main' : undefined,
                      color: region === r.value ? 'white' : 'inherit',
                      '&:hover': {
                        background: region === r.value ? 'primary.dark' : undefined,
                      }
                    }}
                    onClick={() => {
                      setRegion(r.value);
                      notifyParent({ region: r.value });
                      markStepCompleted(0); // Mark step 0 as completed
                      setTimeout(() => setStep(1), 400); // Delay for animation
                    }}
                    startIcon={<FlagIcon code={r.flag} alt={r.alt} />}
                  >
                    {r.label}
                  </Button>
                ))}
              </Box>
            </ParentCard>
          </div>
        </Fade>
      </div>

      {/* Step 2: Choose VM Template */}
      <div ref={templateRef} id="template-step">
        <Fade in={step === 1} timeout={500} unmountOnExit>
          <div>
            {/* Back button for step 2 and onward */}
            <Box sx={{ mb: 2 }}>
              {step > 0 && (
                <Button variant="outlined" onClick={() => setStep(step - 1)}>
                  Back
                </Button>
              )}
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h4" fontWeight={700} color="primary">
                Step 2 of 5: {stepLabels[1]}
              </Typography>
              <Tooltip 
                title={createdVMs.length === 0 ? "You need to create a virtual machine first before adding additional products" : ""}
                placement="top"
              >
                <span>
                  <Button
                    variant="outlined"
                    disabled={createdVMs.length === 0}
                    sx={{ textTransform: 'none' }}
                    onClick={handleOpenAdditionalProducts}
                  >
                    Add Additional Products
                  </Button>
                </span>
              </Tooltip>
            </Box>
            <ParentCard id="template" sx={{ '& .MuiCardContent-root': { pt: 0, px: 2 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                  <Typography variant="h6" fontWeight={600} mb={1}>
                    Choose VM Template
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Select a size category and then choose your specific configuration.
                  </Typography>
                </Box>
              </Box>

              {/* Build Type Toggle */}
              <Box sx={{ mb: 3 }}>
                <ToggleButtonGroup
                  value={buildType}
                  exclusive
                  onChange={(e, value) => {
                    if (value !== null) {
                      setBuildType(value);
                      setSelectedTemplate(null);
                      setSelectedSize(null);
                      setErrors(prev => ({ ...prev, template: false, customSpecs: false }));
                      setCustomSpecs({
                        vcpus: 2,
                        memory: 8,
                        storage: 50,
                        ghz: 2.0,
                      });
                      notifyParent({ template: [] });
                    }
                  }}
                  sx={{
                    '& .MuiToggleButton-root': {
                      px: 4,
                      py: 1.5,
                      fontWeight: 600,
                      textTransform: 'none',
                      borderRadius: '8px !important',
                      '&.Mui-selected': {
                        backgroundColor: 'primary.main',
                        color: 'white',
                        '&:hover': {
                          backgroundColor: 'primary.dark',
                        },
                      },
                    },
                  }}
                >
                  <ToggleButton value="template">
                    Predefined Templates
                  </ToggleButton>
                  <ToggleButton value="custom">
                    Custom Build
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>

              {buildType === 'template' ? (
                <>
                  {/* Size Selection */}
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
                    {sizes.map((size) => {
                      const sizeTemplates = getTemplatesForSize(size);
                      return (
                        <Button
                          key={size}
                          variant={selectedSize === size ? 'contained' : 'outlined'}
                          color={selectedSize === size ? 'primary' : 'inherit'}
                          sx={{
                            flex: 1,
                            minWidth: 180,
                            py: 3,
                            borderRadius: 2,
                            boxShadow: selectedSize === size ? 2 : 0,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            fontWeight: 600,
                            fontSize: '1.1rem',
                            borderColor: selectedSize === size ? 'primary.main' : 'grey.300',
                            transition: 'all 0.2s',
                            textTransform: 'none',
                            background: selectedSize === size ? 'primary.main' : undefined,
                            color: selectedSize === size ? 'white' : 'inherit',
                            '&:hover': {
                              background: selectedSize === size ? 'primary.dark' : undefined,
                            },
                            gap: 1,
                          }}
                          onClick={() => {
                            setSelectedSize(size);
                            setSelectedTemplate(null);
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <MemoryIcon />
                            <Typography variant="h6" fontWeight={700}>{size}</Typography>
                          </Box>
                          <Typography variant="body2" color="text.secondary" align="center">
                            {size === 'Small' ? '2 vCPUs, 8GB RAM' :
                              size === 'Medium' ? '4 vCPUs, 16GB RAM' :
                                '8 vCPUs, 32GB RAM'}
                          </Typography>
                        </Button>
                      );
                    })}
                  </Box>

                  {/* Template Options */}
                  {selectedSize && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {getTemplatesForSize(selectedSize).map((template) => {
                        const templatePrice = calculatePrice({
                          vcpus: template.vcpus,
                          memory: template.memory,
                          storage: template.storage,
                          ghz: template.ghz
                        });

                        return (
                          <Card
                            key={template.id}
                            sx={{
                              cursor: 'pointer',
                              border: selectedTemplate?.id === template.id ? '2px solid' : '1px solid',
                              borderColor: selectedTemplate?.id === template.id ? 'primary.main' : 'grey.300',
                              transition: 'all 0.2s',
                              '&:hover': {
                                borderColor: 'primary.main',
                                boxShadow: 2,
                              },
                            }}
                            onClick={() => {
                              setSelectedTemplate(template);
                              notifyParent({ template });
                            }}
                          >
                            <CardContent>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box>
                                  <Typography variant="h6" fontWeight={600}>
                                    {template.ghz} Configuration
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {template.description}
                                  </Typography>
                                  <Typography variant="h6" color="primary" fontWeight={700} mt={1}>
                                    R{templatePrice.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/month
                                  </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 3 }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <MemoryIcon color="action" />
                                    <Typography variant="body1" fontWeight={500}>
                                      {template.vcpus} vCPUs
                                    </Typography>
                                  </Box>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <StorageIcon color="action" />
                                    <Typography variant="body1" fontWeight={500}>
                                      {template.memory}GB RAM
                                    </Typography>
                                  </Box>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <SpeedIcon color="action" />
                                    <Typography variant="body1" fontWeight={500}>
                                      {template.storage}GB Storage
                                    </Typography>
                                  </Box>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <SpeedIcon color="action" />
                                    <Typography variant="body1" fontWeight={500}>
                                      {template.ghz}
                                    </Typography>
                                  </Box>
                                </Box>
                              </Box>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </Box>
                  )}
                </>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                      <TextField
                        label="vCPUs"
                        type="number"
                        fullWidth
                        value={customSpecs.vcpus}
                        onChange={(e) => {
                          const value = Math.max(1, Math.min(32, parseInt(e.target.value) || 1));
                          setCustomSpecs({ ...customSpecs, vcpus: value });
                          notifyParent();
                        }}
                        InputProps={{
                          inputProps: { min: 1, max: 32 }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <FormControl fullWidth>
                        <InputLabel id="ram-select-label">RAM (GB)</InputLabel>
                        <Select
                          labelId="ram-select-label"
                          value={customSpecs.memory}
                          label="RAM (GB)"
                          onChange={(e) => {
                            const value = Number(e.target.value);
                            setCustomSpecs({ ...customSpecs, memory: value });
                            notifyParent();
                          }}
                        >
                          {[4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60, 64, 128].map((ram) => (
                            <MenuItem key={ram} value={ram}>{ram} GB</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        label="Storage (GB)"
                        type="number"
                        fullWidth
                        value={customSpecs.storage}
                        onChange={(e) => {
                          const value = Math.max(10, Math.min(2000, parseInt(e.target.value) || 10));
                          setCustomSpecs({ ...customSpecs, storage: value });
                          notifyParent();
                        }}
                        InputProps={{
                          inputProps: { min: 10, max: 2000 }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <FormControl fullWidth>
                        <InputLabel id="ghz-select-label">GHz</InputLabel>
                        <Select
                          labelId="ghz-select-label"
                          value={customSpecs.ghz}
                          label="GHz"
                          onChange={(e) => {
                            const value = Number(e.target.value);
                            setCustomSpecs({ ...customSpecs, ghz: value });
                            notifyParent();
                          }}
                        >
                          <MenuItem value={1}>1 GHz</MenuItem>
                          <MenuItem value={2}>2 GHz</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                  <Card sx={{ mt: 2 }}>
                    <CardContent>
                      <Typography variant="h6" fontWeight={600} mb={2}>
                        Custom Build Summary
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          <Typography variant="body1" color="text.secondary">
                            Estimated Monthly Cost
                          </Typography>
                          <Typography variant="h5" color="primary" fontWeight={700}>
                            R{calculatePrice(customSpecs).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 3 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <MemoryIcon color="action" />
                            <Typography variant="body1" fontWeight={500}>
                              {customSpecs.vcpus} vCPUs
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <StorageIcon color="action" />
                            <Typography variant="body1" fontWeight={500}>
                              {customSpecs.memory}GB RAM
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <SpeedIcon color="action" />
                            <Typography variant="body1" fontWeight={500}>
                              {customSpecs.storage}GB Storage
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <SpeedIcon color="action" />
                            <Typography variant="body1" fontWeight={500}>
                              {customSpecs.ghz}GHz
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Box>
              )}

              {/* Continue button */}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => {
                    markStepCompleted(1); // Mark step 1 as completed
                    setStep(2);
                  }}
                  disabled={!buildType || (buildType === 'template' && !selectedTemplate) || (buildType === 'custom' && (!customSpecs.vcpus || !customSpecs.memory || !customSpecs.storage || !customSpecs.ghz))}
                  sx={{
                    px: 4,
                    py: 1.5,
                    fontWeight: 600,
                    textTransform: 'none',
                    borderRadius: 2,
                  }}
                >
                  Continue
                </Button>
              </Box>
            </ParentCard>
          </div>
        </Fade>
      </div>

      {/* Step 3: Select Tier */}
      <div ref={tierRef} id="tier-step">
        <Fade in={step === 2} timeout={500} unmountOnExit>
          <div>
            {/* Back button */}
            <Box sx={{ mb: 2 }}>
              {step > 0 && (
                <Button variant="outlined" onClick={() => setStep(step - 1)}>
                  Back
                </Button>
              )}
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h4" fontWeight={700} color="primary">
                Step 3 of 5: {stepLabels[2]}
              </Typography>
              <Tooltip 
                title={createdVMs.length === 0 ? "You need to create a virtual machine first before adding additional products" : ""}
                placement="top"
              >
                <span>
                  <Button
                    variant="outlined"
                    disabled={createdVMs.length === 0}
                    sx={{ textTransform: 'none' }}
                    onClick={handleOpenAdditionalProducts}
                  >
                    Add Additional Products
                  </Button>
                </span>
              </Tooltip>
            </Box>
            <ParentCard sx={{ '& .MuiCardContent-root': { pt: 0, px: 2 } }}>
              <Typography variant="h6" fontWeight={600} mb={1}>
                Select Tier
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                Choose the performance tier that best suits your workload.
              </Typography>
              {!tier && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  Please select a storage tier to continue with your VM configuration.
                </Alert>
              )}
              {errors.tier && (
                <FormHelperText error>Please select a tier</FormHelperText>
              )}
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
                <Button
                  variant={tier === 'Standard SSD' ? 'contained' : 'outlined'}
                  color={tier === 'Standard SSD' ? 'primary' : 'inherit'}
                  sx={{
                    flex: 1,
                    minWidth: 180,
                    height: '45px',
                    borderRadius: 2,
                    boxShadow: tier === 'Standard SSD' ? 2 : 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    fontWeight: 600,
                    fontSize: '1rem',
                    borderColor: tier === 'Standard SSD' ? 'primary.main' : 'grey.300',
                    transition: 'all 0.2s',
                    textTransform: 'none',
                    backgroundColor: tier === 'Standard SSD' ? 'primary.main' : undefined,
                    color: tier === 'Standard SSD' ? 'white' : 'inherit',
                    '&:hover': {
                      backgroundColor: tier === 'Standard SSD' ? 'primary.dark' : undefined,
                    },
                    gap: 1,
                    px: 2
                  }}
                  onClick={() => {
                    setTier('Standard SSD');
                    notifyParent({ tier: 'Standard SSD' });
                    markStepCompleted(2); // Mark step 2 as completed
                    setTimeout(() => setStep(3), 400);
                  }}
                  startIcon={<StarBorderIcon />}
                >
                  Standard
                </Button>

                <Button
                  variant={tier === 'Premium SSD' ? 'contained' : 'outlined'}
                  color={tier === 'Premium SSD' ? 'primary' : 'inherit'}
                  sx={{
                    flex: 1,
                    minWidth: 180,
                    height: '45px',
                    borderRadius: 2,
                    boxShadow: tier === 'Premium SSD' ? 2 : 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    fontWeight: 600,
                    fontSize: '1rem',
                    borderColor: tier === 'Premium SSD' ? 'primary.main' : 'grey.300',
                    transition: 'all 0.2s',
                    textTransform: 'none',
                    backgroundColor: tier === 'Premium SSD' ? 'primary.main' : undefined,
                    color: tier === 'Premium SSD' ? 'white' : 'inherit',
                    '&:hover': {
                      backgroundColor: tier === 'Premium SSD' ? 'primary.dark' : undefined,
                    },
                    gap: 1,
                    px: 2
                  }}
                  onClick={() => {
                    setTier('Premium SSD');
                    notifyParent({ tier: 'Premium SSD' });
                    markStepCompleted(2); // Mark step 2 as completed
                    setTimeout(() => setStep(3), 400);
                  }}
                  startIcon={<StarIcon />}
                >
                  Premium
                </Button>
              </Box>
              {/* Info box for Tier selection */}
              {showTierTip && (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 2,
                    mb: 2,
                    px: 2,
                    py: 1.5,
                    borderRadius: 2,
                    background: 'linear-gradient(90deg, #fffbe7 0%, #fff7c2 100%)',
                    boxShadow: 1,
                    position: 'relative',
                  }}
                >
                  <LightbulbOutlinedIcon sx={{ color: '#fbc02d', mt: 0.5 }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" fontWeight={700} color="#7a5d00" mb={0.5}>
                      Not sure what to choose?
                    </Typography>
                    <Typography variant="body2" color="#7a5d00">
                      Standard SSD tier is perfect for development and testing. Choose Premium SSD for production workloads that need guaranteed performance and priority support.
                    </Typography>
                  </Box>
                </Box>
              )}
            </ParentCard>
          </div>
        </Fade>
      </div>

      {/* Step 4: Select Operating System */}
      <div ref={osRef} id="os-step">
        <Fade in={step === 3} timeout={500} unmountOnExit>
          <div>
            {/* Back button */}
            <Box sx={{ mb: 2 }}>
              {step > 0 && (
                <Button variant="outlined" onClick={() => setStep(step - 1)}>
                  Back
                </Button>
              )}
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h4" fontWeight={700} color="primary">
                Step 4 of 5: {stepLabels[3]}
              </Typography>
              <Tooltip 
                title={createdVMs.length === 0 ? "You need to create a virtual machine first before adding additional products" : ""}
                placement="top"
              >
                <span>
                  <Button
                    variant="outlined"
                    disabled={createdVMs.length === 0}
                    sx={{ textTransform: 'none' }}
                    onClick={handleOpenAdditionalProducts}
                  >
                    Add Additional Products
                  </Button>
                </span>
              </Tooltip>
            </Box>
            <ParentCard sx={{ '& .MuiCardContent-root': { pt: 0, px: 2 } }}>
              <Typography variant="h6" fontWeight={600} mb={1}>
                Choose Operating System
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                Run your workload on the platform you prefer.
              </Typography>
              {!os && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  Please select an operating system to continue with your VM configuration.
                </Alert>
              )}
              {errors.os && (
                <FormHelperText error>Please select an operating system</FormHelperText>
              )}
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
                {osOptions.map((o) => (
                  <Button
                    key={o.value}
                    variant={os === o.value ? 'contained' : 'outlined'}
                    color={os === o.value ? 'primary' : 'inherit'}
                    sx={{
                      flex: 1,
                      minWidth: 180,
                      height: '45px',
                      borderRadius: 2,
                      boxShadow: os === o.value ? 2 : 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-start',
                      fontWeight: 600,
                      fontSize: '1rem',
                      borderColor: os === o.value ? 'primary.main' : 'grey.300',
                      transition: 'all 0.2s',
                      textTransform: 'none',
                      background: os === o.value ? 'primary.main' : undefined,
                      color: os === o.value ? 'white' : 'inherit',
                      '&:hover': {
                        background: os === o.value ? 'primary.dark' : undefined,
                      },
                      gap: 1,
                      px: 2
                    }}
                    onClick={() => {
                      setOs(o.value);
                      notifyParent({ os: o.value });
                      markStepCompleted(3); // Mark step 3 as completed
                      setTimeout(() => setStep(4), 400);
                    }}
                    startIcon={o.icon}
                  >
                    {o.label}
                  </Button>
                ))}
              </Box>
              {/* Info box for OS selection */}
              {showTierTip && (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 2,
                    mb: 2,
                    px: 2,
                    py: 1.5,
                    borderRadius: 2,
                    background: 'linear-gradient(90deg, #fffbe7 0%, #fff7c2 100%)',
                    boxShadow: 1,
                    position: 'relative',
                  }}
                >
                  <LightbulbOutlinedIcon sx={{ color: '#fbc02d', mt: 0.5 }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" fontWeight={700} color="#7a5d00" mb={0.5}>
                      Not sure what to choose?
                    </Typography>
                    <Typography variant="body2" color="#7a5d00">
                      Linux is lightweight, free and works for most apps. Pick Windows if your software depends on it.
                    </Typography>
                  </Box>
                </Box>
              )}
            </ParentCard>
          </div>
        </Fade>
      </div>

      {/* Step 5: Name & Description */}
      <div ref={nameRef} id="name-step">
        <Fade in={step === 4} timeout={500} unmountOnExit>
          <div>
            {/* Back button */}
            <Box sx={{ mb: 2 }}>
              {step > 0 && (
                <Button variant="outlined" onClick={() => setStep(step - 1)}>
                  Back
                </Button>
              )}
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h4" fontWeight={700} color="primary">
                Step 5 of 5: {stepLabels[4]}
              </Typography>
              <Tooltip 
                title={createdVMs.length === 0 ? "You need to create a virtual machine first before adding additional products" : ""}
                placement="top"
              >
                <span>
                  <Button
                    variant="outlined"
                    disabled={createdVMs.length === 0}
                    sx={{ textTransform: 'none' }}
                    onClick={handleOpenAdditionalProducts}
                  >
                    Add Additional Products
                  </Button>
                </span>
              </Tooltip>
            </Box>
            <ParentCard sx={{ '& .MuiCardContent-root': { pt: 0, px: 2 } }}>
              <Typography variant="h6" fontWeight={600} mb={1}>
                Give Your Server a Name
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                Optional: Add a short description to help you identify this VM later.
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Machine Name"
                  placeholder="e.g., web-server-01, app-server-prod"
                  fullWidth
                  size="small"
                  value={serverName}
                  onChange={e => {
                    setServerName(e.target.value);
                    setTouched(prev => ({ ...prev, serverName: true }));
                    setErrors(prev => ({ ...prev, serverName: false }));
                    notifyParent({ serverName: e.target.value });
                  }}
                  onBlur={() => setTouched(prev => ({ ...prev, serverName: true }))}
                  error={errors.serverName}
                  helperText={errors.serverName ? "Please enter a machine name" : "Enter a unique name for your virtual machine"}
                  variant="outlined"
                  InputLabelProps={{
                    shrink: true,
                    sx: { 
                      position: 'relative',
                      transform: 'none',
                      marginBottom: '8px',
                      color: 'text.primary',
                      fontWeight: 600
                    }
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      marginTop: '0px',
                      '& fieldset': {
                        border: '1px solid rgba(0, 0, 0, 0.23)'
                      },
                      '&:hover fieldset': {
                        border: '1px solid rgba(0, 0, 0, 0.23)'
                      },
                      '&.Mui-focused fieldset': {
                        border: '2px solid #1976d2'
                      }
                    }
                  }}
                />
                <TextField
                  label="Description"
                  placeholder="e.g., Production web server for customer portal, Development environment for testing"
                  fullWidth
                  size="small"
                  multiline
                  minRows={2}
                  value={description}
                  onChange={e => {
                    setDescription(e.target.value);
                    notifyParent({ description: e.target.value });
                  }}
                  variant="outlined"
                  InputLabelProps={{
                    shrink: true,
                    sx: { 
                      position: 'relative',
                      transform: 'none',
                      marginBottom: '8px',
                      color: 'text.primary',
                      fontWeight: 600
                    }
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      marginTop: '0px',
                      '& fieldset': {
                        border: '1px solid rgba(0, 0, 0, 0.23)'
                      },
                      '&:hover fieldset': {
                        border: '1px solid rgba(0, 0, 0, 0.23)'
                      },
                      '&.Mui-focused fieldset': {
                        border: '2px solid #1976d2'
                      }
                    }
                  }}
                />
              </Box>

              {/* Create Resource button */}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleCreateResource}
                  disabled={!isFormValid || createdVMs.length >= 5}
                  sx={{
                    px: 4,
                    py: 1.5,
                    fontWeight: 600,
                    textTransform: 'none',
                    borderRadius: 2,
                  }}
                >
                  {createdVMs.length >= 5 ? 'Maximum VMs Reached' : 'Create Resource'}
                </Button>
              </Box>
            </ParentCard>
          </div>
        </Fade>
      </div>

      {/* Created VMs Summary */}
      {createdVMs.length > 0 && (
        <ParentCard sx={{ mt: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" fontWeight={600}>
              Created Virtual Machines ({createdVMs.length}/5)
            </Typography>
            <Typography variant="h6" color="primary" fontWeight={700}>
              Total: R{totalPrice.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/month
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {createdVMs.map((vm) => {
              const migratedVM = migrateVMConfig(vm);

              if (!migratedVM) {
                return null;
              }

              const specs = migratedVM.configuration.specs;

              return (
                <Card key={migratedVM.id} sx={{ position: 'relative' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box>
                        <Typography variant="h6" fontWeight={600}>
                          {migratedVM.serverName || 'Unnamed VM'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {migratedVM.description || 'No description provided'}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                          <Typography variant="body2">
                            <strong>Region:</strong> {migratedVM.region || 'Not specified'}
                          </Typography>
                          <Typography variant="body2">
                            <strong>OS:</strong> {migratedVM.os || 'Not specified'}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Tier:</strong> {migratedVM.tier || 'Not specified'}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                          <Typography variant="body2">
                            <strong>vCPUs:</strong> {specs?.vcpus || 0}
                          </Typography>
                          <Typography variant="body2">
                            <strong>RAM:</strong> {specs?.memory || 0}GB
                          </Typography>
                          <Typography variant="body2">
                            <strong>Storage:</strong> {specs?.storage || 0}GB
                          </Typography>
                          <Typography variant="body2">
                            <strong>GHz:</strong> {specs?.ghz || 0}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="h6" color="primary" fontWeight={700}>
                          R{(migratedVM.price || 0).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/month
                        </Typography>
                        <IconButton
                          onClick={() => handleDeleteVM(migratedVM.id)}
                          color="error"
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        </ParentCard>
      )}

      {/* Additional Products Dialog */}
      <AdditionalProductsDialog
        open={additionalProductsDialogOpen}
        onClose={handleCloseAdditionalProducts}
        products={products}
        onProductsUpdate={handleAdditionalProductsUpdate}
        existingProducts={createdVMs}
      />
    </>
  );
} 