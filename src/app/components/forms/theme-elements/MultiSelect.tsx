// src/app/components/forms/theme-elements/MultiSelect.tsx
'use client'
import React from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import Chip from '@mui/material/Chip';
import CustomTextField from './CustomTextField';

interface Option {
  value: string;
  label: string;
}

interface MultiSelectProps {
  label?: string;
  options: Option[];
  value: string[];
  onChange: (newValue: string[]) => void;
  placeholder?: string;
  error?: boolean;
  helperText?: string;
}

const MultiSelect: React.FC<MultiSelectProps> = ({
  options,
  value,
  onChange,
  label,
  placeholder,
  error,
  helperText
}) => {
  const selectedOptions = options.filter(option => value.includes(option.value));

  return (
    <Autocomplete
      multiple
      options={options}
      value={selectedOptions}
      onChange={(_, newValue: Option[]) => {
        onChange(newValue.map(option => option.value));
      }}
      getOptionLabel={(option) => option.label}
      renderTags={(tagValue, getTagProps) =>
        tagValue.map((option, index) => (
          <Chip
            label={option.label}
            {...getTagProps({ index })}
            key={option.value}
          />
        ))
      }
      renderInput={(params) => (
        <CustomTextField
          {...params}
          label={label}
          placeholder={placeholder}
          error={error}
          helperText={helperText}
        />
      )}
      sx={{
        '& .MuiAutocomplete-inputRoot': {
          flexWrap: 'wrap',
          alignItems: 'flex-start',
          minHeight: '60px',
          height: 'auto',
          paddingTop: '10px',
          paddingBottom: '10px',
        },
        '& .MuiChip-root': {
          margin: '2px',
        },
      }}
    />
  );
};

export default MultiSelect;