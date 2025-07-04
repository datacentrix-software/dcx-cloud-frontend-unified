# DCX Cloud Platform - Complete Technical Specification

## System Architecture & Technology Stack

### High-Level Architecture Overview
```mermaid
graph TB
    subgraph "Frontend Layer"
        A[Next.js 15.3.4]
        B[React 19.1.0]
        C[TypeScript 5.2.2]
        D[Material-UI 6.4.12]
    end
    
    subgraph "State Management"
        E[Zustand Stores]
        F[Redux Toolkit]
        G[Cookie Persistence]
    end
    
    subgraph "Backend Services"
        H[Express.js API]
        I[Authentication Service]
        J[Payment Gateway]
    end
    
    subgraph "Database Layer"
        K[PostgreSQL 16.9]
        L[Multi-Database Architecture]
        M[Data Isolation]
    end
    
    A --> E
    B --> F
    E --> H
    H --> K
    I --> M
```

### Technology Stack Components

#### Frontend Technologies
```mermaid
mindmap
  root)Frontend Stack(
    React Ecosystem
      Next.js Framework
      React 19.1.0
      TypeScript
      React Testing Library
    UI Components
      Material-UI
      Emotion Styling
      Custom Components
      Responsive Design
    State Management
      Zustand
      Redux Toolkit
      Cookie Persistence
      Local Storage
    Development Tools
      ESLint Security
      Jest Testing
      Webpack Bundling
      Hot Reloading
```

#### Backend & Infrastructure
- **API Server**: Express.js with TypeScript
- **Database**: PostgreSQL 16.9 with multi-database architecture
- **Authentication**: JWT tokens with refresh token rotation
- **Session Management**: Redis-backed sessions
- **Payment Processing**: PayStack integration
- **Email Services**: SMTP integration
- **Monitoring**: Application performance monitoring

### Component Architecture Diagram
```mermaid
graph TD
    A[Next.js App] --> B[Layout System]
    A --> C[Page Components]
    A --> D[Shared Components]
    
    B --> E[Vertical Layout]
    B --> F[Horizontal Layout]
    B --> G[Authentication Layout]
    
    C --> H[Dashboard Pages]
    C --> I[Management Pages]
    C --> J[Service Pages]
    
    D --> K[UI Components]
    D --> L[Form Components]
    D --> M[Data Components]
    
    N[State Stores] --> O[Auth Store]
    N --> P[VM Store]
    N --> Q[Quote Store]
    N --> R[Notification Store]
```

### Deployment Architecture
```mermaid
graph LR
    A[Development Environment] --> B[Local Database]
    A --> C[Mock APIs]
    
    D[Test Server] --> E[DaaS-DEV-2]
    E --> F[Production Databases]
    E --> G[PM2 Process Manager]
    
    H[Production Environment] --> I[Load Balancer]
    I --> J[Application Servers]
    J --> K[Database Cluster]
    J --> L[Redis Cluster]
```

---

## Database Schema & Data Architecture

### Complete Entity Relationship Diagram
```mermaid
erDiagram
    ORGANISATION {
        uuid id PK
        string name
        enum type
        enum status
        uuid parent_id FK
        timestamp created_at
        timestamp updated_at
    }
    
    USER {
        uuid id PK
        string email UK
        string password_hash
        string first_name
        string last_name
        enum user_type
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }
    
    USER_ORG_ROLE {
        uuid id PK
        uuid user_id FK
        uuid organisation_id FK
        uuid role_id FK
        timestamp created_at
        timestamp updated_at
    }
    
    ROLE {
        uuid id PK
        string name UK
        string description
        json permissions
        timestamp created_at
        timestamp updated_at
    }
    
    ROLE_PERMISSION {
        uuid id PK
        uuid role_id FK
        uuid permission_id FK
        timestamp created_at
    }
    
    PERMISSION {
        uuid id PK
        string name UK
        string description
        string resource
        string action
        timestamp created_at
    }
    
    VM_QUOTE {
        uuid id PK
        uuid organisation_id FK
        uuid user_id FK
        json configuration
        decimal total_cost
        enum status
        timestamp created_at
        timestamp expires_at
    }
    
    PRODUCT_QUOTE {
        uuid id PK
        uuid organisation_id FK
        json products
        decimal total_cost
        enum status
        timestamp created_at
    }
    
    BILLING_RECORD {
        uuid id PK
        uuid organisation_id FK
        decimal amount
        string currency
        enum billing_type
        timestamp billing_period_start
        timestamp billing_period_end
        timestamp created_at
    }
    
    PAYMENT_TRANSACTION {
        uuid id PK
        uuid organisation_id FK
        decimal amount
        string currency
        enum payment_method
        enum status
        string external_reference
        timestamp created_at
    }
    
    AUDIT_LOG {
        uuid id PK
        uuid user_id FK
        uuid organisation_id FK
        string action
        string resource
        json old_values
        json new_values
        string ip_address
        string user_agent
        timestamp created_at
    }
    
    ORGANISATION ||--o{ USER_ORG_ROLE : "has users"
    USER ||--o{ USER_ORG_ROLE : "belongs to orgs"
    ROLE ||--o{ USER_ORG_ROLE : "assigned to users"
    ROLE ||--o{ ROLE_PERMISSION : "has permissions"
    PERMISSION ||--o{ ROLE_PERMISSION : "granted to roles"
    ORGANISATION ||--o{ VM_QUOTE : "creates quotes"
    ORGANISATION ||--o{ PRODUCT_QUOTE : "requests products"
    ORGANISATION ||--o{ BILLING_RECORD : "receives bills"
    ORGANISATION ||--o{ PAYMENT_TRANSACTION : "makes payments"
    USER ||--o{ AUDIT_LOG : "performs actions"
    ORGANISATION ||--o{ AUDIT_LOG : "scope of actions"
```

### Multi-Database Architecture
```mermaid
graph TB
    subgraph "Main Application Database"
        A[datacentrix_cloud_production]
        A1[Users & Authentication]
        A2[Organisations & Roles]
        A3[Quotes & Billing]
        A4[Audit & Compliance]
    end
    
    subgraph "Product Catalog Database"
        B[aas_product_production]
        B1[Service Definitions]
        B2[Pricing Structures]
        B3[Product Configurations]
    end
    
    subgraph "VM Telemetry Database"
        C[aas_bronze_production]
        C1[VM Performance Data]
        C2[Resource Utilisation]
        C3[Historical Metrics]
        C4[933,527+ Records]
    end
    
    subgraph "Network Services Database"
        D[enetworks_product_production]
        D1[Network Configurations]
        D2[Connectivity Services]
        D3[Infrastructure Data]
    end
```

