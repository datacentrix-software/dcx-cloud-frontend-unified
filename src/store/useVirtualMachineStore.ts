import { ICustomSpecs, IVirtualMachineState, IVMOptionsState } from '@/types/IVirtualMachines';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';



const useVirtualMachineStore = create<IVirtualMachineState>()(
  devtools(
    (set) => ({
      activeStep: 0,
      selectedOptions: {
        virtualMachine: [],
        backupServices: [],
        softwareLicensing: [],
        additionalServices: [],
      },
      totalCost: 0,
      products: [],
      vmTemplates: [],
      backupServicesSelected: { baas: [], draas: [] },
      softwareLicensingSelected: [],
      additionalServicesSelected: {
        professional: [],
        naas: [],
        faas: [],
        collocation: [],
      },
      quoteDialogOpen: false,

      setActiveStep: (step) => set({ activeStep: step }),
      setSelectedOptions: (options) =>
        set((state) => ({
          selectedOptions: { ...state.selectedOptions, ...options },
        })),
      setTotalCost: (cost) => set({ totalCost: cost }),
      setProducts: (products) => set({ products }),
      setVmTemplates: (templates) => set({ vmTemplates: templates }),
      setBackupServicesSelected: (data) => set({ backupServicesSelected: data }),
      setSoftwareLicensingSelected: (data) => set({ softwareLicensingSelected: data }),
      setAdditionalServicesSelected: (data) => set({ additionalServicesSelected: data }),
      setQuoteDialogOpen: (open) => set({ quoteDialogOpen: open }),
      resetQuote: () =>
        set({
          selectedOptions: {
            virtualMachine: [],
            backupServices: [],
            softwareLicensing: [],
            additionalServices: [],
          },
          backupServicesSelected: { baas: [], draas: [] },
          softwareLicensingSelected: [],
          additionalServicesSelected: {
            professional: [],
            naas: [],
            faas: [],
            collocation: [],
          },
          totalCost: 0,
        }),
    }),
    { name: 'VirtualMachineStore' }
  )
);

export default useVirtualMachineStore;



// =================== VM CONFIGURATION STATE ===================



const defaultSpecs: ICustomSpecs = { vcpus: 2, memory: 8, storage: 50, ghz: 2 };

export const useVirtualMachineOptions = create<IVMOptionsState>()(
  devtools((set) => ({
    region: 'JHB3',
    os: 'Linux',
    tier: 'Standard SSD',
    serverName: '',
    description: '',
    buildType: 'template',
    selectedTemplate: null,
    selectedSize: null,
    customSpecs: defaultSpecs,
    createdVMs: [],

    setRegion: (region) => set({ region }),
    setOs: (os) => set({ os }),
    setTier: (tier) => set({ tier }),
    setServerName: (serverName) => set({ serverName }),
    setDescription: (description) => set({ description }),
    setBuildType: (buildType) => set({ buildType }),
    setSelectedTemplate: (selectedTemplate) => set({ selectedTemplate }),
    setSelectedSize: (selectedSize) => set({ selectedSize }),
    setCustomSpecs: (customSpecs) => set({ customSpecs }),
    setCreatedVMs: (createdVMs) => set({ createdVMs }),
  }))
);
