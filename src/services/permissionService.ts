/**
 * Permission Service
 * 
 * Implements TDD-driven role-based permission system.
 * Supports:
 * - Role-based permissions (Root, Engineer, Org Admin, Reseller Admin, Read Only)
 * - Organization-scoped permissions
 * - Multi-role users with combined permissions
 */

// Types
interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
}

interface Role {
  id: string;
  name: string;
  permissions: Permission[];
}

interface UserPermissions {
  canCreateVM: boolean;
  canDeleteVM: boolean;
  canViewBilling: boolean;
  canManageUsers: boolean;
  canViewReports: boolean;
  canManageOrganization: boolean;
  canAccessGlobalData: boolean;
}

export interface PermissionService {
  getUserPermissions(userId: string, orgId: string): Promise<UserPermissions>;
  hasPermission(userId: string, permission: string, orgId?: string): Promise<boolean>;
  getUserRoles(userId: string): Promise<Role[]>;
}

// Mock permissions based on TDD test structure
const permissions: Permission[] = [
  { id: 'vm-create', name: 'Create VM', resource: 'vm', action: 'create' },
  { id: 'vm-delete', name: 'Delete VM', resource: 'vm', action: 'delete' },
  { id: 'billing-view', name: 'View Billing', resource: 'billing', action: 'view' },
  { id: 'user-manage', name: 'Manage Users', resource: 'user', action: 'manage' },
  { id: 'report-view', name: 'View Reports', resource: 'report', action: 'view' },
  { id: 'org-manage', name: 'Manage Organization', resource: 'organization', action: 'manage' },
  { id: 'global-access', name: 'Global Access', resource: 'global', action: 'access' }
];

const roles: Role[] = [
  {
    id: 'root-role',
    name: 'Root',
    permissions: permissions // All permissions
  },
  {
    id: 'engineer-role', 
    name: 'Engineer',
    permissions: [
      permissions[0], // vm-create
      permissions[1], // vm-delete
    ]
  },
  {
    id: 'org-admin-role',
    name: 'Organization Admin', 
    permissions: [
      permissions[2], // billing-view
      permissions[3], // user-manage
      permissions[4], // report-view
      permissions[5], // org-manage
    ]
  },
  {
    id: 'reseller-admin-role',
    name: 'Reseller Admin',
    permissions: [
      permissions[2], // billing-view
      permissions[3], // user-manage  
      permissions[4], // report-view
      permissions[5], // org-manage
    ]
  },
  {
    id: 'readonly-role',
    name: 'Read Only User',
    permissions: [
      permissions[4], // report-view only
    ]
  }
];

// User role assignments based on TDD test users
const userRoleAssignments: { [userId: string]: string[] } = {
  'john-admin-001': ['root-role'],
  'jane-engineer-001': ['engineer-role'],
  'tom-admin-001': ['org-admin-role'],
  'alex-reseller-001': ['reseller-admin-role'],
  'susan-readonly-001': ['readonly-role'],
  'power-user-001': ['engineer-role', 'org-admin-role'] // Multi-role user
};

// Organization access mapping
const userOrgAccess: { [userId: string]: string[] } = {
  'john-admin-001': ['*'], // Global access
  'jane-engineer-001': ['startup-001'],
  'tom-admin-001': ['startup-001'],
  'alex-reseller-001': ['cloudtech-001', 'startup-001', 'retail-001'], // Reseller estate
  'susan-readonly-001': ['retail-001'],
  'power-user-001': ['startup-001']
};

class MockPermissionService implements PermissionService {
  async getUserPermissions(userId: string, orgId: string): Promise<UserPermissions> {
    const userRoles = await this.getUserRoles(userId);
    
    // Check if user has access to the organization
    const hasOrgAccess = await this.hasOrganizationAccess(userId, orgId);
    if (!hasOrgAccess) {
      // Return empty permissions if no org access
      return {
        canCreateVM: false,
        canDeleteVM: false,
        canViewBilling: false,
        canManageUsers: false,
        canViewReports: false,
        canManageOrganization: false,
        canAccessGlobalData: false
      };
    }

    // Combine permissions from all roles
    const allPermissions = userRoles.flatMap(role => role.permissions);
    
    return {
      canCreateVM: this.hasPermissionInList(allPermissions, 'vm-create'),
      canDeleteVM: this.hasPermissionInList(allPermissions, 'vm-delete'),
      canViewBilling: this.hasPermissionInList(allPermissions, 'billing-view'),
      canManageUsers: this.hasPermissionInList(allPermissions, 'user-manage'),
      canViewReports: this.hasPermissionInList(allPermissions, 'report-view'),
      canManageOrganization: this.hasPermissionInList(allPermissions, 'org-manage'),
      canAccessGlobalData: this.hasPermissionInList(allPermissions, 'global-access')
    };
  }

  async hasPermission(userId: string, permission: string, orgId?: string): Promise<boolean> {
    const userRoles = await this.getUserRoles(userId);
    
    // Check organization access if orgId provided
    if (orgId && !(await this.hasOrganizationAccess(userId, orgId))) {
      return false;
    }

    const allPermissions = userRoles.flatMap(role => role.permissions);
    return this.hasPermissionInList(allPermissions, permission);
  }

  async getUserRoles(userId: string): Promise<Role[]> {
    if (!userRoleAssignments[userId]) {
      if (userId === 'invalid-user') {
        throw new Error('User not found');
      }
      if (userId === 'user-no-roles') {
        return [];
      }
      throw new Error('User not found');
    }

    const roleIds = userRoleAssignments[userId];
    return roles.filter(role => roleIds.includes(role.id));
  }

  private hasPermissionInList(permissions: Permission[], permissionId: string): boolean {
    return permissions.some(p => p.id === permissionId);
  }

  private async hasOrganizationAccess(userId: string, orgId: string): Promise<boolean> {
    const userOrgs = userOrgAccess[userId] || [];
    
    // Global access (*) allows access to any organization
    if (userOrgs.includes('*')) {
      return true;
    }
    
    return userOrgs.includes(orgId);
  }
}

// Export singleton instance
export const permissionService = new MockPermissionService();