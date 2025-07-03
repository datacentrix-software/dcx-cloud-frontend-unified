#!/bin/bash

echo "🚀 Safely committing backend Prisma compatibility fixes..."

# Change to backend directory
cd ../nlu-platform-backend

# Check current status
echo "📋 Current git status:"
git status --porcelain

# Add only the safe Prisma schema files
echo "📦 Adding Prisma schema files with cross-platform compatibility..."
git add src/prisma/aas/schema.prisma
git add src/prisma/application/schema.prisma
git add src/prisma/enet/schema.prisma

# Show what's being committed
echo "📝 Files to be committed:"
git diff --cached --name-only

# Create the commit
git commit -m "$(cat <<'EOF'
fix: Add cross-platform Prisma binary targets for macOS compatibility

- Add darwin-arm64 and debian-openssl-3.0.x binary targets to all Prisma schemas
- Enables Prisma client generation on both macOS (local dev) and Linux (production)
- Fixes "Query Engine for runtime darwin-arm64" not found errors
- Ensures compatibility across development and deployment environments

Files updated:
- src/prisma/aas/schema.prisma
- src/prisma/application/schema.prisma  
- src/prisma/enet/schema.prisma

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"

echo "✅ Backend commit completed successfully!"