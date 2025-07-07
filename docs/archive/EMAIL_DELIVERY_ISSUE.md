# Email Delivery Issue - Mimecast SMTP Authentication Failure

## Summary
The DCX Cloud Frontend authentication system is fully functional, but OTP emails are not being delivered to users due to Mimecast SMTP authentication failures on the test server.

## Issue Details

### What's Working
- ✅ **OTP Generation**: System generates and stores OTPs correctly in Redis
- ✅ **OTP Verification**: Users can authenticate when provided with the OTP
- ✅ **SMTP Configuration**: Credentials and configuration match working backend
- ✅ **Network Connectivity**: Can connect to Mimecast SMTP server on port 587
- ✅ **SMTP Handshake**: Basic SMTP protocol communication works

### What's Failing
- ❌ **SMTP Authentication**: Mimecast returns "535 Incorrect authentication data" error
- ❌ **Email Delivery**: No emails reach user inboxes

## Technical Investigation

### Error Message
```
📧 EMAIL ERROR: Error: Invalid login: 535 Incorrect authentication data - https://community.mimecast.com/docs/DOC-1369#535 [X3s4-JwzMKiSSlewfZerag.za123]
```

### Configuration Comparison
**Test Server (DaaS-DEV-2, Port 2423)** - NOT WORKING:
```
EMAIL_HOST=za-smtp-outbound-1.mimecast.co.za
EMAIL_HOST_USER_OTP=otp@datacentrix.co.za
EMAIL_HOST_PASSWORD_OTP=zeJikU9bic^Zkvv#@LM3
EMAIL_PORT=587
```

**Working Backend Server (Port 2429)** - WORKING:
```
EMAIL_HOST='za-smtp-outbound-1.mimecast.co.za'
EMAIL_HOST_USER_OTP='otp@datacentrix.co.za'
EMAIL_HOST_PASSWORD_OTP='zeJikU9bic^Zkvv#@LM3'
EMAIL_PORT='587'
```

**Credentials are IDENTICAL** - The issue is not with the configuration.

### Network Analysis
Both servers:
- Connect to same external IP (45.220.228.16) 
- Can establish SMTP connections to Mimecast
- But get routed to different Mimecast servers:
  - Test server: `za12` cluster
  - Working server: `za26` cluster

## Likely Root Causes

### 1. IP/Route Whitelisting
The `otp@datacentrix.co.za` account may only be authorized to send from specific network routes or source IPs. The working backend (port 2429) may have different NAT rules or routing that's whitelisted in Mimecast.

### 2. Firewall Rules
SMTP authentication might be blocked by firewall rules specific to the test server (port 2423), while port 2429 has the necessary rules in place.

### 3. Mimecast Server Affinity
Different Mimecast server clusters (`za12` vs `za26`) may have different authentication policies or the account may only be provisioned on specific clusters.

## Required Actions

### For Network/Infrastructure Team:
1. **Compare NAT/Firewall Rules**:
   - Check if port 2423 server has the same outbound SMTP rules as port 2429
   - Verify if IP whitelisting is needed in Mimecast for the test server's route

2. **Mimecast Configuration Check**:
   - Verify if `otp@datacentrix.co.za` account is authorized for SMTP from test server
   - Check if IP/route whitelisting is required in Mimecast admin panel
   - Confirm if there are any restrictions on which servers can use these credentials

3. **Network Route Analysis**:
   - Compare outbound routing for ports 2423 vs 2429
   - Check if they use different egress IPs or routing policies

### For Security Team:
1. **Mimecast Account Permissions**:
   - Verify `otp@datacentrix.co.za` has SMTP sending privileges
   - Check if multi-factor authentication or additional security is required
   - Confirm password hasn't expired or been changed

## Temporary Workaround Implemented

Until the email delivery is resolved, we've implemented a development workaround:
- OTPs are generated and stored in Redis as normal
- For testing purposes, OTPs can be retrieved manually from Redis
- This allows development and testing to continue without blocking the authentication flow

## Testing Instructions

To test the fix once implemented:
1. Attempt login with valid credentials
2. Check that OTP email arrives in user's inbox
3. Verify OTP from email works for authentication
4. Confirm no console errors related to SMTP

## Priority
**HIGH** - This blocks production deployment as users cannot receive authentication emails.

---
**Created**: July 5, 2025  
**Server**: DaaS-DEV-2 (45.220.228.16:2423)  
**Contact**: Development Team via Claude Code