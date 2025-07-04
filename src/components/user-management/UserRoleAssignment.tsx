/**
 * User Role Assignment Component
 * 
 * TDD Implementation - GREEN phase
 * Manages adding/removing user roles with proper validation
 */

import React, { useState } from 'react';

interface UserRoleAssignmentProps {
  userId: string;
  organizationId: string;
}

// Mock current user roles
const mockUserRoles: { [userId: string]: string[] } = {
  'jane-001': ['Engineer'],
  'tom-001': ['Organization Admin']
};

const availableRoles = [
  'Organization Admin',
  'Engineer',
  'Read Only User'
];

const UserRoleAssignment: React.FC<UserRoleAssignmentProps> = ({ 
  userId, 
  organizationId 
}) => {
  const [currentRoles, setCurrentRoles] = useState<string[]>(
    mockUserRoles[userId] || []
  );
  const [showAddRole, setShowAddRole] = useState(false);
  const [selectedNewRole, setSelectedNewRole] = useState('');
  const [message, setMessage] = useState('');
  const [showConfirmRemove, setShowConfirmRemove] = useState<string | null>(null);

  const handleAddRole = () => {
    if (selectedNewRole && !currentRoles.includes(selectedNewRole)) {
      setCurrentRoles(prev => [...prev, selectedNewRole]);
      setSelectedNewRole('');
      setShowAddRole(false);
      setMessage('Role assigned successfully');
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleRemoveRole = (roleToRemove: string) => {
    // Check if this is the last admin role
    const isLastAdmin = 
      roleToRemove === 'Organization Admin' && 
      currentRoles.filter(role => role === 'Organization Admin').length === 1 &&
      !currentRoles.some(role => role === 'Root');

    if (isLastAdmin) {
      setMessage('Cannot remove the last admin role from this organization');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    setCurrentRoles(prev => prev.filter(role => role !== roleToRemove));
    setShowConfirmRemove(null);
    setMessage('Role removed successfully');
    
    // Clear message after 3 seconds
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div>
      <h3>Current Roles</h3>
      
      {currentRoles.map(role => (
        <div key={role}>
          <span>{role}</span>
          <button 
            role="button"
            aria-label={`Remove ${role} role`}
            onClick={() => setShowConfirmRemove(role)}
          >
            Remove
          </button>
        </div>
      ))}

      {!showAddRole && (
        <button 
          role="button"
          aria-label="Add Role"
          onClick={() => setShowAddRole(true)}
        >
          Add Role
        </button>
      )}

      {showAddRole && (
        <div>
          <label htmlFor="roleSelect">Select Role</label>
          <select
            id="roleSelect"
            value={selectedNewRole}
            onChange={(e) => setSelectedNewRole(e.target.value)}
          >
            <option value="">Choose a role</option>
            {availableRoles
              .filter(role => !currentRoles.includes(role))
              .map(role => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))
            }
          </select>
          
          <button 
            role="button"
            aria-label="Assign Role"
            onClick={handleAddRole}
            disabled={!selectedNewRole}
          >
            Assign Role
          </button>
          
          <button onClick={() => setShowAddRole(false)}>
            Cancel
          </button>
        </div>
      )}

      {showConfirmRemove && (
        <div>
          <p>Are you sure you want to remove this role?</p>
          <button 
            role="button"
            aria-label="Confirm"
            onClick={() => handleRemoveRole(showConfirmRemove)}
          >
            Confirm
          </button>
          <button onClick={() => setShowConfirmRemove(null)}>
            Cancel
          </button>
        </div>
      )}

      {message && <div>{message}</div>}
    </div>
  );
};

export default UserRoleAssignment;