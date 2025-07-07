# Architecture Decision Record - Multi-Database Strategy

## Decision Date: July 5, 2025
## Status: CONFIRMED - Well-designed architecture validated
## Decision Maker: Garsen (Project Lead) + Claude (Technical Analysis)

---

## 🎯 CONTEXT & QUESTION

During wallet system integration, we discovered a **multi-database architecture** and questioned whether this separation was beneficial or unnecessarily complex:

- **Main Database**: `datacentrix_cloud_local`
- **AAS Database**: `aas_product_local` 
- **E-Networks Database**: `enetworks_product_local`

**Key Question**: Should wallet system be moved to AAS database or remain in main database?

---

## 📊 ARCHITECTURAL ANALYSIS

### **Database Purpose Analysis:**

#### **MAIN DATABASE (`datacentrix_cloud_local`) - Multi-tenant Application Core**
**Purpose**: Cross-service platform management
**Contains**:
- **Identity & Access**: Users (18), Organisations (11), Roles (3), Permissions (15)
- **Multi-tenant Security**: UserRole assignments, UserActivityLog
- **Cross-service Business**: Quotes (5), VM Quotes (7), Customer Cards
- **Financial Management**: OrganisationWallet (1), wallet_transactions (0)
- **Operational Data**: VMLogs, DiskLogs, in_app_alerts

#### **AAS DATABASE (`aas_product_local`) - Cloud Service Catalog**
**Purpose**: "As a Service" product definitions and pricing
**Contains**:
- **Product Catalog**: Categories (10), Products (39) with pricing/margins
- **VM Templates**: terraform_vm_config (24) - provisioning configurations
- **Service Pricing**: Cost, profit margins for IaaS offerings

#### **E-NETWORKS DATABASE (`enetworks_product_local`) - Network Service Catalog**
**Purpose**: Network connectivity services and pricing
**Contains**:
- **Network Products**: bandwidth_costs, liquid_costs, liquid_cpe
- **Provider Integration**: dfa_hellios, dfa_megallan, mfn tables
- **Network Pricing**: Different cost structures per provider

---

## 🔍 ARCHITECTURAL EVALUATION

### **✅ SEPARATION IS STRATEGICALLY SOUND**

#### **1. Service Isolation & Scalability**
```
┌─────────────────────────────────────────────┐
│  MAIN DATABASE (Multi-tenant Platform)     │
│  ├── Customer Identity & Access            │
│  ├── Cross-service Wallet & Billing ⭐     │
│  ├── Multi-service Quotes                  │
│  └── Platform Security & Logs              │
└─────────────────────────────────────────────┘
           │ (Cross-DB Queries)
    ┌──────┴──────┐
    ▼             ▼
┌─────────┐   ┌─────────────┐
│   AAS   │   │ E-NETWORKS  │
│ Service │   │   Service   │
│ Catalog │   │   Catalog   │
└─────────┘   └─────────────┘
```

#### **2. Cross-Service Financial Management**
**Wallet in MAIN enables**:
- ✅ AAS VM purchases deduct from wallet
- ✅ E-Networks bandwidth purchases deduct from wallet  
- ✅ Future service purchases (SaaS, PaaS) deduct from wallet
- ✅ Unified customer balance across all services
- ✅ Cross-service transaction history

**If wallet was in AAS**:
- ❌ E-Networks couldn't access wallet balance
- ❌ Cross-service billing impossible
- ❌ Fragmented customer financial experience

#### **3. Business Logic Alignment**
- **Main Database**: "WHO can do WHAT with HOW MUCH money"
- **AAS Database**: "WHAT cloud services cost HOW MUCH"  
- **E-Networks Database**: "WHAT network services cost HOW MUCH"

#### **4. Operational Benefits**
- **Independent Scaling**: Each service catalog scales separately
- **Security Isolation**: Product pricing isolated from customer data
- **Performance Optimization**: Queries optimized per service type
- **Flexibility**: Easy to add new service catalogs (SaaS, PaaS, etc.)

---

## 💡 DECISION: RETAIN MULTI-DATABASE ARCHITECTURE

### **Wallet Placement: MAIN DATABASE** ✅

**Rationale**:
1. **Cross-service Integration**: Wallet must support ALL service types
2. **Customer-centric**: Wallet belongs with customer identity/organization data
3. **Financial Integrity**: Unified billing across multiple service catalogs
4. **Scalability**: Architecture supports unlimited future service types

### **Integration Strategy: Cross-Database Queries**

**For Pricing Lookups**:
```typescript
// Example: VM Provisioning with Cross-DB Integration
async function provisionVM(vmSpec: VMSpec, organisationId: string) {
  // 1. Get pricing from AAS database
  const pricing = await aasDb.getVMPricing(vmSpec);
  
  // 2. Validate wallet balance in MAIN database  
  const wallet = await mainDb.getWalletBalance(organisationId);
  
  // 3. Process transaction in MAIN database
  if (wallet.balance >= pricing.totalCost) {
    await mainDb.createWalletTransaction({
      organisationId,
      amount: -pricing.totalCost,
      type: 'debit',
      description: `VM Provisioning: ${vmSpec.description}`
    });
  }
}
```

---

## 🏗️ IMPLEMENTATION APPROACH

### **Phase 1: Complete Wallet System in Main Database** ⏳
- ✅ Fix schema constraints (completed)
- ⏳ Enable wallet routes and testing
- ⏳ Implement cross-database pricing integration

### **Phase 2: Cross-Service Integration**
- Implement AAS product pricing lookups
- Implement E-Networks service pricing lookups
- Create unified billing APIs

### **Phase 3: Future Service Integration**
- Design pattern for adding new service catalogs
- Standardize cross-database query patterns
- Implement service registry for dynamic integration

---

## 📚 LESSONS LEARNED

### **Architectural Insights**
1. **Multi-database ≠ Poor Design**: Can be strategically sound for service separation
2. **Wallet Placement Critical**: Must align with business model (cross-service billing)
3. **Service Catalog Isolation**: Enables independent scaling and pricing strategies
4. **Cross-DB Integration**: Manageable with proper query patterns

### **Technical Insights**
1. **Question Assumptions**: Initial reaction was "too complex" - analysis proved otherwise
2. **Business Logic Drives Architecture**: Financial model determines data placement
3. **Leadership Through Analysis**: Deep investigation prevents costly refactoring

---

## 🎯 SUCCESS METRICS

### **Architectural Validation**
- [x] Multi-database purpose clearly defined
- [x] Wallet placement rationale documented  
- [x] Cross-service billing strategy confirmed
- [x] Scalability path identified

### **Implementation Readiness**
- [x] Database schema conflicts resolved
- [x] Integration patterns defined
- [x] TDD approach confirmed for implementation

---

## 🚀 NEXT ACTIONS

1. **Complete wallet system implementation** in main database
2. **Implement cross-database pricing queries** for AAS integration
3. **Document integration patterns** for future service catalogs
4. **Create service registry** for dynamic service discovery

---

## 📝 DECISION IMPACT

**Positive Outcomes**:
- ✅ Scalable architecture for multi-service platform
- ✅ Clean separation of concerns
- ✅ Unified customer financial experience
- ✅ Future-proofed for additional services

**Potential Challenges**:
- Cross-database query complexity
- Transaction coordination across databases
- Network latency for cross-DB operations

**Mitigation Strategies**:
- Implement connection pooling
- Cache frequently accessed pricing data
- Use async patterns for cross-DB queries
- Monitor query performance

---

**APPROVED**: Architecture validated and confirmed for production implementation.

**NEXT PHASE**: Continue TDD implementation of wallet system in main database with cross-service integration.