### Data Flow Architecture
```mermaid
flowchart TD
    A[Frontend Application] --> B[API Gateway]
    B --> C[Authentication Service]
    C --> D[Main Database]
    
    B --> E[Product Service]
    E --> F[Product Database]
    
    B --> G[Telemetry Service]
    G --> H[VM Database]
    
    B --> I[Network Service]
    I --> J[Network Database]
    
    K[External APIs] --> L[Data Sync Service]
    L --> H
    L --> F
    
    M[Payment Gateway] --> N[Payment Service]
    N --> D
```

---

## Module 1: Authentication & Access - Implementation

### Authentication System Architecture
```mermaid
sequenceDiagram
    participant Client
    participant Frontend
    participant API
    participant AuthService
    participant Database
    participant Redis
    
    Client->>Frontend: Login Request
    Frontend->>API: POST /auth/login
    API->>AuthService: Validate Credentials
    AuthService->>Database: Query User
    Database-->>AuthService: User Data
    AuthService->>AuthService: Generate JWT
    AuthService->>Redis: Store Refresh Token
    AuthService-->>API: JWT + Refresh Token
    API-->>Frontend: Authentication Response
    Frontend->>Frontend: Store in Cookies
    Frontend-->>Client: Redirect to Dashboard
```

### JWT Token Structure
```typescript
interface JWTPayload {
  sub: string;           // User ID
  email: string;         // User email
  userType: UserType;    // Customer | Reseller | Internal
  organizations: Array<{
    id: string;
    name: string;
    type: OrganisationType;
    roles: string[];
  }>;
  permissions: string[]; // Flattened permissions
  iat: number;          // Issued at
  exp: number;          // Expires at
  jti: string;          // JWT ID for revocation
}
```

### Role-Based Access Control Implementation
```typescript
// Permission Service Implementation
class PermissionService {
  /**
   * Checks if user has permission for specific action on resource
   */
  public hasPermission(
    user: IUser,
    action: string,
    resource: string,
    organizationId?: string
  ): boolean {
    // Get user's roles for the organization
    const userRoles = this.getUserRoles(user.id, organizationId);
    
    // Check each role for the required permission
    return userRoles.some(role => 
      role.permissions.some(permission => 
        permission.action === action && 
        permission.resource === resource
      )
    );
  }
  
  /**
   * Gets organizations accessible by user based on their roles
   */
  public getAccessibleOrganizations(user: IUser): Organization[] {
    switch (user.userType) {
      case UserType.Internal:
        return this.getAllOrganizations(); // God mode access
      case UserType.Reseller:
        return this.getResellerEstate(user.id);
      case UserType.Customer:
        return this.getUserOrganizations(user.id);
      default:
        return [];
    }
  }
}
```

### Multi-Factor Authentication Flow
```mermaid
stateDiagram-v2
    [*] --> LoginInitiated
    LoginInitiated --> CredentialsValidated
    CredentialsValidated --> OTPGenerated
    OTPGenerated --> OTPSent
    OTPSent --> OTPEntered
    OTPEntered --> OTPValidated
    OTPValidated --> Authenticated
    
    OTPEntered --> OTPInvalid
    OTPInvalid --> OTPEntered
    
    OTPGenerated --> OTPExpired
    OTPExpired --> LoginInitiated
    
    Authenticated --> [*]
```

### Session Management Implementation
```typescript
// Auth Store with Zustand
interface AuthState {
  user: IUser | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  organizations: Organization[];
  currentOrganization: Organization | null;
}

const useAuthStore = create<AuthState & AuthActions>(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      organizations: [],
      currentOrganization: null,
      
      login: async (credentials: LoginCredentials) => {
        const response = await authService.login(credentials);
        set({
          user: response.user,
          token: response.token,
          refreshToken: response.refreshToken,
          isAuthenticated: true,
          organizations: response.user.organizations
        });
      },
      
      logout: () => {
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          organizations: [],
          currentOrganization: null
        });
      },
      
      refreshToken: async () => {
        const { refreshToken } = get();
        if (!refreshToken) throw new Error('No refresh token available');
        
        const response = await authService.refresh(refreshToken);
        set({
          token: response.token,
          refreshToken: response.refreshToken
        });
      }
    }),
    {
      name: 'dcx-auth-store',
      storage: createJSONStorage(() => ({
        getItem: (key) => Cookies.get(key) || null,
        setItem: (key, value) => Cookies.set(key, value, { 
          secure: true, 
          sameSite: 'strict',
          expires: 7 // 7 days
        }),
        removeItem: (key) => Cookies.remove(key)
      }))
    }
  )
);
```

### Security Implementation Details

#### Password Security
```typescript
// Password hashing with bcrypt
const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

// Password validation rules
const passwordValidation = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  preventCommonPasswords: true
};
```

#### Session Security
```typescript
// JWT configuration
const jwtConfig = {
  accessTokenExpiry: '15m',
  refreshTokenExpiry: '7d',
  algorithm: 'RS256',
  issuer: 'dcx-cloud-platform',
  audience: 'dcx-users'
};

// Rate limiting for authentication
const authRateLimit = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per window
  message: 'Too many login attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false
};
```

---

## Module 2: User & Organisation Management - Code Structure

### Component Architecture
```mermaid
graph TD
    A[UserManagementDashboard] --> B[UserList]
    A --> C[UserInviteForm]
    A --> D[UserRoleAssignment]
    
    E[OrganizationSelector] --> F[OrgTree]
    E --> G[OrgDetails]
    
    H[UserProfile] --> I[PersonalInfo]
    H --> J[SecuritySettings]
    H --> K[OrganizationMemberships]
    
    L[AdminPanel] --> M[UserManagement]
    L --> N[RoleManagement]
    L --> O[PermissionMatrix]
```

