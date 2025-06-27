import { IProduct, ISimpleProduct } from "./IProducts";

interface IBackupServices {
    baas: ISimpleProduct[];
    draas: ISimpleProduct[];
}

interface IAdditionalServices {
    professional: string[];
    naas: string[];
    faas: string[];
    collocation: string[];
}

// New types for option structures
interface IProductOption {
    value: string;
    label: string;
    product: ISimpleProduct;
}

interface IBackupServicesSelected {
    baas: string[];
    draas: string[];
}

interface IAdditionalServicesSelected {
    professional: string[];
    naas: string[];
    faas: string[];
    collocation: string[];
}

interface ISelectedOptions {
    virtualMachine: IVMConfig[];
    backupServices: ISimpleProduct[];
    softwareLicensing: ISimpleProduct[];
    additionalServices: ISimpleProduct[];
}

interface VMTemplate {
    id: number;
    title: string;
    vcpus: number;
    memory: number;
    storage: number;
    ghz: number;
    description: string;
    group: string;
    osType: string;
    type: string;
}

interface IVirtualMachineState {
    activeStep: number;
    selectedOptions: ISelectedOptions;
    totalCost: number;
    products: ISimpleProduct[];
    vmTemplates: VMTemplate[];
    backupServicesSelected: IBackupServices;
    softwareLicensingSelected: string[];
    additionalServicesSelected: IAdditionalServices;
    quoteDialogOpen: boolean;

    setActiveStep: (step: number) => void;
    setSelectedOptions: (options: Partial<ISelectedOptions>) => void;
    setTotalCost: (cost: number) => void;
    setProducts: (products: ISimpleProduct[]) => void;
    setVmTemplates: (templates: VMTemplate[]) => void;
    setBackupServicesSelected: (data: IBackupServices) => void;
    setSoftwareLicensingSelected: (data: string[]) => void;
    setAdditionalServicesSelected: (data: IAdditionalServices) => void;
    setQuoteDialogOpen: (open: boolean) => void;
    resetQuote: () => void;
}

interface IVMConfig {
    id: string;
    region: string;
    os: string;
    serverName: string;
    description: string;
    tier: string;
    configuration: {
      type: 'template' | 'custom';
      specs: {
        vcpus: number;
        memory: number;
        storage: number;
        ghz: number;
      };
      templateId?: number | string;
    };
    price: number;
    type?: string;
  }
  
  interface ICustomSpecs {
    vcpus: number;
    memory: number;
    storage: number;
    ghz: number;
  }
  
  interface IVMOptionsState {
    region: string;
    os: string;
    tier: string;
    serverName: string;
    description: string;
    buildType: 'template' | 'custom';
    selectedTemplate: VMTemplate | null;
    selectedSize: string | null;
    customSpecs: ICustomSpecs;
    createdVMs: IVMConfig[];
  
    setRegion: (region: string) => void;
    setOs: (os: string) => void;
    setTier: (tier: string) => void;
    setServerName: (name: string) => void;
    setDescription: (desc: string) => void;
    setBuildType: (type: 'template' | 'custom') => void;
    setSelectedTemplate: (template: VMTemplate | null) => void;
    setSelectedSize: (size: string | null) => void;
    setCustomSpecs: (specs: ICustomSpecs) => void;
    setCreatedVMs: (vms: IVMConfig[]) => void;
  }

export type {
    IProduct, 
    IBackupServices, 
    IAdditionalServices, 
    ISelectedOptions, 
    IVirtualMachineState, 
    IVMConfig, 
    ICustomSpecs, 
    IVMOptionsState, 
    VMTemplate,
    IProductOption,
    IBackupServicesSelected,
    IAdditionalServicesSelected
};