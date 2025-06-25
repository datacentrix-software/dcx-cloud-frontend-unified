export interface QuoteStore {
    selectedBusinessUnitId: number;
    selectedBusinessUnitName: string;
    subCategories: Array<{ id: number; name: string }>;
    selectedServices: Record<string, any>;
    vms: Array<{ id: string;[key: string]: any }>;
    connectServices: any[];
    discussions: any[];
    editingProductTitle: string;
    groupedServices: Service[];
    virtualMachines: Service[];
    isDialogOpen: boolean;
    services: any[];
    connectivityCosts: {
        "dfa-megellan": any[];
        "dfa-helios": any[];
        "liquid-costs": any[];
        "mfn": any[];
        "bandwidth-costs": any[];
        "liquid-cpe": any[];
        "cloud-services": any[];
    };
    quoteFields: QuoteFields;
    showTip: boolean;
    setShowTip: (value: boolean) => void;

    hasPayment: boolean;
    editingVm: VM;
    isEditing: boolean;
    isIpChecked: boolean;
    businessUnitsList: any[];
    errors: Record<string, any>;
    editingCustomerViewVm: Record<string, any>;
    setEditingCustomerViewVm: (field: string, value: any) => void;
    selectedCustomerViewProducts: Record<string, string>;
    vmOptionConfig: any[];
    loading: boolean;
    error: string | null;
    vmsCustomerView: any[];
    addVmCustomerView: (vm: any) => void;
    removeVmCustomerView: (vmName: string) => void;
    clearVmsCustomerView: () => void;

    fetchVmOptionConfig: () => Promise<void>;
    setSelectedCustomerViewProduct: (subCatName: string, value: string) => void;

    addSelectedService: (service: string) => void;
    handleFetchDataSubcategories: () => void;
    handleFetchBusinessUnits: () => void;
    handleInputChange: (field: string, value: any, regex: RegExp, errorMsg: string) => void;
    setEditingVm: (updated: Partial<VM>) => void;
    resetEditingVm: () => void;
    setQuoteFields: (updated: Partial<QuoteFields>) => void;
    handleProductClick: (vm?: any) => void;
    handleFetchProducts: () => void;
    handleEditProductTitle: (title: string) => void;
    handleSaveEdit: () => void;
    removeSelectedService: (subcategory: any, serviceId: any) => void;
    updateSelectedServices: (id: string, subcategory: string, updatedFields: any) => void;
    formatCurrency: (value: number) => string;
    getConnectivityCosts: () => void;
    //  setConnectServices: (newConnect: any,) => void;
    setConnectServices: (newConnect: any) => void;
    setSelectedServices: (newSelectedServices: Record<string, any>) => void;
    setVms: (newVms: Array<{ id: string;[key: string]: any }>) => void;
    setDiscussions: (newDiscussions: any) => void;

    setField: (
        field: keyof Omit<
            QuoteStore,
            | "setField"
            | "updateSelectedServices"
            | "addVM"
            | "removeVM"
            | "addConnectService"
            | "removeConnectService"
            | "addDiscussion"
            | "removeDiscussion"
            | "setEditingVm"
            | "resetEditingVm"
        >,
        value: any
    ) => void;



    addVM: (vm: { id: string;[key: string]: any }) => void;
    removeVM: (vm: any) => void;

    addConnectServiceState: (newConnect: any) => void;
    removeConnectService: (connId: string) => void;

    addDiscussion: (discussion: any, authUser: any) => void;
    removeDiscussion: (index: number) => void;
}

export interface VM {
    vmName: string;
    vmDescription: string;
    cpu: number;
    memory: number;
    storageType: string;
    region: string;
    osType: string;
    vmStorage: number;
    existingIpAddress: string;
    vmsalesNotes: string;
    vmAdminNotes: string;
    selectedOption: string;
}

export interface Service {
    code: string;
    item: string;
    quantity: number;
    price: number;
    description: string;
}

export interface QuoteFields {
    client: string;
    clientEmail: string;
    att: string;
    description: string;
    accountManager: string;
    quoteTerm: number;
    quoteNumber: string;
    selectedTender: string;
    quoteStatus: string;
    date: string;
    rebateEnabled: boolean;
    rebate: number;

}