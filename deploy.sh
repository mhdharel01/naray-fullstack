#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "========================================="
echo " 🚀 NARAY HOSPITAL - DEPLOYMENT SCRIPT"
echo "========================================="

# 1. Update symlinks for vendor and .env if they are in root
if [ -d "$SCRIPT_DIR/vendor" ] && [ ! -d "$SCRIPT_DIR/Backend/vendor" ]; then
    echo "🔗 Linking vendor directory to Backend/vendor..."
    ln -sfn "$SCRIPT_DIR/vendor" "$SCRIPT_DIR/Backend/vendor"
fi

if [ -f "$SCRIPT_DIR/.env" ] && [ ! -f "$SCRIPT_DIR/Backend/.env" ]; then
    echo "🔗 Linking .env to Backend/.env..."
    ln -sfn "$SCRIPT_DIR/.env" "$SCRIPT_DIR/Backend/.env"
fi

# 2. Update frontend public assets
if [ -d "$SCRIPT_DIR/frontend/dist" ]; then
    echo "📦 Updating frontend assets to public/..."
    mkdir -p "$SCRIPT_DIR/public"
    \cp -rf "$SCRIPT_DIR/frontend/dist/"* "$SCRIPT_DIR/public/"
fi

# 3. Backend Artisan Commands
if [ -d "$SCRIPT_DIR/Backend" ]; then
    cd "$SCRIPT_DIR/Backend"
    
    echo "🧹 Clearing Laravel optimization & route caches..."
    php artisan optimize:clear
    php artisan route:clear
    
    echo "🗄️ Running pending database migrations..."
    php artisan migrate --force
    
    echo "📋 Verifying appointments route..."
    php artisan route:list --path=appointments
    
    cd "$SCRIPT_DIR"
fi

echo "========================================="
echo " ✅ DEPLOYMENT BERHASIL 100%!"
echo "========================================="
