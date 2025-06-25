import { Box, Typography, Paper } from '@mui/material';
import MultiSelect from '@/app/components/forms/theme-elements/MultiSelect';
import { useMemo } from 'react';

interface SoftwareLicensingProps {
  onSelect: (options: any[]) => void;
  products: any[];
  selected: any[];
  setSelected: (options: any[]) => void;
}

function toOptions(products: any[]) {
  return products.map((p) => ({
    value: String(p.id),
    label: `${p.title}${p.price ? ` (R${p.price})` : ''}`,
    product: p,
  }));
}

export default function SoftwareLicensing({
  onSelect,
  products,
  selected,
  setSelected,
}: SoftwareLicensingProps) {
  const m365Products = useMemo(
    () => products.filter((p) => p.SubCategory?.name === 'Cloud Services -  Microsoft Licences'),
    [products]
  );
console.log("Products", {products})
  const options = useMemo(() => toOptions(m365Products), [m365Products]);

  const selectedIds = useMemo(() => selected.map((s) => String(s.id)), [selected]);

  return (
    <Box mb="95px">
      <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h6" fontWeight={700} mb={1}>
          Microsoft 365 Licensing (M365)
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={2}>
          Includes Office apps, Teams, email & cloud storage per user
        </Typography>
        <MultiSelect
          label="Microsoft 365 Licensing (M365)"
          options={options}
          value={selectedIds}
          onChange={(value) => {
            const selectedProducts = options
              .filter((opt) => value.includes(opt.value))
              .map((opt) => opt.product);

            setSelected(selectedProducts);
            onSelect(selectedProducts);
          }}
          placeholder="Select M365 Plan..."
        />
      </Paper>
    </Box>
  );
}
