#!/bin/bash

# Docker Stop Script
# Stops all Docker containers for the tu-recommend project

set -e

echo "🛑 Stopping Docker containers..."

# Change to the project root directory
cd "$(dirname "$0")/.."

# Stop all services
docker compose down

echo ""
echo "✅ All containers stopped successfully!"
echo ""
echo "💡 Run 'pnpm run docker:start' to start containers again"
echo "💡 Run 'docker compose down -v' to also remove volumes (data will be lost)"
