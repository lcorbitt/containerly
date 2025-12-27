#!/bin/bash

set -e

echo "🚀 Starting development environment setup..."
echo ""

# Start infrastructure
echo "📦 Starting PostgreSQL and Redis..."
docker compose up -d postgres redis

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
until docker compose exec -T postgres pg_isready -U user -d containerly > /dev/null 2>&1; do
  echo "   Waiting for database..."
  sleep 1
done

# Additional wait to ensure user is fully created and database is ready for connections
echo "   Verifying database connection..."
sleep 2
until docker compose exec -T postgres psql -U user -d containerly -c "SELECT 1;" > /dev/null 2>&1; do
  echo "   Waiting for database to accept connections..."
  sleep 1
done
echo "✅ PostgreSQL is ready!"
echo ""

# Run migrations
echo "🔄 Running database migrations..."
npm run migration:run || {
  echo "⚠️  Migration failed or already run. Continuing..."
}
echo ""

# Seed database
echo "🌱 Seeding database..."
npm run seed || {
  echo "⚠️  Seeding failed or already seeded. Continuing..."
}
echo ""

echo "✅ Setup complete! Starting development servers..."
echo ""

# Start all dev servers
npx turbo run dev