### User Management Implementation
```typescript
// User Management Dashboard Component
interface UserManagementDashboardProps {
  organizationId?: string;
  currentUser: IUser;
}

const UserManagementDashboard: React.FC<UserManagementDashboardProps> = ({
  organizationId,
  currentUser
}) => {
  const [users, setUsers] = useState<IUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
  const [showInviteForm, setShowInviteForm] = useState(false);
  
  // Get accessible organizations based on user role
  const accessibleOrgs = useMemo(() => {
    return permissionService.getAccessibleOrganizations(currentUser);
  }, [currentUser]);
  
  // Load users based on organization scope
  useEffect(() => {
    const loadUsers = async () => {
      try {
        if (organizationId) {
          const orgUsers = await userService.getOrganizationUsers(organizationId);
          setUsers(orgUsers);
        } else {
          // Load all accessible users for admin
          const allUsers = await userService.getAccessibleUsers(currentUser);
          setUsers(allUsers);
        }
      } catch (error) {
        console.error('Failed to load users:', error);
      }
    };
    
    loadUsers();
  }, [organizationId, currentUser]);
  
  const handleInviteUser = async (inviteData: UserInviteData) => {
    try {
      await userService.inviteUser({
        ...inviteData,
        organizationId: organizationId || currentUser.defaultOrganization,
        invitedBy: currentUser.id
      });
      
      // Refresh user list
      const updatedUsers = await userService.getOrganizationUsers(organizationId);
      setUsers(updatedUsers);
      setShowInviteForm(false);
    } catch (error) {
      console.error('Failed to invite user:', error);
    }
  };
  
  return (
    <div className="user-management-dashboard">
      <UserManagementHeader 
        onInviteUser={() => setShowInviteForm(true)}
        canInvite={permissionService.hasPermission(
          currentUser, 
          'CREATE', 
          'USER', 
          organizationId
        )}
      />
      
      <UserTable 
        users={users}
        currentUser={currentUser}
        onSelectUser={setSelectedUser}
        organizationId={organizationId}
      />
      
      {showInviteForm && (
        <UserInviteForm
          onSubmit={handleInviteUser}
          onCancel={() => setShowInviteForm(false)}
          availableRoles={getAvailableRoles(currentUser, organizationId)}
        />
      )}
      
      {selectedUser && (
        <UserDetailsPanel
          user={selectedUser}
          currentUser={currentUser}
          onClose={() => setSelectedUser(null)}
          onUserUpdated={(updatedUser) => {
            setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
          }}
        />
      )}
    </div>
  );
};
```

### Organization Access Service
```typescript
// Organization Access Service
class OrganizationAccessService {
  /**
   * Gets organization tree for user based on their access level
   */
  public async getOrganizationTree(userId: string): Promise<OrganizationTreeNode[]> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new Error('User not found');
    
    switch (user.userType) {
      case UserType.Internal:
        return this.getFullOrganizationTree();
      case UserType.Reseller:
        return this.getResellerOrganizationTree(userId);
      case UserType.Customer:
        return this.getCustomerOrganizationTree(userId);
      default:
        return [];
    }
  }
  
  /**
   * Checks if user can access specific organization
   */
  public async canAccessOrganization(
    userId: string, 
    organizationId: string
  ): Promise<boolean> {
    const userOrgs = await this.getUserOrganizations(userId);
    return userOrgs.some(org => 
      org.id === organizationId || 
      this.isParentOrganization(org.id, organizationId)
    );
  }
  
  /**
   * Gets users that the current user can manage
   */
  public async getManageableUsers(currentUserId: string): Promise<IUser[]> {
    const currentUser = await this.userRepository.findById(currentUserId);
    const accessibleOrgs = await this.getOrganizationTree(currentUserId);
    
    const orgIds = this.flattenOrganizationIds(accessibleOrgs);
    return this.userRepository.findByOrganizations(orgIds);
  }
  
  private async getResellerOrganizationTree(userId: string): Promise<OrganizationTreeNode[]> {
    // Get reseller organization and all customer organizations
    const resellerOrgs = await this.organizationRepository.findByUserId(userId);
    const customerOrgs = await this.organizationRepository.findCustomersForReseller(userId);
    
    return this.buildTree(resellerOrgs.concat(customerOrgs));
  }
}
```

### User Invitation System
```mermaid
sequenceDiagram
    participant Admin
    participant Frontend
    participant API
    participant EmailService
    participant NewUser
    participant Database
    
    Admin->>Frontend: Fill Invitation Form
    Frontend->>API: POST /users/invite
    API->>Database: Create Invitation Record
    API->>EmailService: Send Invitation Email
    EmailService->>NewUser: Deliver Email
    API-->>Frontend: Invitation Sent
    
    NewUser->>API: GET /users/invite/{token}
    API->>Database: Validate Token
    API-->>NewUser: Show Registration Form
    NewUser->>API: POST /users/register
    API->>Database: Create User Account
    API->>Database: Assign Roles
    API-->>NewUser: Account Created
```

### Role Assignment Implementation
```typescript
// Role Assignment Component
interface UserRoleAssignmentProps {
  user: IUser;
  organization: Organization;
  currentUser: IUser;
  onRolesUpdated: (roles: Role[]) => void;
}

const UserRoleAssignment: React.FC<UserRoleAssignmentProps> = ({
  user,
  organization,
  currentUser,
  onRolesUpdated
}) => {
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [assignedRoles, setAssignedRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    const loadRoles = async () => {
      try {
        // Get roles that current user can assign
        const available = await roleService.getAssignableRoles(
          currentUser.id,
          organization.id
        );
        setAvailableRoles(available);
        
        // Get user's current roles in this organization
        const current = await roleService.getUserRoles(
          user.id,
          organization.id
        );
        setAssignedRoles(current);
      } catch (error) {
        console.error('Failed to load roles:', error);
      }
    };
    
    loadRoles();
  }, [user.id, organization.id, currentUser.id]);
  
  const handleRoleAssignment = async (roleId: string, assign: boolean) => {
    setLoading(true);
    try {
      if (assign) {
        await roleService.assignRole(user.id, organization.id, roleId);
      } else {
        await roleService.unassignRole(user.id, organization.id, roleId);
      }
      
      // Refresh assigned roles
      const updatedRoles = await roleService.getUserRoles(
        user.id,
        organization.id
      );
      setAssignedRoles(updatedRoles);
      onRolesUpdated(updatedRoles);
    } catch (error) {
      console.error('Failed to update role assignment:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="role-assignment-panel">
      <h3>Role Assignment for {user.firstName} {user.lastName}</h3>
      <div className="organization-context">
        Organization: {organization.name}
      </div>
      
      <div className="role-list">
        {availableRoles.map(role => {
          const isAssigned = assignedRoles.some(ar => ar.id === role.id);
          return (
            <div key={role.id} className="role-item">
              <Checkbox
                checked={isAssigned}
                onChange={(e) => handleRoleAssignment(role.id, e.target.checked)}
                disabled={loading}
              />
              <div className="role-info">
                <div className="role-name">{role.name}</div>
                <div className="role-description">{role.description}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
```

---

## Module 3: Core Platform Services - Technical Implementation

### Service Architecture Overview
```mermaid
graph TB
    subgraph "Frontend Services"
        A[VM Management UI]
        B[Service Dashboard]
        C[Configuration Forms]
    end
    
    subgraph "API Layer"
        D[VM Service API]
        E[Billing Service API]
        F[Monitoring API]
    end
    
    subgraph "Business Logic"
        G[Resource Allocation]
        H[Cost Calculation]
        I[Performance Monitoring]
    end
    
    subgraph "Data Layer"
        J[VM Configuration DB]
        K[Telemetry DB]
        L[Billing DB]
    end
    
    A --> D
    B --> E
    C --> F
    D --> G
    E --> H
    F --> I
    G --> J
    H --> L
    I --> K
```

