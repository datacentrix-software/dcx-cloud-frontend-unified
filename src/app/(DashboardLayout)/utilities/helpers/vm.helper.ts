export interface InputVM {
    id: string | string;
    region: string;
    os: string;
    serverName: string;
    description: string;
    tier: string;
    configuration: {
        type: string;
        specs: {
            vcpus: number;
            memory: number;
            storage: number;
            ghz: string;
        };
        templateId: number | string
    };
    price: number;
};

interface OutputVM {
    vmName: string;
    vmCpu: number;
    vmStorage: number;
    vmMemory: number;
    region: string;
    storageType: string;
    osType: 'Windows' | 'Linux';
    templateName: string;
};

function transformVMs(input: InputVM[], vmTemplates: any): OutputVM[] {
    return input.map(vm => ({
        vmName: vm.serverName,
        vmCpu: vm.configuration.specs.vcpus,
        vmStorage: vm.configuration.specs.storage,
        vmMemory: vm.configuration.specs.memory,
        region: vm.region,
        storageType: vm.tier,
        osType: vm.os.toLowerCase() === 'windows' ? 'Windows' : 'Linux',
        templateName: vmTemplates.find((template: InputVM) => template.id === vm.configuration.templateId)?.description || ''
    }));
}

export {
    transformVMs
}