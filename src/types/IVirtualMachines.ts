type IProduct = any;

interface IBackupServices {
    baas: IProduct[];
    draas: IProduct[];
}

interface IAdditionalServices {
    professional: string[];
    naas: string[];
    faas: string[];
    collocation: string[];
}

interface ISelectedOptions {
    virtualMachine: IProduct[];
    backupServices: IProduct[];
    softwareLicensing: IProduct[];
    additionalServices: IProduct[];
}

interface IVirtualMachineState {
    activeStep: number;
    selectedOptions: ISelectedOptions;
    totalCost: number;
    products: IProduct[];
    vmTemplates: IProduct[];
    backupServicesSelected: IBackupServices;
    softwareLicensingSelected: string[];
    additionalServicesSelected: IAdditionalServices;
    quoteDialogOpen: boolean;

    setActiveStep: (step: number) => void;
    setSelectedOptions: (options: Partial<ISelectedOptions>) => void;
    setTotalCost: (cost: number) => void;
    setProducts: (products: IProduct[]) => void;
    setVmTemplates: (templates: IProduct[]) => void;
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
    selectedTemplate: any;
    selectedSize: string | null;
    customSpecs: ICustomSpecs;
    createdVMs: IVMConfig[];
  
    setRegion: (region: string) => void;
    setOs: (os: string) => void;
    setTier: (tier: string) => void;
    setServerName: (name: string) => void;
    setDescription: (desc: string) => void;
    setBuildType: (type: 'template' | 'custom') => void;
    setSelectedTemplate: (template: any) => void;
    setSelectedSize: (size: string | null) => void;
    setCustomSpecs: (specs: ICustomSpecs) => void;
    setCreatedVMs: (vms: IVMConfig[]) => void;
  }

export type {
    IProduct, IBackupServices, IAdditionalServices, ISelectedOptions, IVirtualMachineState, IVMConfig, ICustomSpecs, IVMOptionsState
};