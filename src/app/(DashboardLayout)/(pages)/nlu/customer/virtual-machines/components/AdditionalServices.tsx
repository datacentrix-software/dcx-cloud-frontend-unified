import { Box, Typography, Paper } from '@mui/material';
import { useState } from 'react';
import MultiSelect from '@/app/components/forms/theme-elements/MultiSelect';

interface AdditionalServicesProps {
  onSelect: (options: any[]) => void;
  products: any[];
  selected: {
    professional: string[];
    naas: string[];
    faas: string[];
    collocation: string[];
  };
  setSelected: (options: any) => void;
}

function toOptions(products: any[]) {
  return products.map((p) => ({
    value: String(p.id),
    label: `${p.title}${p.price ? ` (R${p.price})` : ''}`,
    product: p,
  }));
}

export default function AdditionalServices({ onSelect, products, selected, setSelected }: AdditionalServicesProps) {
  // Filter products for each input
  const professionalServices = products.filter(
    (p) => p.SubCategory?.name === 'Cloud Services - Professional Services'
  );
  const naasServices = products.filter(
    (p) => p.SubCategory?.name === 'Cloud Services -  Network as a Service (NaaS)'
  );
  const faasServices = products.filter(
    (p) => p.SubCategory?.name === 'Cloud Services -  Firewall as a Service (FaaS)'
  );
  const collocationServices = products.filter(
    (p) => p.SubCategory?.name === 'Cloud Services -  Collocation'
  );

  // Helper to get selected product objects by ID
  const getSelectedProducts = (ids: string[], options: any[]) => {
    const idSet = new Set(ids);
    return options.filter((opt) => idSet.has(String(opt.value))).map((opt) => opt.product);
  };

  // Helper to notify parent with all selected product objects
  const notifyParent = (next: any) => {
    const pro = next.professional ?? selected.professional;
    const naas = next.naas ?? selected.naas;
    const faas = next.faas ?? selected.faas;
    const coll = next.collocation ?? selected.collocation;
    const all = [
      ...getSelectedProducts(pro, toOptions(professionalServices)),
      ...getSelectedProducts(naas, toOptions(naasServices)),
      ...getSelectedProducts(faas, toOptions(faasServices)),
      ...getSelectedProducts(coll, toOptions(collocationServices)),
    ];
    onSelect(all);
  };

  return (
    <Box mb={"95px"}>
      {/* Professional Services */}
      <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, mb: 4 }}>
        <Typography variant="h6" fontWeight={700} mb={1}>
          Professional Services
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={2}>
          Hands-on cloud setup, migrations, or support tasks billed hourly.
        </Typography>
        <MultiSelect
          label="Professional Services"
          options={toOptions(professionalServices)}
          value={selected.professional}
          onChange={(value) => {
            setSelected({ ...selected, professional: value });
            notifyParent({ professional: value });
          }}
          placeholder="Select consulting or support offerings"
        />
      </Paper>

      {/* NaaS */}
      <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, mb: 4 }}>
        <Typography variant="h6" fontWeight={700} mb={1}>
          Network as a Service (NaaS)
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={2}>
          On-demand network connectivity between VMs or sites. Choose bandwidth tier.
        </Typography>
        <MultiSelect
          label="Network as a Service (NaaS)"
          options={toOptions(naasServices)}
          value={selected.naas}
          onChange={(value) => {
            setSelected({ ...selected, naas: value });
            notifyParent({ naas: value });
          }}
          placeholder="Select a service..."
        />
      </Paper>

      {/* FaaS */}
      <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, mb: 4 }}>
        <Typography variant="h6" fontWeight={700} mb={1}>
          Firewall as a Service (FaaS)
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={2}>
          Managed perimeter security with logging, policy control, and threat response.
        </Typography>
        <MultiSelect
          label="Firewall as a Service (FaaS)"
          options={toOptions(faasServices)}
          value={selected.faas}
          onChange={(value) => {
            setSelected({ ...selected, faas: value });
            notifyParent({ faas: value });
          }}
          placeholder="Select tier"
        />
      </Paper>

      {/* Collocation */}
      <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h6" fontWeight={700} mb={1}>
          Collocation
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={2}>
          Place your physical servers in our secure data centre environment.
        </Typography>
        <MultiSelect
          label="Collocation"
          options={toOptions(collocationServices)}
          value={selected.collocation}
          onChange={(value) => {
            setSelected({ ...selected, collocation: value });
            notifyParent({ collocation: value });
          }}
          placeholder="Select a service..."
        />
      </Paper>
    </Box>
  );
} 