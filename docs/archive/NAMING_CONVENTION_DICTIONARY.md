# DCX Cloud Naming Convention Dictionary

## Created: July 5, 2025
## Purpose: Standardize naming across Database, API, Frontend, and Business Logic

This document establishes the **single source of truth** for naming conventions across the entire DCX Cloud platform.

---

## 🎯 STRATEGIC TIMING RECOMMENDATION

**RECOMMENDATION: Document now, harmonize in Phase 3**

### Why This Timing:
1. **Current Priority**: Get wallet system functional for revenue protection
2. **Risk Mitigation**: Naming changes during active development could break working systems
3. **Comprehensive Approach**: Better to harmonize all at once with proper testing

### Implementation Strategy:
- **Phase 2**: Document current inconsistencies 
- **Phase 3**: Create harmonization migration plan
- **Phase 4**: Execute coordinated rename across all layers

---

## 🏗️ CURRENT NAMING INCONSISTENCIES IDENTIFIED

### **VM Specification Properties**
| **Context** | **CPU Property** | **Memory Property** | **Storage Property** |
|-------------|------------------|---------------------|----------------------|
| **Frontend Interface** | `cpuCores` ✅ | `memoryGB` ✅ | `diskSizeGB` ✅ |
| **Original Wallet Services** | `cpu` ❌ | `memory` ❌ | `storage` ❌ |
| **Database Schema** | `vcpu_count` ❌ | `memory_gb` ❌ | `disk_size_gb` ❌ |
| **vCenter API** | `numCPUs` ❌ | `memoryMB` ❌ | `diskGB` ❌ |

### **Wallet/Transaction Properties**
| **Context** | **Wallet ID** | **Organisation Reference** | **Transaction Array** |
|-------------|---------------|----------------------------|----------------------|
| **Database** | `walletId` | `organisationId` | `wallet_transactions` |
| **API Response** | `wallet_id` | `organization_id` | `transactions` |
| **Frontend** | `walletId` | `organisationId` | `walletTransactions` |
| **Prisma Model** | `walletId` | `organisationId` | `wallet_transactions` |

### **Authentication Properties**
| **Context** | **User ID** | **Email Field** | **Token Property** |
|-------------|-------------|-----------------|-------------------|
| **JWT Payload** | `id` | `email` | `token` |
| **Database** | `user_id` | `email` | `access_token` |
| **Frontend Store** | `userId` | `email` | `accessToken` |
| **API Response** | `user_id` | `email` | `access_token` |

---

## 🎯 PROPOSED STANDARD CONVENTIONS

### **1. Property Naming Standard: camelCase for Code, snake_case for Database**

**Frontend/TypeScript/JavaScript:**
```typescript
interface VMSpecification {
  cpuCores: number;        // ✅ Standard
  memoryGB: number;        // ✅ Standard  
  diskSizeGB: number;      // ✅ Standard
  diskType: string;        // ✅ Standard
  networkTier: string;     // ✅ Standard
  operatingSystem: string; // ✅ Standard
}
```

**Database/SQL:**
```sql
CREATE TABLE vm_specifications (
  cpu_cores INTEGER,       -- ✅ Standard
  memory_gb INTEGER,       -- ✅ Standard
  disk_size_gb INTEGER,    -- ✅ Standard  
  disk_type VARCHAR,       -- ✅ Standard
  network_tier VARCHAR,    -- ✅ Standard
  operating_system VARCHAR -- ✅ Standard
);
```

**API Responses (JSON):**
```json
{
  "cpuCores": 4,           // ✅ Standard (camelCase in JSON)
  "memoryGB": 8,           // ✅ Standard
  "diskSizeGB": 100        // ✅ Standard
}
```

### **2. ID Field Standards**

**Primary Keys:**
- Database: `id` (UUID)
- API/Frontend: `id`

**Foreign Keys:**
- Database: `{table_name}_id` (e.g., `organisation_id`, `wallet_id`)
- API/Frontend: `{tableName}Id` (e.g., `organisationId`, `walletId`)

### **3. Relationship Naming**

**One-to-Many Relationships:**
- Database: `{parent_table}` → `{child_table}s` 
- Frontend: `{parentTable}` → `{childTable}s`
- Example: `organisation` → `wallet_transactions` (DB), `organisation` → `walletTransactions` (Frontend)

### **4. Boolean Field Standards**

**Prefixes:**
- `is{Condition}`: `isActive`, `isVerified`, `isEnabled`
- `has{Feature}`: `hasWallet`, `hasAccess`, `hasPermission`
- `can{Action}`: `canEdit`, `canDelete`, `canApprove`

### **5. Enum Standards**

**Format:** PascalCase for values
```typescript
enum TransactionType {
  Credit = "credit",
  Debit = "debit", 
  Topup = "topup",
  Refund = "refund",
  Adjustment = "adjustment"
}
```