### Virtual Machine Management Implementation
```typescript
// VM Configuration Store
interface VMState {
  currentConfiguration: IVMConfig | null;
  templates: VMTemplate[];
  selectedServices: IAdditionalServices[];
  backupConfig: IBackupServices | null;
  softwareLicenses: ISoftwareLicense[];
  pricing: VMPricing | null;
}

const useVirtualMachineStore = create<VMState & VMActions>((set, get) => ({
  currentConfiguration: null,
  templates: [],
  selectedServices: [],
  backupConfig: null,
  softwareLicenses: [],
  pricing: null,
  
  setConfiguration: (config: IVMConfig) => set({ currentConfiguration: config }),
  
  selectTemplate: (template: VMTemplate) => {
    const config: IVMConfig = {
      ...template,
      customizations: {},
      selectedAt: new Date().toISOString()
    };
    set({ currentConfiguration: config });
  },
  
  updateResourceConfig: (resources: Partial<IVMConfig>) => {
    const current = get().currentConfiguration;
    if (current) {
      set({
        currentConfiguration: {
          ...current,
          ...resources,
          updatedAt: new Date().toISOString()
        }
      });
    }
  },
  
  calculatePricing: async () => {
    const { currentConfiguration, selectedServices, backupConfig } = get();
    if (!currentConfiguration) return;
    
    try {
      const pricing = await vmPricingService.calculateTotalCost({
        vmConfig: currentConfiguration,
        additionalServices: selectedServices,
        backupServices: backupConfig
      });
      
      set({ pricing });
    } catch (error) {
      console.error('Failed to calculate pricing:', error);
    }
  },
  
  submitConfiguration: async (organizationId: string) => {
    const state = get();
    if (!state.currentConfiguration) throw new Error('No configuration selected');
    
    const quote = await vmService.createQuote({
      organizationId,
      configuration: state.currentConfiguration,
      additionalServices: state.selectedServices,
      backupConfig: state.backupConfig,
      softwareLicenses: state.softwareLicenses,
      estimatedCost: state.pricing?.total || 0
    });
    
    return quote;
  }
}));
```

### VM Provisioning Workflow
```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant VMService
    participant ResourceManager
    participant HypervisorAPI
    participant Database
    
    User->>Frontend: Configure VM
    Frontend->>VMService: Submit Configuration
    VMService->>ResourceManager: Allocate Resources
    ResourceManager->>Database: Reserve Resources
    ResourceManager->>HypervisorAPI: Create VM
    HypervisorAPI->>VMService: VM Created
    VMService->>Database: Update VM Status
    VMService->>Frontend: Provisioning Complete
    Frontend->>User: VM Ready Notification
```

### Dashboard Data Processing
```typescript
// Customer Dashboard Data Service
class DashboardDataService {
  /**
   * Aggregates VM telemetry data for dashboard display
   */
  public async getVMTelemetryData(
    organizationId: string,
    timeRange: TimeRange
  ): Promise<VMTelemetryAggregated> {
    try {
      // Fetch raw telemetry data
      const rawData = await this.telemetryAPI.getVMData({
        organizationId,
        startTime: timeRange.start,
        endTime: timeRange.end
      });
      
      // Process and aggregate data
      const aggregated = this.aggregateTelemetryData(rawData);
      
      // Apply organization-specific filtering
      const filtered = this.filterByOrganizationAccess(aggregated, organizationId);
      
      return {
        summary: this.generateSummaryMetrics(filtered),
        timeSeries: this.generateTimeSeriesData(filtered),
        alerts: this.generateAlertData(filtered),
        recommendations: this.generateRecommendations(filtered)
      };
    } catch (error) {
      console.error('Failed to fetch VM telemetry:', error);
      throw new Error('Unable to load dashboard data');
    }
  }
  
  /**
   * Processes billing data for financial dashboard
   */
  public async getBillingAnalytics(
    organizationId: string,
    period: BillingPeriod
  ): Promise<BillingAnalytics> {
    const billingData = await this.billingAPI.getBillingHistory({
      organizationId,
      period
    });
    
    return {
      currentPeriod: this.calculateCurrentPeriodCosts(billingData),
      trends: this.calculateTrends(billingData),
      breakdown: this.generateCostBreakdown(billingData),
      projections: this.generateCostProjections(billingData)
    };
  }
  
  private aggregateTelemetryData(rawData: VMTelemetryRaw[]): VMTelemetryAggregated {
    // Group by VM and time intervals
    const grouped = rawData.reduce((acc, dataPoint) => {
      const key = `${dataPoint.vmId}_${dataPoint.timestamp}`;
      acc[key] = dataPoint;
      return acc;
    }, {} as Record<string, VMTelemetryRaw>);
    
    // Calculate aggregations
    return {
      totalVMs: new Set(rawData.map(d => d.vmId)).size,
      avgCpuUsage: this.calculateAverage(rawData, 'cpuUsage'),
      avgMemoryUsage: this.calculateAverage(rawData, 'memoryUsage'),
      totalDataTransfer: this.calculateSum(rawData, 'networkIO'),
      performanceScore: this.calculatePerformanceScore(rawData)
    };
  }
}
```

---

## Module 4: Financial & Commercial System - System Logic

### Payment Processing Architecture
```mermaid
sequenceDiagram
    participant Customer
    participant Frontend
    participant PaymentAPI
    participant PayStack
    participant Webhook
    participant Database
    
    Customer->>Frontend: Initiate Payment
    Frontend->>PaymentAPI: Create Payment Intent
    PaymentAPI->>PayStack: Initialize Transaction
    PayStack->>Customer: Redirect to Payment Page
    Customer->>PayStack: Complete Payment
    PayStack->>Webhook: Payment Success Notification
    Webhook->>Database: Update Payment Status
    Webhook->>PaymentAPI: Confirm Payment
    PaymentAPI->>Frontend: Payment Confirmed
    Frontend->>Customer: Success Message
```

