# DCX Cloud Platform - Environment Configuration Standards

## Overview
Standardizes environment variable naming and configuration across all environments to eliminate confusion.

## Current Issues with Environment Variables

### ❌ **Confusing Current Names**
```env
# These names make no sense:
NEXT_PUBLIC_BRONZE_BASEURL=         # What is "Bronze"??
NEXT_PUBLIC_BACK_END_BASEURL=       # Inconsistent formatting
NEXT_PUBLIC_AI_RESPONSE_BASEURL=    # AI? What AI?
```

### ✅ **Proposed Clear Names**
```env
# Crystal clear purpose:
NEXT_PUBLIC_BACKEND_URL=            # Core business logic API
NEXT_PUBLIC_VMDATA_URL=             # VM data and metrics API  
NEXT_PUBLIC_AUTH_URL=               # Authentication service
NEXT_PUBLIC_BILLING_URL=            # Billing service
```

## Environment Standards

### Development Environment
```env
# Core Services
NEXT_PUBLIC_BACKEND_URL=https://dev.backend.test.daas.datacentrix.cloud
NEXT_PUBLIC_VMDATA_URL=https://dev.vmdata.test.daas.datacentrix.cloud
NEXT_PUBLIC_AUTH_URL=https://dev.auth.test.daas.datacentrix.cloud

# Database
DATABASE_URL=postgresql://dev_user:password@localhost:5432/dcx_dev
REDIS_URL=redis://localhost:6379

# External Services
VMWARE_API_URL=https://vcenter.dev.datacentrix.cloud
PAYMENT_GATEWAY_URL=https://api.paystack.co

# Feature Flags
ENABLE_VM_MONITORING=true
ENABLE_BILLING_ALERTS=true
ENABLE_DEBUG_LOGGING=true
```

### Production Environment
```env
# Core Services  
NEXT_PUBLIC_BACKEND_URL=https://api.daas.datacentrix.cloud
NEXT_PUBLIC_VMDATA_URL=https://vmdata.daas.datacentrix.cloud
NEXT_PUBLIC_AUTH_URL=https://auth.daas.datacentrix.cloud

# Database
DATABASE_URL=postgresql://prod_user:${SECRET}@db.daas.datacentrix.cloud:5432/dcx_prod
REDIS_URL=redis://cache.daas.datacentrix.cloud:6379

# External Services
VMWARE_API_URL=https://vcenter.datacentrix.cloud  
PAYMENT_GATEWAY_URL=https://api.paystack.co

# Feature Flags
ENABLE_VM_MONITORING=true
ENABLE_BILLING_ALERTS=true
ENABLE_DEBUG_LOGGING=false
```

## Service URL Mapping

### Current Broken Configuration
```typescript
// Frontend tries to call:
const vmDataUrl = process.env.NEXT_PUBLIC_BRONZE_BASEURL; 
// Points to: https://dev.backend.test.daas.datacentrix.cloud
// But backend doesn't have VM data endpoints!
```

### Fixed Configuration
```typescript
// Frontend should call:
const vmDataUrl = process.env.NEXT_PUBLIC_VMDATA_URL;
// Points to: https://dev.vmdata.test.daas.datacentrix.cloud  
// OR temporarily: same backend until VM data service is built
```

## Migration Plan

### Phase 1: Immediate Fix (Today)
```bash
# Current broken setup:
NEXT_PUBLIC_BRONZE_BASEURL=https://dev.backend.test.daas.datacentrix.cloud

# Temporary fix (until VM data service exists):
NEXT_PUBLIC_VMDATA_URL=https://dev.backend.test.daas.datacentrix.cloud

# Long-term fix (when VM data service is built):
NEXT_PUBLIC_VMDATA_URL=https://dev.vmdata.test.daas.datacentrix.cloud
```

### Phase 2: Clean Naming (This Week)
1. ❌ Remove all "BRONZE" references
2. ✅ Replace with descriptive service names
3. ✅ Update all configuration files
4. ✅ Update deployment scripts

### Phase 3: Service Separation (Future)
1. Create dedicated VM data service
2. Update production URLs  
3. Implement service discovery
4. Add health checks

## Configuration by Service

### Frontend (.env.local)
```env
# API Endpoints
NEXT_PUBLIC_BACKEND_URL=https://dev.backend.test.daas.datacentrix.cloud
NEXT_PUBLIC_VMDATA_URL=https://dev.backend.test.daas.datacentrix.cloud
NEXT_PUBLIC_CDN_URL=https://cdn.daas.datacentrix.cloud

# Authentication
NEXT_PUBLIC_AUTH_PROVIDER=custom
NEXT_PUBLIC_SESSION_TIMEOUT=3600

# Feature Flags
NEXT_PUBLIC_ENABLE_VM_DASHBOARD=true
NEXT_PUBLIC_ENABLE_RESELLER_PORTAL=true
NEXT_PUBLIC_ENABLE_BILLING_MODULE=true

# Development Only
NEXT_PUBLIC_ENABLE_DEBUG=true
NEXT_PUBLIC_MOCK_DATA=false
```

### Backend (.env)
```env
# Database
DATABASE_URL=postgresql://dev_2_user:password@localhost:5432/dcx_backend
REDIS_URL=redis://localhost:6379

# External APIs
VMWARE_VCENTER_URL=https://vcenter.dev.datacentrix.cloud
VMWARE_API_TOKEN=${VAULT_SECRET}
PAYSTACK_SECRET_KEY=${VAULT_SECRET}

# Service Configuration
PORT=8003
NODE_ENV=development
JWT_SECRET=${VAULT_SECRET}
SESSION_SECRET=${VAULT_SECRET}

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=${VAULT_SECRET}
SMTP_PASS=${VAULT_SECRET}

# Monitoring
SENTRY_DSN=${VAULT_SECRET}
LOG_LEVEL=debug
```

## Validation Rules

### ✅ **Good Environment Variable Names**
- Descriptive: `VMDATA_URL` not `BRONZE_URL`
- Consistent: All URLs end with `_URL`
- Hierarchical: `NEXT_PUBLIC_` prefix for frontend
- No abbreviations: `BACKEND` not `BE`

### ❌ **Bad Environment Variable Names**
- Cryptic: `BRONZE_BASEURL` (what is Bronze?)
- Inconsistent: `BACK_END_BASEURL` (underscores vs camelCase)
- Abbreviated: `BE_URL` (not clear)
- Versioned: `API_V1_URL` (version should be in path)

## Implementation Checklist

### Immediate Tasks
- [ ] Update .env.local files with new variable names
- [ ] Replace "BRONZE" references in frontend code
- [ ] Update Next.js config to use new variable names
- [ ] Test API connectivity with new configuration

### Short-term Tasks  
- [ ] Update deployment scripts
- [ ] Document new environment setup
- [ ] Create environment validation scripts
- [ ] Update team documentation

### Long-term Tasks
- [ ] Implement proper service discovery
- [ ] Add configuration validation
- [ ] Create automated environment setup
- [ ] Monitor configuration drift

---
**Created**: 2025-01-06  
**Status**: Implementation ready  
**Priority**: HIGH - Required for proper service communication