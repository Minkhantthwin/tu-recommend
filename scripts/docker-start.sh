#!/bin/bash

# Docker Start Script
# Starts all Docker containers for the tu-recommend project

set -e

echo "🐳 Starting Docker containers..."

# Change to the project root directory
cd "$(dirname "$0")/.."

# Start all services in detached mode
docker compose up -d

echo ""
echo "✅ All containers started successfully!"
echo ""
echo "📦 Services available at:"
echo "   • PostgreSQL:  localhost:5433"
echo "   • Redis:       localhost:6380"
echo "   • MinIO API:   http://localhost:9000"
echo "   • MinIO UI:    http://localhost:9001 (admin: minioadmin/minioadmin)"
echo "   • Mailpit UI:  http://localhost:8025"
echo "   • Mailpit SMTP: localhost:1025"
echo ""
echo "💡 Run 'docker compose logs -f' to view logs"
echo "💡 Run 'npm run docker:stop' to stop all containers"
