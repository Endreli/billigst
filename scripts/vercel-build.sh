#!/bin/bash
# Vercel build script — switches to Turso DB and generates Prisma client
set -e

echo "🔄 Switching to Turso database adapter..."
cp src/lib/db.turso.ts src/lib/db.ts
echo "✅ Using Turso adapter"

echo "🔧 Generating Prisma client..."
npx prisma generate
echo "✅ Prisma client generated"

echo "🔨 Building Next.js..."
npx next build
