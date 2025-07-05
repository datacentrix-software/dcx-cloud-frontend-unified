// store/useQuoteStore.ts
import { create } from "zustand";
import { QuoteStore, VM, QuoteFields } from "@/types";
import axiosServices from "@/utils/axios";

const defaultEditingVm: VM = {
  vmName: "",
  vmDescription: "",
  cpu: 1,
  memory: 1,
  storageType: "Standard SSD",
  region: "",
  osType: "",
  vmStorage: 10,
  existingIpAddress: "",
  vmsalesNotes: "",
  vmAdminNotes: "",
  selectedOption: "",
};

const defaultQuoteFields: QuoteFields = {
  client: "",
  clientEmail: "",
  att: "",
  description: "",
  accountManager: "",
  quoteTerm: 1,
  quoteNumber: "",
  selectedTender: "",
  quoteStatus: "",
  date: "",
  rebateEnabled: false,
  rebate: 0,
};

export const useQuoteStore = create<QuoteStore>((set, get) => ({
  hasPayment: true,
  selectedBusinessUnitId: 1,
  selectedBusinessUnitName: "Cloud Services",
  selectedServices: {},
  isDialogOpen: false,
  vms: [],
  connectServices: [],
  discussions: [],
  editingProductTitle: "",
  groupedServices: [],
  services: [],
  virtualMachines: [],
  businessUnitsList: [],
  subCategories: [],

  connectivityCosts: {
    "dfa-megellan": [],
    "dfa-helios": [],
    "liquid-costs": [],
    "mfn": [],
    "bandwidth-costs": [],
    "liquid-cpe": [],
    "cloud-services": [],
  },

  editingVm: { ...defaultEditingVm },
  quoteFields: { ...defaultQuoteFields },
  isEditing: false,
  isIpChecked: false,
  errors: {},



  handleEditProductTitle: (title) => set({ editingProductTitle: title }),
  handleSaveEdit: () => set({ editingProductTitle: "" }),

  setEditingVm: (updated: Partial<VM>) =>
    set((state) => ({
      editingVm: {
        ...state.editingVm,
        ...updated,
      },
    })),

  addSelectedService: (service: any) =>
    set((state: any) => {
      const subCategoryName = service.SubCategory.name;
      const existingServices = state.selectedServices[subCategoryName] || [];


      if (existingServices.some((s: any) => s.id === service.id)) {
        return state;
      }

      return {
        selectedServices: {
          ...state.selectedServices,
          [subCategoryName]: [...existingServices, service],
        },
      };
    }),

  updateSelectedServices: (id: any, subcategory: any, updatedFields: Partial<any>) =>
    set((state) => {
      const servicesInSubcategory = state.selectedServices[subcategory] || [];

      const updatedSubcategoryServices = servicesInSubcategory.map((service: any) => {
        if (service.id === id) {
          return {
            ...service,
            ...updatedFields,
          };
        }
        return service;
      });

      return {
        selectedServices: {
          ...state.selectedServices,
          [subcategory]: updatedSubcategoryServices,
        },
      };
    }),

  setSelectedServices: (products: any) => {
    const prev = get().selectedServices;

    const updatedServices = products.reduce((acc: any, product: any) => {
      const subcategoryName = product.SubCategory.name;
      acc[subcategoryName] = [...(acc[subcategoryName] || prev[subcategoryName] || []), product];
      return acc;
    }, {});

    set({ selectedServices: updatedServices });
  },


  removeSelectedService: (subcategory: any, serviceId: any) =>
    set((state) => ({
      selectedServices: {
        ...state.selectedServices,
        [subcategory]: state.selectedServices[subcategory].filter((service: any) => service.id !== serviceId),
      }
    })),


  setQuoteFields: (updated: Partial<QuoteFields>) =>
    set((state) => ({
      quoteFields: {
        ...state.quoteFields,
        ...updated,
      },
    })),

  setField: (field, value) => set({ [field]: value }),

  resetEditingVm: () =>
    set(() => ({
      editingVm: { ...defaultEditingVm },
      isIpChecked: false,
      isEditing: false,
    })),


  handleProductClick: (vm = null) =>
    set((state) => {
      if (vm) {
        return {
          editingVm: { ...vm },
          isEditing: true,
          isIpChecked: vm.existingIpAddress !== "",
          isDialogOpen: true,
        };
      } else {
        return {
          editingVm: { ...defaultEditingVm },
          isEditing: false,
          isIpChecked: false,
          isDialogOpen: true,
        };
      }
    }),



  addVM: (vm) => set((state) => ({ vms: [...state.vms, vm] })),

  setVms: (newVMs: any) => {
    const prevVms = get().vms;

    const combinedVms = [...prevVms, ...newVMs];
    const uniqueVms = Array.from(
      new Map(combinedVms.map((vm) => [vm.vmName, vm])).values()
    );

    set({ vms: uniqueVms });
  },

  removeVM: (vm) =>
    set((state) => ({ vms: state.vms.filter((vmState) => vmState.id !== vm.id) })),

  setConnectServices: (newConnect: any) => {
    set((state) => ({
      connectServices: state.connectServices.map((service) =>
        service.connectService === newConnect.connectService ? newConnect : service
      ),
    }));
  },

  addConnectServiceState: (newConnect) =>
    set((state) => ({
      connectServices: [...state.connectServices, newConnect],
    })),

  removeConnectService: (connId) =>
    set((state) => ({
      connectServices: state.connectServices.filter((c) => c.id !== connId),
    })),


  handleInputChange: (
    field: string,
    value: string,
    regex: RegExp,
    errorMsg: string
  ) => {
    set((state) => ({
      errors: {
        ...state.errors,
        [field]: regex.test(value) ? "" : errorMsg,
      },
    }));
  },
  handleFetchProducts: async () => {
    try {
      const response = await axiosServices.get(
        `/api/products/getproducts`
      );
      const products = response.data;
      set({ services: products });
      return products;
    } catch (error) {

    }
  },

  handleFetchBusinessUnits: async () => {
    try {
      const response = await axiosServices.get(
        `/api/categories/getall`
      );
      set({ businessUnitsList: response.data });
      // return response.data;
    } catch (error) { }
  },
  handleFetchDataSubcategories: async () => {
    try {
      const response = await axiosServices.get(
        `/api/subcategories/getall`
      );
      set({ subCategories: response.data });
    } catch (error) { }
  },
  formatCurrency: (value: number) =>
    `R${value.toLocaleString("en-ZA", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`,

  addDiscussion: (newDiscussion, authUser) =>
    set((state) => ({
      discussions: [
        ...state.discussions,
        {
          ...newDiscussion,
          person: authUser?.firstName + ' ' + authUser?.lastName || 'Unknown User',
          dateTime: new Date().toLocaleDateString('en-US'),
        },
      ],
    })),

  setDiscussions: (responseData: any) => {
    const formatted = (responseData?.data?.discussions || []).map((d: { createdAt: string; content: string; name: string }) => ({
      dateTime: d.createdAt,
      words: d.content,
      person: d.name,
    }));
    set({ discussions: formatted });
  },
  removeDiscussion: (index) =>
    set((state) => ({
      discussions: state.discussions.filter((_, i) => i !== index),
    })),
  getConnectivityCosts: async () => {
    const endpoints = [
      "dfa-megellan",
      "dfa-helios",
      "liquid-costs",
      "mfn",
      "bandwidth-costs",
      "liquid-cpe",
      "cloud-services",
    ];

    try {
      const responses = await Promise.all(
        endpoints.map((endpoint) =>
          axiosServices
            .get(`/api/connectivity/${endpoint}/getall`)
            .then((res) => ({ key: endpoint, data: res.data }))
        )
      );

      const costsData = responses.reduce((acc: any, { key, data }) => {
        acc[key] = data;
        return acc;
      }, {});

      set({ connectivityCosts: costsData });
    } catch (error) {
      
    }
  },
  selectedCustomerViewProducts: {},
  setSelectedCustomerViewProduct: (selected: any, subCat: string) => {
    set((state) => ({
      selectedCustomerViewProducts: {
        ...state.selectedCustomerViewProducts,
        [subCat]: selected,
      },
    }));
  },

  editingCustomerViewVm: {},
  setEditingCustomerViewVm: (field, value) =>
    set((state) => ({
      editingCustomerViewVm: {
        ...state.editingCustomerViewVm,
        [field]: value,
      },
    })),
  showTip: true,
  setShowTip: (value: any) => set({ showTip: value }),
  vmOptionConfig: [],
  loading: false,
  error: null,

  fetchVmOptionConfig: async () => {
    set({ loading: true, error: null });
    try {
      const res = await axiosServices.get(
        `/api/terraform/getterraformconfig`
      );
      set({ vmOptionConfig: res.data, loading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch VM config', loading: false });
    }
  },
  vmsCustomerView: [],
  addVmCustomerView: (vm: any) => set((state) => ({ vmsCustomerView: [...state.vmsCustomerView, vm] })),
  removeVmCustomerView: (vmName: any) =>
    set((state) => ({ vmsCustomerView: state.vmsCustomerView.filter((vm) => vm.vmName !== vmName) })),
  clearVmsCustomerView: () => set({ vmsCustomerView: [] }),
}));

