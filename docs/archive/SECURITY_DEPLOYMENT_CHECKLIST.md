# 🚨 CRITICAL SECURITY DEPLOYMENT CHECKLIST 🚨

## ⚠️ MUST BE COMPLETED BEFORE DEPLOYING TO STAGING/PRODUCTION ⚠️

This document lists all development-only features that MUST be removed before deployment.

---

## 🔴 HIGH PRIORITY - SECURITY VULNERABILITIES

### 1. **OTP Exposure in API Response** 
**File**: `nlu-platform-backend/src/controllers/usermanagement/user/auth/loginUser.ts`
**Lines**: 79-84
**Risk**: Exposes OTP codes in API responses
**Action**: Remove the entire `if (process.env.NODE_ENV === 'development')` block

### 2. **OTP Display in Frontend**
**File**: `dcx-cloud-frontend/src/app/auth/authForms/LoginForm.tsx`
**Lines**: 50-54
**Risk**: Shows OTP in browser alert
**Action**: Remove the entire `if (data.devOtp)` block

### 3. **Console Logging of Sensitive Data**
**File**: `nlu-platform-backend/src/utils/email/email.ts`
**Lines**: 63-74
**Risk**: Logs OTPs to console
**Action**: Remove or ensure emails are actually sent in production

---

## 🟡 MEDIUM PRIORITY - DEVELOPMENT FEATURES

### 4. **Environment Debug Logging**
**File**: `nlu-platform-backend/src/configs/passport.ts`
**Lines**: 6-11
**Risk**: Exposes environment configuration
**Action**: Remove console.log statements

### 5. **Axios Error Logging**
**File**: `dcx-cloud-frontend/src/utils/axios.js`
**Lines**: 10-11
**Risk**: May expose sensitive error details
**Action**: Ensure NODE_ENV check is working

---

## ✅ DEPLOYMENT VERIFICATION STEPS

Before deploying to production, verify:

1. [ ] Search codebase for "devOtp" - should return 0 results
2. [ ] Search codebase for "DEVELOPMENT MODE" - review all occurrences
3. [ ] Ensure NODE_ENV is set to "production" on all servers
4. [ ] Test OTP flow works with real emails (no console/UI display)
5. [ ] Review all TODO comments for deployment tasks
6. [ ] Run security audit: `npm audit`
7. [ ] Test with production-like environment variables

---

## 🛡️ SECURITY COMMANDS

```bash
# Search for development-only code
grep -r "devOtp" .
grep -r "DEVELOPMENT MODE" .
grep -r "NODE_ENV.*development" .

# Check for exposed secrets
grep -r "console.log.*[Oo][Tt][Pp]" .
grep -r "alert.*[Oo][Tt][Pp]" .
```

---

**Last Updated**: July 3, 2025
**Next Review**: Before ANY deployment
**Responsible**: DevOps Team & Security Team

⚠️ **FAILURE TO COMPLETE THIS CHECKLIST WILL RESULT IN SEVERE SECURITY VULNERABILITIES** ⚠️