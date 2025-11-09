#!/bin/bash

# Game Recharge Platform - Seed Runner
# This script loads environment variables and runs the seed script

set -e

echo "🌱 Game Recharge Platform - Database Seed Runner"
echo "=================================================="

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "❌ .env.local file not found!"
    echo "Please make sure .env.local exists in the project root."
    exit 1
fi

# Load environment variables
echo "📝 Loading environment variables from .env.local..."
set -a
source .env.local
set +a

# Verify required variables
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "❌ Missing required environment variables!"
    echo "Please check your .env.local file contains:"
    echo "   NEXT_PUBLIC_SUPABASE_URL"
    echo "   SUPABASE_SERVICE_ROLE_KEY"
    exit 1
fi

echo "✅ Environment variables loaded successfully"

# Run the seed script
echo "🚀 Running seed script..."
echo ""

if command -v npx &> /dev/null; then
    # Use npx if available
    NEXT_PUBLIC_SUPABASE_URL="$NEXT_PUBLIC_SUPABASE_URL" \
    SUPABASE_SERVICE_ROLE_KEY="$SUPABASE_SERVICE_ROLE_KEY" \
    npx tsx scripts/seed-executable.ts
elif command -v tsx &> /dev/null; then
    # Use tsx directly if available
    NEXT_PUBLIC_SUPABASE_URL="$NEXT_PUBLIC_SUPABASE_URL" \
    SUPABASE_SERVICE_ROLE_KEY="$SUPABASE_SERVICE_ROLE_KEY" \
    tsx scripts/seed-executable.ts
else
    echo "❌ No suitable TypeScript runtime found!"
    echo "Please install tsx: pnpm add -g tsx or npm install -g tsx"
    exit 1
fi

echo ""
echo "🎉 Seed process completed!"