---

## 🚧 IDENTIFIED ISSUES REQUIRING HARMONIZATION

### **Critical Issues (Revenue Impact):**
1. **VM Provisioning API**: Uses `cpu`/`memory` but frontend expects `cpuCores`/`memoryGB`
2. **Wallet Transaction Arrays**: Database uses `wallet_transactions[]` but some APIs return `transactions[]`
3. **Currency Fields**: Inconsistent decimal places (cents vs currency units)

### **Medium Issues (UX Impact):**
1. **Date/Time Formats**: Mixed ISO strings, timestamps, and Date objects
2. **Error Response Structure**: Inconsistent error message formats
3. **Pagination Parameters**: Mixed `page`/`offset` and `limit`/`size` patterns

### **Low Issues (Developer Experience):**
1. **Import Path Standards**: Relative vs absolute imports
2. **Component Naming**: Mixed PascalCase and camelCase
3. **Test File Naming**: Mixed `.test.` and `.spec.` extensions

---

## 📋 HARMONIZATION IMPLEMENTATION PLAN

### **Phase 3.1: Database Schema Standardization (1-2 hours)**
- Rename inconsistent database columns
- Update Prisma models to match
- Generate new Prisma clients
- Test database connections

### **Phase 3.2: API Response Standardization (2-3 hours)**  
- Create response transformation layer
- Update all API endpoints to use standard naming
- Update frontend API call expectations
- Test end-to-end data flow

### **Phase 3.3: Frontend Property Harmonization (1-2 hours)**
- Update all TypeScript interfaces
- Rename component props consistently  
- Update store property names
- Test all UI components

### **Phase 3.4: Cross-Layer Integration Testing (1 hour)**
- Run full end-to-end tests
- Validate wallet system still works
- Test VM provisioning flow
- Verify authentication flow

---

## 🎯 SUCCESS METRICS FOR HARMONIZATION

### **Completion Criteria:**
- [ ] All VM-related properties use consistent naming across layers
- [ ] All wallet properties follow camelCase (frontend) / snake_case (database) standard
- [ ] All API responses use consistent structure and naming
- [ ] All TypeScript interfaces compile without property mismatches
- [ ] All database relationships use consistent naming patterns
- [ ] All tests pass with new naming conventions

### **Quality Gates:**
- [ ] Zero TypeScript compilation errors
- [ ] Zero database constraint violations  
- [ ] 100% API endpoint compatibility maintained
- [ ] All existing functionality preserved
- [ ] Performance impact < 5% (acceptable overhead for transformation)

---

## 📚 NAMING DICTIONARY REFERENCE

### **VM/Infrastructure Terms**
| **Concept** | **Standard Name** | **Database** | **API/Frontend** |
|-------------|-------------------|--------------|------------------|
| CPU Count | CPU Cores | `cpu_cores` | `cpuCores` |
| Memory Amount | Memory GB | `memory_gb` | `memoryGB` |
| Disk Size | Disk Size GB | `disk_size_gb` | `diskSizeGB` |
| Disk Type | Disk Type | `disk_type` | `diskType` |
| Network Tier | Network Tier | `network_tier` | `networkTier` |
| OS | Operating System | `operating_system` | `operatingSystem` |

### **Wallet/Financial Terms**
| **Concept** | **Standard Name** | **Database** | **API/Frontend** |
|-------------|-------------------|--------------|------------------|
| Wallet ID | Wallet Identifier | `wallet_id` | `walletId` |
| Balance | Account Balance | `balance` | `balance` |
| Transaction | Transaction Record | `wallet_transactions` | `walletTransactions` |
| Top-up | Account Top-up | `topup_amount` | `topupAmount` |
| Threshold | Balance Threshold | `balance_threshold` | `balanceThreshold` |

### **User/Auth Terms**
| **Concept** | **Standard Name** | **Database** | **API/Frontend** |
|-------------|-------------------|--------------|------------------|
| User ID | User Identifier | `user_id` | `userId` |
| Organisation ID | Organisation Identifier | `organisation_id` | `organisationId` |
| Access Token | Authentication Token | `access_token` | `accessToken` |
| Refresh Token | Refresh Token | `refresh_token` | `refreshToken` |

---

## 🔄 ROLLBACK STRATEGY

If harmonization causes issues:

1. **Database Rollback**: Restore from pre-harmonization backup
2. **API Rollback**: Revert to previous endpoint versions  
3. **Frontend Rollback**: Git revert to last known good commit
4. **Full System Rollback**: Restore complete system state using rollback-safety directory

---

**Next Steps**: Continue with Phase 2.2 (Schema Migration) using current naming, implement harmonization in Phase 3 with proper testing and rollback safety.