/**
 * User Management Dashboard Component
 * 
 * TDD Implementation - GREEN phase
 * Shows different interfaces based on user type and permissions
 */

import React from 'react';
import { useAuthStore } from '@/store';

interface UserManagementProps {
  organizationId: string;
  userType: 'internal' | 'reseller' | 'customer';
}

const UserManagementDashboard: React.FC<UserManagementProps> = ({ 
  organizationId, 
  userType 
}) => {
  const authData = useAuthStore();
  const { user, roles, orgIds } = authData;

  // Debug logging for TDD development
  console.log('DEBUG - UserManagementDashboard:', { organizationId, userType, user, roles, orgIds, authData });

  // Normalize roles to array for consistent checking
  const roleArray = Array.isArray(roles) ? roles : (roles ? [roles] : []);
  const orgIdArray = Array.isArray(orgIds) ? orgIds : [];

  // Check organization access
  const hasOrgAccess = orgIdArray.includes('all') || orgIdArray.includes(organizationId);
  
  if (!hasOrgAccess) {
    return (
      <div>
        <h2>Access Denied</h2>
        <p>You do not have permission to access this organization</p>
      </div>
    );
  }

  // Check user permissions
  const isReadOnly = roleArray.includes('Read Only User');
  
  if (isReadOnly) {
    return (
      <div>
        <h2>View Only Mode</h2>
        <p>You have read-only access to this organization</p>
      </div>
    );
  }

  // Render based on user type
  if (userType === 'internal') {
    return (
      <div>
        <h1>All Organizations</h1>
        <h2>Global User Management</h2>
        <h3>System Administration</h3>
        <p>Internal god mode interface</p>
      </div>
    );
  }

  if (userType === 'reseller' && roleArray.includes('Reseller Admin')) {
    return (
      <div>
        <h1>Customer Organizations</h1>
        <button>Onboard New Customer</button>
        <h2>Reseller Dashboard</h2>
        <p>Reseller management interface</p>
      </div>
    );
  }

  if (userType === 'customer') {
    const isOrgAdmin = roleArray.includes('Organization Admin');
    
    return (
      <div>
        <h1>Organization Users</h1>
        <button>Invite Team Members</button>
        <p>Customer organization interface</p>
      </div>
    );
  }

  return <div>UserManagementDashboard not implemented</div>;
};

export default UserManagementDashboard;