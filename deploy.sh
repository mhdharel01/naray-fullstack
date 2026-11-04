#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "========================================="
echo " 🚀 NARAY HOSPITAL - DEPLOYMENT SCRIPT"
echo "========================================="

# 1. Pastikan struktur root server terhubung sempurna ke Backend
echo "🔗 Menyinkronkan struktur Laravel server (app, routes, database, config, bootstrap)..."
ln -sfn "$SCRIPT_DIR/Backend/app" "$SCRIPT_DIR/app"
ln -sfn "$SCRIPT_DIR/Backend/routes" "$SCRIPT_DIR/routes"
ln -sfn "$SCRIPT_DIR/Backend/config" "$SCRIPT_DIR/config"
ln -sfn "$SCRIPT_DIR/Backend/bootstrap" "$SCRIPT_DIR/bootstrap"
ln -sfn "$SCRIPT_DIR/Backend/database" "$SCRIPT_DIR/database"
ln -sfn "$SCRIPT_DIR/Backend/artisan" "$SCRIPT_DIR/artisan"

# Pastikan Backend juga memiliki akses ke vendor dan .env
if [ -d "$SCRIPT_DIR/vendor" ]; then
    ln -sfn "$SCRIPT_DIR/vendor" "$SCRIPT_DIR/Backend/vendor"
fi

if [ -f "$SCRIPT_DIR/.env" ]; then
    ln -sfn "$SCRIPT_DIR/.env" "$SCRIPT_DIR/Backend/.env"
fi

# 2. Update frontend public assets
if [ -d "$SCRIPT_DIR/frontend/dist" ]; then
    echo "📦 Memperbarui aset frontend ke public/..."
    mkdir -p "$SCRIPT_DIR/public"
    \cp -rf "$SCRIPT_DIR/frontend/dist/"* "$SCRIPT_DIR/public/"
fi

# 3. Jalankan Artisan Commands dari root server
echo "🧹 Membersihkan cache Laravel & rute API..."
php "$SCRIPT_DIR/artisan" optimize:clear
php "$SCRIPT_DIR/artisan" route:clear

echo "🗄️ Menjalankan migrasi tabel database baru..."
php "$SCRIPT_DIR/artisan" migrate --force

echo "📋 Memverifikasi rute admin appointments..."
php "$SCRIPT_DIR/artisan" route:list --path=appointments

echo "========================================="
echo " ✅ DEPLOYMENT BERHASIL 100%!"
echo "========================================="
