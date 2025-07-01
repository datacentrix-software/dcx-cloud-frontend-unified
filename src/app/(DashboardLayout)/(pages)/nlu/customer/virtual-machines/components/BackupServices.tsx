import { Box, Typography, Paper } from '@mui/material';
import MultiSelect from '@/app/components/forms/theme-elements/MultiSelect';
import { ISimpleProduct } from '@/types';

interface BackupServicesProps {
  onSelect: (options: ISimpleProduct[]) => void;
  products: ISimpleProduct[];
  selected: { baas: string[]; draas: string[] };
  setSelected: (options: { baas: string[]; draas: string[] }) => void;
}

function toOptions(products: ISimpleProduct[]) {
  return products.map((p) => ({
    value: String(p.id),
    label: `${p.title}${p.price ? ` (R${p.price})` : ''}`,
    product: p,
  }));
}

export default function BackupServices({ onSelect, products, selected, setSelected }: BackupServicesProps) {
  // Filter products for each input
  const baasProducts = products.filter(
    (p) => p.Category?.name === 'Cloud Services - Backup as a Service (BaaS)' ||
           p.Category?.name === 'Cloud Services -  Backup as a Service (BaaS)'
  );
  const draasProducts = products.filter(
    (p) => p.Category?.name === 'Cloud Services - Disaster Recovery as a Service (DraaS)' ||
           p.Category?.name === 'Cloud Services -  Disaster Recovery as a Service (DraaS)'
  );

  // Helper to get selected product objects by ID
  const getSelectedProducts = (ids: string[], options: ReturnType<typeof toOptions>) => {
    const idSet = new Set(ids);
    return options.filter((opt) => idSet.has(String(opt.value))).map((opt) => opt.product);
  };

  // Helper to notify parent with all selected product objects
  const notifyParent = (next: Partial<{ baas: string[]; draas: string[] }>) => {
    const baas = next.baas ?? selected.baas;
    const draas = next.draas ?? selected.draas;
    const all = [
      ...getSelectedProducts(baas || [], toOptions(baasProducts)),
      ...getSelectedProducts(draas || [], toOptions(draasProducts)),
    ];
    onSelect(all);
  };

  return (
    <Box mb={"95px"}>
      <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, mb: 4 }}>
        <Typography variant="h6" fontWeight={700} mb={1}>
          Backup as a Service (BaaS)
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={2}>
          Automatically back up your VM data daily to our secure cloud vault. Choose a backup tier based on retention period and redundancy.
        </Typography>
        <MultiSelect
          label="Backup as a Service (BaaS)"
          options={toOptions(baasProducts)}
          value={selected.baas || []}
          onChange={(value) => {
            setSelected({ ...selected, baas: value });
            notifyParent({ baas: value });
          }}
          placeholder="Select Backup Service..."
        />
      </Paper>
      <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h6" fontWeight={700} mb={1}>
          Disaster Recovery as a Service (DraaS)
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={2}>
          Enable rapid recovery by replicating your VM to a second site. Choose a replication frequency and failover strategy.
        </Typography>
        <MultiSelect
          label="Disaster Recovery as a Service (DraaS)"
          options={toOptions(draasProducts)}
          value={selected.draas || []}
          onChange={(value) => {
            setSelected({ ...selected, draas: value });
            notifyParent({ draas: value });
          }}
          placeholder="Choose Recovery policy..."
        />
      </Paper>
    </Box>
  );
} 