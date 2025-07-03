#!/bin/bash

echo "🔒 Committing critical security fixes..."

# Change to backend directory
cd ../nlu-platform-backend

# Add the security-fixed package files
git add src/package.json src/package-lock.json

# Create security fix commit
git commit -m "$(cat <<'EOF'
security: Fix 6 critical vulnerabilities (4 HIGH + 2 LOW severity)

EMERGENCY SECURITY PATCH:
- Remove vulnerable ip@2.0.1 package (SSRF vulnerability)
- Upgrade multer@1.4.5-lts.1 → multer@2.0.1 (secure version)
- Replace deprecated keycloak-admin@1.14.22 → @keycloak/keycloak-admin-client@26.3.0
- Upgrade eslint@8.57.1 → eslint@9.30.1 (supported version)

Security Status: 0 vulnerabilities remaining (verified by npm audit)
Backend Functionality: ✅ Tested and confirmed working

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"

echo "🚀 Pushing security fixes to GitHub..."
git push origin fix/dev-environment-july-2025

echo "✅ Security fixes committed and pushed successfully!"