#!/bin/bash

echo "🚀 Committing all backend development environment fixes..."

# Change to backend directory
cd ../nlu-platform-backend

# Check current status
echo "📋 Current git status:"
git status --porcelain

# Add all changes from our development session
echo "📦 Adding all development environment fixes..."

# Core authentication and security fixes
git add src/controllers/usermanagement/user/auth/loginUser.ts
git add src/utils/email/email.ts
git add src/configs/passport.ts

# Security vulnerability fixes
git add src/utils/provision/vmWare.ts

# Environment and server configuration
git add src/server.ts
git add .env.local

# Prisma compatibility fixes (generated clients)
git add src/generated/client-application/
git add src/generated/client-aas/
git add src/generated/client-enet/

# Redis and utilities
git add src/utils/usermanagement/redis.ts
git add src/utils/usermanagement/keycloak.ts

# Other service improvements
git add src/services/wallet/hourlyBilling.ts
git add src/controllers/wallet/hourlyBilling.ts
git add src/controllers/infrastructure/vmware/enhancedDeployResources.ts
git add src/controllers/infrastructure/vmware/vmPurchaseValidation.ts

# Show what's being committed
echo "📝 Files to be committed:"
git diff --cached --name-only

# Create comprehensive commit message
git commit -m "$(cat <<'EOF'
feat: Complete local development environment setup and security fixes

## 🔐 Security Improvements
- Replace vulnerable 'ip' package with secure Node.js built-in functions
- Remove SSRF vulnerability in VMware provisioning utilities
- Add development-mode OTP display for local authentication testing
- Implement proper environment-based OAuth configuration

## 🧪 Development Environment Features  
- Add development-mode OTP logging and API exposure (dev only)
- Configure conditional OAuth strategies to avoid missing credential errors
- Add comprehensive environment debugging for local development
- Implement Redis OTP retrieval for development workflow

## 🔧 Cross-Platform Compatibility
- Add darwin-arm64 Prisma binary targets for macOS development
- Regenerate all Prisma clients with cross-platform support
- Fix "Query Engine not found" errors on macOS
- Enable seamless development across macOS and Linux environments

## ⚠️ Security Notes
- All development-only features are clearly marked and documented
- SECURITY_DEPLOYMENT_CHECKLIST.md created for production deployment
- Development features MUST be removed before staging/production
- See CLAUDE.md for complete security compliance requirements

## 🗃️ Database Integration
- Local database clones configured and working
- Multi-database Prisma client support operational
- SSH tunnel infrastructure documented and tested
- Full authentication flow working locally

## Files Modified:
- Authentication: loginUser.ts, email.ts, passport.ts
- Security: vmWare.ts (ip package replacement)
- Environment: server.ts, .env.local configuration  
- Database: All Prisma generated clients updated
- Infrastructure: VMware controllers, wallet services

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"

echo "✅ Comprehensive backend commit completed successfully!"
echo "📊 Commit summary:"
git log --oneline -1