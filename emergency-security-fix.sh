#!/bin/bash

echo "🚨 EMERGENCY SECURITY FIX - HIGH SEVERITY VULNERABILITIES"
echo "=========================================================="

# Change to backend src directory
cd ../nlu-platform-backend/src

echo "📋 Current vulnerabilities identified:"
echo "1. ip@2.0.1 - SSRF vulnerability (same as frontend)"
echo "2. multer@1.4.5-lts.1 - Multiple vulnerabilities"
echo "3. keycloak-admin@1.14.22 - Deprecated, moved to new package"
echo "4. eslint@8.57.1 - No longer supported"

echo ""
echo "🔧 FIXING VULNERABILITIES..."

# 1. Remove vulnerable ip package (same as frontend)
echo "❌ Removing vulnerable 'ip' package..."
npm uninstall ip

# 2. Update multer to secure version
echo "🔄 Updating multer to secure version..."
npm install multer@2.0.1

# 3. Update keycloak-admin to new package
echo "🔄 Updating keycloak-admin to new secure package..."
npm uninstall keycloak-admin
npm install @keycloak/keycloak-admin-client@^26.0.0

# 4. Update ESLint to supported version
echo "🔄 Updating ESLint to supported version..."
npm install eslint@^9.27.0

echo ""
echo "🔍 Running security audit..."
npm audit --audit-level=moderate

echo ""
echo "✅ Emergency security fixes completed!"
echo "📝 Please review the changes and test the application"