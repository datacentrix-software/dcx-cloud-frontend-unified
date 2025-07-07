# DCX Cloud Platform - Naming Conventions

## Overview
Establishes consistent naming standards across the entire DCX Cloud Platform to eliminate confusion and improve maintainability.

## URL and Endpoint Naming

### Base URL Standards
```
✅ GOOD: https://dev.backend.test.daas.datacentrix.cloud
✅ GOOD: https://dev.vmdata.test.daas.datacentrix.cloud
❌ BAD:  https://dev.bronze.test.daas.datacentrix.cloud (meaningless)
```

### API Endpoint Conventions
```
Pattern: /api/{domain}/{action}
Examples:
  /api/vms/list                 ✅ Clear purpose
  /api/users/authenticate       ✅ Clear purpose
  /api/billing/current          ✅ Clear purpose
  /api/cloud/currentBill        ❌ Unclear what "cloud" means
  /api/bronze/metricAggregation ❌ "Bronze" is meaningless
```

## Environment Variable Standards

### ✅ CLEAR Naming
```env
NEXT_PUBLIC_BACKEND_URL=          # Core business logic API
NEXT_PUBLIC_VMDATA_URL=           # VM metrics and data API
NEXT_PUBLIC_AUTH_URL=             # Authentication service
NEXT_PUBLIC_BILLING_URL=          # Billing service
```

### ❌ CONFUSING Naming (Current Issues)
```env
NEXT_PUBLIC_BRONZE_BASEURL=       # What is "Bronze"?? 
NEXT_PUBLIC_BACK_END_BASEURL=     # Inconsistent formatting
NEXT_PUBLIC_AI_RESPONSE_BASEURL=  # Not descriptive
```

## Service Domain Naming

### Primary Domains
- **backend** - Core business logic and user management
- **vmdata** - Virtual machine data and metrics
- **auth** - Authentication and authorization 
- **billing** - Billing and payment processing
- **monitoring** - System health and alerts

### ❌ Avoid These Terms
- "bronze", "silver", "gold" - No business meaning
- "api", "service", "system" - Too generic
- "v1", "v2" - Version in URL path, not subdomain
- "test", "dev" - Environment should be prefix

## Database Naming

### Table Naming
```sql
✅ GOOD:
  users                    -- Clear, plural
  organizations           -- Clear, plural  
  virtual_machines        -- Clear, descriptive
  billing_records         -- Clear purpose

❌ BAD:
  User                    -- Should be lowercase
  orgs                    -- Too abbreviated
  vms                     -- Not descriptive enough
  bronze_data             -- "Bronze" is meaningless
```

### Column Naming
```sql
✅ GOOD:
  user_id, organization_id, created_at, vm_cpu_cores

❌ BAD:
  userId, orgId, createdAt, vmCPU
```

## File and Directory Naming

### Frontend Structure
```
✅ GOOD:
  src/services/vmData/
  src/services/billing/
  src/components/dashboard/vm/
  src/types/VirtualMachine.ts

❌ BAD:
  src/services/bronze/
  src/services/resellerApi.ts  (too specific)
  src/components/nlu/          (what is "nlu"?)
```

### Backend Structure
```
✅ GOOD:
  src/controllers/vm/
  src/controllers/billing/
  src/routes/vm/
  src/services/vmware/

❌ BAD:
  src/controllers/infrastructure/vmware/  (too nested)
  src/routes/provision/vmware/            (inconsistent)
```

## Function and Variable Naming

### ✅ Descriptive Functions
```typescript
fetchVirtualMachineMetrics()
authenticateUser()
calculateBillingAmount()
provisionVirtualMachine()
```

### ❌ Unclear Functions (Current Issues)
```typescript
getBronzeData()           // What is "bronze data"?
fetchCloudMetrics()       // "Cloud" is too generic
getVMData()              // Too abbreviated
```

## Component Naming

### React Components
```typescript
✅ GOOD:
  VirtualMachineList
  BillingDashboard
  UserAuthenticationForm
  OrganizationSelector

❌ BAD:
  VMList               // Too abbreviated
  CustomerDashboard    // Too generic
  NLUDashboard        // What is "NLU"?
```

## API Response Standards

### ✅ Consistent Response Structure
```json
{
  "success": true,
  "data": {...},
  "message": "Virtual machines retrieved successfully",
  "timestamp": "2025-01-06T10:30:00Z"
}
```

### ✅ Clear Error Responses
```json
{
  "success": false,
  "error": {
    "code": "VM_NOT_FOUND",
    "message": "Virtual machine with ID vm-12345 not found",
    "details": {...}
  },
  "timestamp": "2025-01-06T10:30:00Z"
}
```

## Implementation Priority

### Phase 1: Critical Fixes (Immediate)
1. ❌ Remove all "Bronze" references
2. ❌ Replace with clear service names
3. ✅ Update environment variables
4. ✅ Document current endpoint purposes

### Phase 2: Standardization (This Week)
1. Rename all unclear endpoints
2. Establish consistent database naming
3. Refactor component names
4. Update documentation

### Phase 3: Enforcement (Ongoing)
1. Code review standards
2. Automated naming validation
3. Documentation updates
4. Team training

## Migration Plan from Current "Bronze" System

### Step 1: Identify Current "Bronze" Usage
```bash
# Find all "bronze" references
grep -r "bronze\|Bronze\|BRONZE" src/
```

### Step 2: Replace with Clear Names
```typescript
// ❌ BEFORE
NEXT_PUBLIC_BRONZE_BASEURL

// ✅ AFTER  
NEXT_PUBLIC_VMDATA_URL
```

### Step 3: Update API Calls
```typescript
// ❌ BEFORE
/api/cloud/currentBill

// ✅ AFTER
/api/billing/current
```

---
**Created**: 2025-01-06  
**Status**: Draft - Needs implementation  
**Priority**: HIGH - Required for architectural clarity