### Pricing Calculation Engine
```typescript
// Pricing Engine Implementation
class PricingEngine {
  private pricingRules: PricingRule[];
  private discountEngine: DiscountEngine;
  
  constructor(
    pricingRules: PricingRule[],
    discountEngine: DiscountEngine
  ) {
    this.pricingRules = pricingRules;
    this.discountEngine = discountEngine;
  }
  
  /**
   * Calculates total cost for VM configuration with all applicable discounts
   */
  public async calculateVMCost(
    config: IVMConfig,
    additionalServices: IAdditionalServices[],
    organizationId: string,
    billingPeriod: BillingPeriod = 'monthly'
  ): Promise<PricingCalculation> {
    // Base VM costs
    const baseCosts = this.calculateBaseCosts(config, billingPeriod);
    
    // Additional service costs
    const serviceCosts = this.calculateServiceCosts(additionalServices, billingPeriod);
    
    // Get organization pricing tier
    const pricingTier = await this.getPricingTier(organizationId);
    
    // Apply tier-based pricing
    const tierAdjustedCosts = this.applyTierPricing(
      baseCosts + serviceCosts,
      pricingTier
    );
    
    // Calculate volume discounts
    const volumeDiscounts = await this.discountEngine.calculateVolumeDiscounts(
      organizationId,
      tierAdjustedCosts,
      billingPeriod
    );
    
    // Apply promotional discounts
    const promotionalDiscounts = await this.discountEngine.calculatePromotionalDiscounts(
      organizationId,
      tierAdjustedCosts
    );
    
    const totalDiscounts = volumeDiscounts + promotionalDiscounts;
    const finalCost = Math.max(0, tierAdjustedCosts - totalDiscounts);
    
    return {
      baseCost: baseCosts,
      serviceCosts: serviceCosts,
      tierAdjustment: tierAdjustedCosts - (baseCosts + serviceCosts),
      volumeDiscount: volumeDiscounts,
      promotionalDiscount: promotionalDiscounts,
      totalDiscount: totalDiscounts,
      finalCost: finalCost,
      currency: 'ZAR',
      billingPeriod,
      calculatedAt: new Date().toISOString()
    };
  }
  
  private calculateBaseCosts(config: IVMConfig, period: BillingPeriod): number {
    const hourlyRate = this.calculateHourlyRate(config);
    
    switch (period) {
      case 'hourly':
        return hourlyRate;
      case 'monthly':
        return hourlyRate * 24 * 30; // 720 hours
      case 'annually':
        return hourlyRate * 24 * 365; // 8760 hours
      default:
        throw new Error(`Unsupported billing period: ${period}`);
    }
  }
  
  private calculateHourlyRate(config: IVMConfig): number {
    const cpuCost = config.cpu * this.getResourcePrice('cpu');
    const memoryCost = config.memory * this.getResourcePrice('memory');
    const storageCost = config.storage * this.getResourcePrice('storage');
    const networkCost = config.bandwidth * this.getResourcePrice('bandwidth');
    
    return cpuCost + memoryCost + storageCost + networkCost;
  }
  
  private getResourcePrice(resource: ResourceType): number {
    const rule = this.pricingRules.find(r => r.resource === resource);
    if (!rule) throw new Error(`No pricing rule found for resource: ${resource}`);
    return rule.pricePerUnit;
  }
}

// Discount Engine Implementation
class DiscountEngine {
  /**
   * Calculates volume-based discounts for organization
   */
  public async calculateVolumeDiscounts(
    organizationId: string,
    baseCost: number,
    period: BillingPeriod
  ): Promise<number> {
    const usage = await this.getOrganizationUsage(organizationId, period);
    const volumeTier = this.determineVolumeTier(usage.totalSpend);
    
    const discountPercentage = this.getVolumeDiscountPercentage(volumeTier);
    return baseCost * (discountPercentage / 100);
  }
  
  /**
   * Calculates promotional discounts for organization
   */
  public async calculatePromotionalDiscounts(
    organizationId: string,
    baseCost: number
  ): Promise<number> {
    const activePromotions = await this.getActivePromotions(organizationId);
    
    let totalDiscount = 0;
    for (const promotion of activePromotions) {
      const discount = this.calculatePromotionDiscount(promotion, baseCost);
      totalDiscount += discount;
    }
    
    return Math.min(totalDiscount, baseCost * 0.5); // Max 50% discount
  }
  
  private determineVolumeTier(totalSpend: number): VolumeTier {
    if (totalSpend >= 100000) return 'enterprise';
    if (totalSpend >= 50000) return 'business';
    if (totalSpend >= 10000) return 'professional';
    return 'standard';
  }
  
  private getVolumeDiscountPercentage(tier: VolumeTier): number {
    const discounts = {
      standard: 0,
      professional: 5,
      business: 10,
      enterprise: 15
    };
    return discounts[tier];
  }
}
```

### Billing Cycle Implementation
```typescript
// Billing Service Implementation
class BillingService {
  /**
   * Processes monthly billing for all organizations
   */
  public async processMonthlyBilling(): Promise<BillingResult[]> {
    const organizations = await this.getActiveOrganizations();
    const results: BillingResult[] = [];
    
    for (const org of organizations) {
      try {
        const result = await this.processOrganizationBilling(org.id);
        results.push(result);
      } catch (error) {
        console.error(`Failed to process billing for ${org.name}:`, error);
        results.push({
          organizationId: org.id,
          success: false,
          error: error.message
        });
      }
    }
    
    return results;
  }
  
  private async processOrganizationBilling(organizationId: string): Promise<BillingResult> {
    // Get usage data for billing period
    const usageData = await this.getUsageData(organizationId);
    
    // Calculate costs
    const costs = await this.calculateMonthlyCosts(organizationId, usageData);
    
    // Generate invoice
    const invoice = await this.generateInvoice({
      organizationId,
      billingPeriod: this.getCurrentBillingPeriod(),
      lineItems: costs.lineItems,
      totalAmount: costs.total,
      dueDate: this.calculateDueDate()
    });
    
    // Send invoice
    await this.sendInvoice(invoice);
    
    // Update billing status
    await this.updateBillingStatus(organizationId, 'invoiced');
    
    return {
      organizationId,
      success: true,
      invoiceId: invoice.id,
      amount: costs.total
    };
  }
  
  /**
   * Processes payment webhook from PayStack
   */
  public async processPaymentWebhook(webhookData: PayStackWebhook): Promise<void> {
    const { event, data } = webhookData;
    
    switch (event) {
      case 'charge.success':
        await this.handleSuccessfulPayment(data);
        break;
      case 'charge.failed':
        await this.handleFailedPayment(data);
        break;
      case 'transfer.success':
        await this.handleTransferSuccess(data);
        break;
      default:
        console.warn(`Unhandled webhook event: ${event}`);
    }
  }
  
  private async handleSuccessfulPayment(paymentData: PayStackPaymentData): Promise<void> {
    const payment = await this.paymentRepository.findByReference(
      paymentData.reference
    );
    
    if (!payment) {
      throw new Error(`Payment not found: ${paymentData.reference}`);
    }
    
    // Update payment status
    await this.paymentRepository.updateStatus(payment.id, 'completed');
    
    // Update organization credit balance
    await this.creditService.addCredit(
      payment.organizationId,
      paymentData.amount / 100, // Convert from kobo to naira
      `Payment via ${paymentData.channel}`
    );
    
    // Send confirmation email
    await this.emailService.sendPaymentConfirmation(
      payment.organizationId,
      paymentData
    );
    
    // Update invoice if payment was for specific invoice
    if (payment.invoiceId) {
      await this.invoiceService.markAsPaid(payment.invoiceId, payment.id);
    }
  }
}
```

