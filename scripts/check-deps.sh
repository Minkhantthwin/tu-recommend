#!/bin/bash

# Dependency Health Check Script
# Audits for known vulnerabilities, lists deprecated packages, and reports
# outdated packages. Pass --fix to attempt automatic remediation.

set -uo pipefail

# Change to the project root directory
cd "$(dirname "$0")/.."

case "${1:-}" in
  "") FIX=false ;;
  --fix) FIX=true ;;
  *) echo "Usage: $0 [--fix]" >&2; exit 2 ;;
esac

if ! command -v pnpm >/dev/null 2>&1; then
  echo "❌ pnpm is not installed. Install it with: npm install -g pnpm"
  exit 1
fi

exit_code=0

echo "🔍 Checking for security vulnerabilities..."
echo "─────────────────────────────────────────────"
if ! pnpm audit --audit-level=moderate; then
  if $FIX; then
    echo ""
    echo "🔧 Attempting to auto-fix vulnerabilities (adds overrides to package.json)..."
    pnpm audit --fix || exit_code=1
  else
    exit_code=1
  fi
fi

echo ""
echo "🔍 Checking for deprecated packages..."
echo "─────────────────────────────────────────────"
deprecated_output="$(pnpm install 2>&1 | grep -i "deprecated" || true)"
if [[ -n "$deprecated_output" ]]; then
  echo "$deprecated_output"
  exit_code=1
else
  echo "✅ No deprecated packages found."
fi

echo ""
echo "🔍 Checking for outdated packages..."
echo "─────────────────────────────────────────────"
if $FIX; then
  echo "🔧 Updating packages within their compatible version ranges..."
  pnpm update || exit_code=1
  echo ""
fi
pnpm outdated || true
echo "ℹ️  Major updates are listed for review and require migration before upgrading."

echo ""
if [[ $exit_code -eq 0 ]]; then
  echo "✅ All checks passed."
else
  echo "⚠️  Issues were found. Re-run with --fix to attempt automatic remediation,"
  echo "   or resolve manually and re-run this script to verify."
fi

exit $exit_code
