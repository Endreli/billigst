#!/bin/bash
# Vercel build script — switches to Turso DB for production
echo "🔄 Switching to Turso database adapter..."
cp src/lib/db.turso.ts src/lib/db.ts
echo "✅ Using Turso adapter"

echo "🔨 Building Next.js..."
npx next build
