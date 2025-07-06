# DCX Cloud Platform - Service Boundaries

## Overview
Defines clear responsibilities and boundaries between services to eliminate architectural confusion.

## Current Service Analysis

### ✅ **Core Backend Service** (Exists & Working)
**Service**: `dcx-cloud-backend-unified`  
**Purpose**: Business logic and VM provisioning  
**Status**: ✅ Implemented and operational

**Responsibilities**:
- ✅ User authentication and session management
- ✅ Organization and reseller hierarchy management  
- ✅ Wallet operations and payment processing
- ✅ VM provisioning requests to VMware infrastructure
- ✅ Quote generation and product catalog
- ✅ Role-based access control (RBAC)

**Current Endpoints**:
```
/api/auth/*                 - Authentication ✅
/api/users/*               - User management ✅  
/api/organisations/*       - Organization CRUD ✅
/api/vmwareintegration/*   - VM provisioning ✅
/api/wallet/*              - Wallet operations ✅
/api/payments/*            - Payment processing ✅
/api/quotes/*              - Quote management ✅
```

### ❌ **VM Data Service** (MISSING - Critical Gap)
**Service**: Not implemented  
**Purpose**: VM operational data and metrics  
**Status**: ❌ **MISSING** - This is why dashboard shows 0 VMs

**Missing Responsibilities**:
- ❌ VM inventory and status tracking
- ❌ Performance metrics collection  
- ❌ Billing data aggregation
- ❌ Resource utilization monitoring
- ❌ VM lifecycle event tracking
- ❌ Historical data analytics

**Missing Endpoints** (Frontend expects these):
```
/api/vms/list              - Get all VMs for organization
/api/vms/{id}/details      - Get specific VM details  
/api/vms/{id}/metrics      - Get VM performance data
/api/billing/current       - Current billing period data
/api/billing/history       - Historical billing data
/api/monitoring/alerts     - VM alerts and notifications
```

## Service Communication Patterns

### ✅ **Working Flows** (Implemented)
```
Frontend → Core Backend:
  ✅ User login/authentication
  ✅ Organization management
  ✅ VM provisioning requests
  ✅ Wallet operations
  ✅ Payment processing
```

### ❌ **Broken Flows** (Not Implemented)
```
Frontend → VM Data Service:
  ❌ VM dashboard data
  ❌ Performance metrics
  ❌ Billing information
  ❌ Resource monitoring
```

## Data Flow Analysis

### VM Provisioning Flow (✅ Working)
```
1. User requests VM via frontend
2. Frontend calls Core Backend /api/vmwareintegration/provision
3. Core Backend validates wallet balance
4. Core Backend provisions VM via VMware API
5. Core Backend updates wallet balance
6. Frontend receives provisioning confirmation
```

### VM Dashboard Flow (❌ Broken)
```
1. User opens VM dashboard
2. Frontend calls VM Data Service /api/vms/list
3. ❌ SERVICE DOESN'T EXIST
4. Frontend shows "0 VMs found"
```

## Architecture Decision: Two Options

### Option A: Extend Core Backend (Recommended)
**Pros**:
- ✅ Simpler architecture (one service)
- ✅ Easier authentication/authorization
- ✅ Faster implementation
- ✅ Consistent data access patterns

**Cons**:
- ⚠️ Larger service responsibility
- ⚠️ May impact performance if data volume is high

**Implementation**:
```typescript
// Add to existing Core Backend
/api/vms/*              - VM data operations
/api/metrics/*          - Performance data  
/api/billing/data/*     - Billing information
```

### Option B: Separate VM Data Service
**Pros**:
- ✅ Clear separation of concerns
- ✅ Scalable for high data volumes
- ✅ Independent deployment
- ✅ Specialized for data operations

**Cons**:
- ❌ More complex architecture
- ❌ Additional authentication setup
- ❌ More deployment overhead
- ❌ Longer implementation time

## Current Problem Resolution

### **Immediate Fix Needed**
The frontend dashboard is broken because it expects VM data from a service that doesn't exist.

**Frontend Expectation**:
```typescript
// This is what frontend tries to call
const response = await axios.get(
  `${NEXT_PUBLIC_BRONZE_BASEURL}/api/cloud/currentBill`
);
```

**Reality**:
```bash
# This endpoint doesn't exist anywhere
curl https://dev.backend.test.daas.datacentrix.cloud/api/cloud/currentBill
# Returns: 404 Not Found
```

### **Solution Path**
1. **Immediate**: Implement missing VM data endpoints in Core Backend
2. **Short-term**: Create proper VM inventory tracking
3. **Long-term**: Decide on separate service if data volume requires it

## Responsibility Matrix

| Function | Core Backend | VM Data Service | Frontend |
|----------|-------------|-----------------|----------|
| Authentication | ✅ Owner | 🔄 Consumer | 🔄 Consumer |
| User Management | ✅ Owner | ❌ None | 🔄 Consumer |
| VM Provisioning | ✅ Owner | 📝 Notify | 🔄 Consumer |
| VM Data Retrieval | ❌ **MISSING** | 📝 Should Own | 🔄 Consumer |
| Performance Metrics | ❌ **MISSING** | 📝 Should Own | 🔄 Consumer |
| Billing Data | 🔄 Wallet Ops | ❌ **MISSING** | 🔄 Consumer |
| Organization Data | ✅ Owner | 🔄 Consumer | 🔄 Consumer |

**Legend**:
- ✅ Currently implemented and working
- ❌ Missing/not implemented  
- 🔄 Consumer of service
- 📝 Should implement

## Next Steps

### 1. **Immediate Action** (This Session)
- [ ] Implement basic VM data endpoints in Core Backend
- [ ] Create VM inventory tracking
- [ ] Fix frontend dashboard data calls

### 2. **Short-term** (This Week)  
- [ ] Add performance metrics collection
- [ ] Implement billing data aggregation
- [ ] Create proper monitoring dashboards

### 3. **Long-term** (Future)
- [ ] Evaluate need for separate VM Data Service
- [ ] Implement advanced analytics
- [ ] Add real-time monitoring capabilities

---
**Created**: 2025-01-06  
**Status**: Action Plan - Ready for implementation  
**Priority**: CRITICAL - Blocking core functionality