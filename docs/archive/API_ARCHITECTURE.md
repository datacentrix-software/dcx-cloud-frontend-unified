# DCX Cloud Platform - API Architecture

## Overview
This document defines the clear separation of concerns and API boundaries for the DCX Cloud Platform.

## Service Architecture

### 1. **Core Backend Service** (`dcx-cloud-backend-unified`)
**Purpose**: Business logic, user management, and VM provisioning
**Base URL**: `https://dev.backend.test.daas.datacentrix.cloud`
**Responsibilities**:
- User authentication and authorization
- Organization and reseller management
- Wallet and billing operations
- VM provisioning requests
- Quote and product management

**API Endpoints**:
```
/api/auth/*                    - Authentication
/api/users/*                   - User management
/api/organisations/*           - Organization management
/api/vmwareintegration/*       - VM provisioning
/api/wallet/*                  - Wallet operations
/api/payments/*                - Payment processing
/api/quotes/*                  - Quote management
```

### 2. **VM Data Service** (MISSING - Needs Implementation)
**Purpose**: VM telemetry, metrics, and operational data
**Proposed Base URL**: `https://dev.vmdata.test.daas.datacentrix.cloud`
**Responsibilities**:
- VM performance metrics
- Billing data aggregation
- VM health monitoring
- Resource utilization tracking
- Historical data analytics

**Proposed API Endpoints**:
```
/api/vms/*                     - VM data retrieval
/api/metrics/*                 - Performance metrics
/api/billing/*                 - Billing data
/api/monitoring/*              - Health monitoring
/api/analytics/*               - Historical analytics
```

## Current Issues

### ❌ Problems with Current Implementation
1. **Frontend expects VM data from backend that only does provisioning**
2. **"Bronze" naming convention is meaningless and confusing**
3. **No clear service boundaries documented**
4. **Environment variables point to wrong services**

### ✅ Proposed Solutions
1. **Create dedicated VM Data Service OR implement data endpoints in existing backend**
2. **Establish clear naming conventions (see NAMING_CONVENTIONS.md)**
3. **Document service responsibilities clearly**
4. **Fix environment variable configuration**

## Service Communication Flow

```
Frontend → Core Backend      : Authentication, provisioning requests
Frontend → VM Data Service   : Metrics, billing data, monitoring
Core Backend → VM Data       : Provision completion notifications
VM Data → Core Backend       : Usage data for billing
```

## Environment Configuration

### Development
```env
NEXT_PUBLIC_BACKEND_URL=https://dev.backend.test.daas.datacentrix.cloud
NEXT_PUBLIC_VMDATA_URL=https://dev.vmdata.test.daas.datacentrix.cloud
```

### Production
```env
NEXT_PUBLIC_BACKEND_URL=https://api.daas.datacentrix.cloud
NEXT_PUBLIC_VMDATA_URL=https://vmdata.daas.datacentrix.cloud
```

## Next Steps
1. Decide: Separate VM Data Service OR extend existing backend
2. Implement missing VM data endpoints
3. Update frontend to use correct naming conventions
4. Create proper environment configuration

---
**Created**: 2025-01-06  
**Status**: Draft - Needs team approval  
**Priority**: HIGH - Blocking VM dashboard functionality