---

## Module 5: Multi-Tenant Architecture - Technical Design

### Tenant Isolation Architecture
```mermaid
graph TB
    subgraph "Request Processing Layer"
        A[Incoming Request] --> B[Authentication Middleware]
        B --> C[Tenant Context Extraction]
        C --> D[Authorization Check]
    end
    
    subgraph "Data Access Layer"
        D --> E[Organization Scope Filter]
        E --> F[Database Query Builder]
        F --> G[Row-Level Security]
    end
    
    subgraph "Database Layer"
        G --> H[PostgreSQL with RLS]
        H --> I[Org-Scoped Data]
        H --> J[Audit Logging]
    end
    
    subgraph "Response Layer"
        I --> K[Data Transformation]
        K --> L[Organization Filtering]
        L --> M[Response to Client]
    end
```

### Multi-Tenant Data Access Implementation
```typescript
// Tenant Context Middleware
interface TenantContext {
  userId: string;
  userType: UserType;
  organizationId: string;
  accessibleOrganizations: string[];
  permissions: string[];
}

class TenantContextMiddleware {
  public async extractTenantContext(req: Request): Promise<TenantContext> {
    const token = this.extractToken(req);
    const payload = await this.verifyToken(token);
    
    // Get user's accessible organizations
    const accessibleOrgs = await this.getAccessibleOrganizations(
      payload.sub,
      payload.userType
    );
    
    // Determine current organization context
    const currentOrgId = req.headers['x-organization-id'] as string || 
                         payload.organizations[0]?.id;
    
    // Validate organization access
    if (currentOrgId && !accessibleOrgs.includes(currentOrgId)) {
      throw new UnauthorizedError('Organization access denied');
    }
    
    return {
      userId: payload.sub,
      userType: payload.userType,
      organizationId: currentOrgId,
      accessibleOrganizations: accessibleOrgs,
      permissions: payload.permissions
    };
  }
  
  private async getAccessibleOrganizations(
    userId: string,
    userType: UserType
  ): Promise<string[]> {
    switch (userType) {
      case UserType.Internal:
        // Internal users have access to all organizations
        return this.getAllOrganizationIds();
        
      case UserType.Reseller:
        // Reseller users have access to their estate
        return this.getResellerEstate(userId);
        
      case UserType.Customer:
        // Customer users have access to their organizations only
        return this.getUserOrganizations(userId);
        
      default:
        return [];
    }
  }
}

// Organization-Scoped Repository Base Class
abstract class OrganizationScopedRepository<T> {
  protected tenantContext: TenantContext;
  
  constructor(tenantContext: TenantContext) {
    this.tenantContext = tenantContext;
  }
  
  /**
   * Applies organization-based filtering to all queries
   */
  protected applyOrganizationFilter(query: QueryBuilder<T>): QueryBuilder<T> {
    // For internal users, no filtering needed (god mode)
    if (this.tenantContext.userType === UserType.Internal) {
      return query;
    }
    
    // For reseller and customer users, apply organization filtering
    return query.whereIn(
      'organization_id',
      this.tenantContext.accessibleOrganizations
    );
  }
  
  /**
   * Validates that the entity belongs to an accessible organization
   */
  protected async validateOrganizationAccess(
    entityOrganizationId: string
  ): Promise<void> {
    if (this.tenantContext.userType === UserType.Internal) {
      return; // Internal users have access to everything
    }
    
    if (!this.tenantContext.accessibleOrganizations.includes(entityOrganizationId)) {
      throw new UnauthorizedError(
        'Access denied: Entity belongs to inaccessible organization'
      );
    }
  }
  
  public async findById(id: string): Promise<T | null> {
    const entity = await this.createQueryBuilder()
      .where('id', id)
      .pipe(this.applyOrganizationFilter.bind(this))
      .first();
    
    return entity || null;
  }
  
  public async findAll(): Promise<T[]> {
    return this.createQueryBuilder()
      .pipe(this.applyOrganizationFilter.bind(this))
      .orderBy('created_at', 'desc');
  }
  
  protected abstract createQueryBuilder(): QueryBuilder<T>;
}
```

---

## Module 6: Platform Infrastructure - System Components

### Infrastructure Monitoring Architecture
```mermaid
graph TB
    subgraph "Application Layer"
        A[Next.js Frontend]
        B[Express Backend]
        C[Database Services]
    end
    
    subgraph "Monitoring Layer"
        D[Performance Monitoring]
        E[Error Tracking]
        F[Usage Analytics]
        G[Health Checks]
    end
    
    subgraph "Alert Management"
        H[Alert Engine]
        I[Notification Service]
        J[Escalation Rules]
    end
    
    subgraph "Infrastructure"
        K[Server Metrics]
        L[Database Performance]
        M[Network Monitoring]
    end
    
    A --> D
    B --> E
    C --> F
    D --> H
    E --> I
    F --> J
    G --> H
    H --> K
    I --> L
    J --> M
```

### Notification System Implementation
```typescript
// Notification Store Implementation
interface NotificationState {
  notifications: INotification[];
  unreadCount: number;
  settings: NotificationSettings;
  loading: boolean;
}

const useNotificationStore = create<NotificationState & NotificationActions>(
  (set, get) => ({
    notifications: [],
    unreadCount: 0,
    settings: {
      emailNotifications: true,
      pushNotifications: true,
      smsNotifications: false,
      alertTypes: ['critical', 'warning', 'info']
    },
    loading: false,
    
    loadNotifications: async (organizationId: string) => {
      set({ loading: true });
      try {
        const notifications = await notificationService.getNotifications(organizationId);
        const unreadCount = notifications.filter(n => !n.read).length;
        
        set({ 
          notifications, 
          unreadCount, 
          loading: false 
        });
      } catch (error) {
        console.error('Failed to load notifications:', error);
        set({ loading: false });
      }
    },
    
    markAsRead: async (notificationId: string) => {
      try {
        await notificationService.markAsRead(notificationId);
        
        const notifications = get().notifications.map(n =>
          n.id === notificationId ? { ...n, read: true } : n
        );
        const unreadCount = notifications.filter(n => !n.read).length;
        
        set({ notifications, unreadCount });
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      }
    },
    
    markAllAsRead: async (organizationId: string) => {
      try {
        await notificationService.markAllAsRead(organizationId);
        
        const notifications = get().notifications.map(n => ({ ...n, read: true }));
        set({ notifications, unreadCount: 0 });
      } catch (error) {
        console.error('Failed to mark all notifications as read:', error);
      }
    },
    
    addNotification: (notification: INotification) => {
      const notifications = [notification, ...get().notifications];
      const unreadCount = notifications.filter(n => !n.read).length;
      set({ notifications, unreadCount });
    }
  })
);
```

