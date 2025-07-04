/**
 * Organization Selector Component
 * 
 * TDD Implementation - GREEN phase
 * Shows organizations based on user access level
 */

import React, { useState } from 'react';

interface OrganizationSelectorProps {
  userId: string;
  onOrganizationChange: (orgId: string) => void;
}

// Mock organizations data
const mockOrganizations = [
  { id: 'datacentrix-001', name: 'Datacentrix Internal' },
  { id: 'cloudtech-001', name: 'CloudTech Resellers' },
  { id: 'startup-001', name: 'StartupCorp' },
  { id: 'retail-001', name: 'RetailChain SA' },
  { id: 'manufacturing-001', name: 'ManufacturingCo' },
  { id: 'netsolutions-001', name: 'NetSolutions Partners' }
];

// Mock user access mapping
const userAccess: { [userId: string]: string[] } = {
  'john-001': ['datacentrix-001', 'cloudtech-001', 'startup-001', 'retail-001', 'manufacturing-001', 'netsolutions-001'], // All orgs
  'alex-001': ['cloudtech-001', 'startup-001', 'retail-001'], // CloudTech + customers
  'tom-001': ['startup-001'] // Only StartupCorp
};

const OrganizationSelector: React.FC<OrganizationSelectorProps> = ({ 
  userId, 
  onOrganizationChange 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<string>('');

  const accessibleOrgIds = userAccess[userId] || [];
  const accessibleOrgs = mockOrganizations.filter(org => 
    accessibleOrgIds.includes(org.id)
  );

  const handleSelect = (orgId: string, orgName: string) => {
    setSelectedOrg(orgName);
    setIsOpen(false);
    onOrganizationChange(orgId);
  };

  return (
    <div>
      <select 
        role="combobox"
        value={selectedOrg}
        onChange={(e) => {
          const selected = accessibleOrgs.find(org => org.name === e.target.value);
          if (selected) {
            handleSelect(selected.id, selected.name);
          }
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <option value="">Select Organization</option>
        {accessibleOrgs.map(org => (
          <option key={org.id} value={org.name}>
            {org.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default OrganizationSelector;