### Alert Management System
```typescript
// Alert Engine Implementation
class AlertEngine {
  private alertRules: AlertRule[];
  private notificationService: NotificationService;
  
  constructor(
    alertRules: AlertRule[],
    notificationService: NotificationService
  ) {
    this.alertRules = alertRules;
    this.notificationService = notificationService;
  }
  
  /**
   * Processes incoming metrics and triggers alerts
   */
  public async processMetrics(metrics: SystemMetrics): Promise<void> {
    for (const rule of this.alertRules) {
      try {
        const shouldAlert = await this.evaluateRule(rule, metrics);
        
        if (shouldAlert) {
          await this.triggerAlert(rule, metrics);
        }
      } catch (error) {
        console.error(`Failed to evaluate alert rule ${rule.id}:`, error);
      }
    }
  }
  
  private async evaluateRule(rule: AlertRule, metrics: SystemMetrics): Promise<boolean> {
    switch (rule.type) {
      case 'threshold':
        return this.evaluateThresholdRule(rule as ThresholdRule, metrics);
      case 'rate':
        return this.evaluateRateRule(rule as RateRule, metrics);
      case 'availability':
        return this.evaluateAvailabilityRule(rule as AvailabilityRule, metrics);
      default:
        console.warn(`Unknown alert rule type: ${rule.type}`);
        return false;
    }
  }
  
  private evaluateThresholdRule(rule: ThresholdRule, metrics: SystemMetrics): boolean {
    const metricValue = this.getMetricValue(metrics, rule.metricPath);
    
    switch (rule.operator) {
      case 'greater_than':
        return metricValue > rule.threshold;
      case 'less_than':
        return metricValue < rule.threshold;
      case 'equal_to':
        return metricValue === rule.threshold;
      default:
        return false;
    }
  }
  
  private async triggerAlert(rule: AlertRule, metrics: SystemMetrics): Promise<void> {
    // Check if alert is in cooldown period
    const lastAlert = await this.getLastAlert(rule.id);
    if (lastAlert && this.isInCooldown(lastAlert, rule.cooldownPeriod)) {
      return;
    }
    
    // Create alert record
    const alert = await this.createAlert({
      ruleId: rule.id,
      severity: rule.severity,
      title: rule.title,
      message: this.formatAlertMessage(rule, metrics),
      organizationId: rule.organizationId,
      metadata: {
        metricValues: this.extractRelevantMetrics(metrics, rule),
        ruleConfiguration: rule
      }
    });
    
    // Send notifications based on severity and recipient configuration
    await this.sendAlertNotifications(alert, rule.recipients);
    
    // Record alert in database
    await this.recordAlert(alert);
  }
}
```

### Configuration Management System
```typescript
// Configuration Service
class ConfigurationService {
  private configCache: Map<string, any> = new Map();
  private configWatchers: Map<string, ConfigWatcher[]> = new Map();
  
  /**
   * Gets configuration value with environment override support
   */
  public async getConfig<T>(key: string, defaultValue?: T): Promise<T> {
    // Check cache first
    if (this.configCache.has(key)) {
      return this.configCache.get(key);
    }
    
    // Try environment variable first
    const envValue = process.env[key.replace('.', '_').toUpperCase()];
    if (envValue !== undefined) {
      const parsedValue = this.parseEnvironmentValue(envValue);
      this.configCache.set(key, parsedValue);
      return parsedValue;
    }
    
    // Try database configuration
    const dbValue = await this.getConfigFromDatabase(key);
    if (dbValue !== null) {
      this.configCache.set(key, dbValue);
      return dbValue;
    }
    
    // Return default value
    if (defaultValue !== undefined) {
      this.configCache.set(key, defaultValue);
      return defaultValue;
    }
    
    throw new Error(`Configuration key '${key}' not found and no default provided`);
  }
  
  /**
   * Updates configuration value
   */
  public async setConfig(key: string, value: any): Promise<void> {
    // Update in database
    await this.updateConfigInDatabase(key, value);
    
    // Update cache
    this.configCache.set(key, value);
    
    // Notify watchers
    const watchers = this.configWatchers.get(key) || [];
    watchers.forEach(watcher => {
      try {
        watcher.callback(value);
      } catch (error) {
        console.error(`Config watcher error for key '${key}':`, error);
      }
    });
  }
}
```

### Audit Logging System
```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant API
    participant AuditService
    participant Database
    participant AuditProcessor
    
    User->>Frontend: Perform Action
    Frontend->>API: API Request
    API->>AuditService: Log Action
    AuditService->>Database: Store Audit Record
    AuditService->>AuditProcessor: Queue for Processing
    AuditProcessor->>AuditProcessor: Analyze Patterns
    AuditProcessor->>AlertEngine: Trigger Alerts if Needed
    API-->>Frontend: Response
    Frontend-->>User: Action Complete
```

```typescript
// Audit Service Implementation
class AuditService {
  /**
   * Logs user actions for compliance and security
   */
  public async logAction(auditData: AuditLogData): Promise<void> {
    const auditRecord = {
      id: uuidv4(),
      userId: auditData.userId,
      organizationId: auditData.organizationId,
      action: auditData.action,
      resource: auditData.resource,
      resourceId: auditData.resourceId,
      oldValues: auditData.oldValues ? JSON.stringify(auditData.oldValues) : null,
      newValues: auditData.newValues ? JSON.stringify(auditData.newValues) : null,
      ipAddress: auditData.ipAddress,
      userAgent: auditData.userAgent,
      sessionId: auditData.sessionId,
      metadata: auditData.metadata ? JSON.stringify(auditData.metadata) : null,
      timestamp: new Date(),
      severity: this.determineSeverity(auditData.action),
      status: 'success'
    };
    
    // Store in database
    await this.auditRepository.create(auditRecord);
    
    // Queue for real-time processing
    await this.auditProcessor.processAction(auditRecord);
    
    // Check for suspicious patterns
    await this.securityAnalyzer.analyzeAction(auditRecord);
  }
  
  /**
   * Gets audit trail for specific resource
   */
  public async getAuditTrail(
    resourceType: string,
    resourceId: string,
    organizationId: string
  ): Promise<AuditRecord[]> {
    return this.auditRepository.findByResource(
      resourceType,
      resourceId,
      organizationId
    );
  }
  
  /**
   * Generates compliance reports
   */
  public async generateComplianceReport(
    organizationId: string,
    period: ReportPeriod
  ): Promise<ComplianceReport> {
    const auditRecords = await this.auditRepository.findByPeriod(
      organizationId,
      period
    );
    
    return {
      organizationId,
      period,
      totalActions: auditRecords.length,
      userActivity: this.analyzeUserActivity(auditRecords),
      securityEvents: this.analyzeSecurityEvents(auditRecords),
      dataAccess: this.analyzeDataAccess(auditRecords),
      complianceScore: this.calculateComplianceScore(auditRecords),
      recommendations: this.generateRecommendations(auditRecords)
    };
  }
}
```

---

## Development & Deployment

### Development Environment Setup
```mermaid
flowchart TD
    A[Developer Machine] --> B[Node.js 22.16.0]
    B --> C[Install Dependencies]
    C --> D[Environment Configuration]
    D --> E[Database Setup]
    E --> F[Start Development Server]
    
    G[Local Database] --> H[SSH Tunnel to Test DB]
    H --> I[Data Synchronization]
    
    J[Development Tools] --> K[ESLint Security]
    J --> L[Jest Testing]
    J --> M[TypeScript Compiler]
```

### CI/CD Pipeline
```mermaid
flowchart LR
    A[Code Commit] --> B[Build & Test]
    B --> C[Security Scan]
    C --> D[Quality Gates]
    D --> E[Deploy to Test]
    E --> F[Integration Tests]
    F --> G[Deploy to Production]
    
    H[Rollback Plan] --> I[Previous Version]
    G --> H
```

### Production Infrastructure
```mermaid
graph TB
    subgraph "Load Balancers"
        A[Nginx Load Balancer]
        B[SSL Termination]
    end
    
    subgraph "Application Servers"
        C[Next.js Frontend]
        D[Express Backend]
        E[PM2 Process Manager]
    end
    
    subgraph "Database Cluster"
        F[Primary PostgreSQL]
        G[Read Replicas]
        H[Backup Systems]
    end
    
    subgraph "External Services"
        I[Redis Cache]
        J[Payment Gateway]
        K[Email Service]
    end
    
    A --> C
    B --> D
    C --> F
    D --> G
    E --> I
    F --> H
    C --> J
    D --> K
```

---

## API Reference

### Authentication Endpoints
```typescript
// Authentication API Endpoints
interface AuthAPI {
  'POST /auth/login': {
    body: { email: string; password: string };
    response: { user: IUser; token: string; refreshToken: string };
  };
  
  'POST /auth/refresh': {
    body: { refreshToken: string };
    response: { token: string; refreshToken: string };
  };
  
  'POST /auth/logout': {
    headers: { Authorization: string };
    response: { success: boolean };
  };
  
  'POST /auth/otp/send': {
    body: { userId: string };
    response: { sent: boolean; expiresAt: string };
  };
  
  'POST /auth/otp/verify': {
    body: { userId: string; code: string };
    response: { verified: boolean; token: string };
  };
}
```

### User Management Endpoints
```typescript
// User Management API Endpoints
interface UserAPI {
  'GET /users': {
    query: { organizationId?: string; page?: number; limit?: number };
    response: { users: IUser[]; total: number; page: number };
  };
  
  'POST /users': {
    body: CreateUserData;
    response: { user: IUser };
  };
  
  'PUT /users/:id': {
    params: { id: string };
    body: Partial<IUser>;
    response: { user: IUser };
  };
  
  'DELETE /users/:id': {
    params: { id: string };
    response: { success: boolean };
  };
  
  'POST /users/invite': {
    body: UserInviteData;
    response: { invitationSent: boolean; invitationId: string };
  };
}
```

### VM Management Endpoints
```typescript
// VM Management API Endpoints
interface VMAPI {
  'GET /vm/templates': {
    response: { templates: VMTemplate[] };
  };
  
  'POST /vm/quotes': {
    body: CreateVMQuoteData;
    response: { quote: VMQuote };
  };
  
  'GET /vm/quotes/:id': {
    params: { id: string };
    response: { quote: VMQuote };
  };
  
  'POST /vm/provision': {
    body: { quoteId: string };
    response: { provisioningId: string; status: string };
  };
  
  'GET /vm/:id/metrics': {
    params: { id: string };
    query: { startTime: string; endTime: string };
    response: { metrics: VMMetrics };
  };
}
```

### Payment Endpoints
```typescript
// Payment API Endpoints
interface PaymentAPI {
  'POST /payments/initialize': {
    body: { amount: number; organizationId: string; description: string };
    response: { paymentUrl: string; reference: string };
  };
  
  'POST /payments/webhook': {
    body: PayStackWebhook;
    response: { processed: boolean };
  };
  
  'GET /payments/history': {
    query: { organizationId: string; page?: number; limit?: number };
    response: { payments: PaymentTransaction[]; total: number };
  };
  
  'POST /wallet/credit': {
    body: { organizationId: string; amount: number; description: string };
    response: { balance: WalletBalance };
  };
}
```

---

## Security Considerations

### Authentication Security
```mermaid
flowchart TD
    A[User Credentials] --> B[Rate Limiting]
    B --> C[Password Validation]
    C --> D[Multi-Factor Auth]
    D --> E[JWT Generation]
    E --> F[Secure Storage]
    
    G[Token Refresh] --> H[Rotation Policy]
    H --> I[Revocation List]
    I --> J[Session Management]
```

### Data Protection
- **Encryption at Rest**: All sensitive data encrypted using AES-256
- **Encryption in Transit**: TLS 1.3 for all communications
- **Key Management**: Secure key rotation and storage
- **Access Logging**: Complete audit trail for all data access

### Compliance Framework
- **GDPR Compliance**: Right to be forgotten, data portability
- **PCI DSS**: Payment card data protection
- **ISO 27001**: Information security management
- **SOC 2**: Security and availability controls

---

## Performance Optimisation

### Frontend Optimisation
```mermaid
graph LR
    A[Code Splitting] --> B[Lazy Loading]
    B --> C[Caching Strategy]
    C --> D[CDN Distribution]
    
    E[Bundle Analysis] --> F[Tree Shaking]
    F --> G[Minification]
    G --> H[Compression]
```

### Backend Optimisation
- **Database Indexing**: Optimised queries with proper indexes
- **Connection Pooling**: Efficient database connection management
- **Caching Layers**: Redis for session and application caching
- **Load Balancing**: Horizontal scaling with load distribution

### Monitoring & Alerting
- **Application Performance Monitoring**: Real-time performance tracking
- **Error Tracking**: Automated error detection and reporting
- **Custom Metrics**: Business-specific performance indicators
- **Automated Scaling**: Dynamic resource allocation

---

*This document represents the complete technical specification for the DCX Cloud Platform. It should be reviewed and updated with each major release cycle.*