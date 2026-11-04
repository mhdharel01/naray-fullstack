#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "========================================="
echo " 🚀 NARAY HOSPITAL - DEPLOYMENT SCRIPT"
echo "========================================="

# Helper function: Link atau Sync direktori
sync_dir() {
    src="$1"
    dst="$2"
    if [ -d "$dst" ] && [ ! -L "$dst" ]; then
        echo "📂 Menyalin $src/* ke $dst/..."
        mkdir -p "$dst"
        \cp -rf "$src/"* "$dst/"
    else
        echo "🔗 Menghubungkan symlink $src -> $dst..."
        ln -sfn "$src" "$dst"
    fi
}

# 1. Pastikan struktur root server terhubung sempurna ke Backend
echo "⚙️ Menyiapkan struktur Laravel di folder server utama..."
sync_dir "$SCRIPT_DIR/Backend/app" "$SCRIPT_DIR/app"
sync_dir "$SCRIPT_DIR/Backend/routes" "$SCRIPT_DIR/routes"
sync_dir "$SCRIPT_DIR/Backend/config" "$SCRIPT_DIR/config"
sync_dir "$SCRIPT_DIR/Backend/bootstrap" "$SCRIPT_DIR/bootstrap"
sync_dir "$SCRIPT_DIR/Backend/database" "$SCRIPT_DIR/database"

# Pastikan artisan tersedia di root
if [ -f "$SCRIPT_DIR/artisan" ] && [ ! -L "$SCRIPT_DIR/artisan" ]; then
    \cp -f "$SCRIPT_DIR/Backend/artisan" "$SCRIPT_DIR/artisan"
else
    ln -sfn "$SCRIPT_DIR/Backend/artisan" "$SCRIPT_DIR/artisan"
fi

# Pastikan storage tersedia di root
if [ ! -d "$SCRIPT_DIR/storage" ]; then
    if [ -d "$SCRIPT_DIR/Backend/storage" ]; then
        ln -sfn "$SCRIPT_DIR/Backend/storage" "$SCRIPT_DIR/storage"
    else
        mkdir -p "$SCRIPT_DIR/storage/framework/cache" "$SCRIPT_DIR/storage/framework/sessions" "$SCRIPT_DIR/storage/framework/views" "$SCRIPT_DIR/storage/logs"
    fi
fi

# Pastikan Backend juga memiliki akses jika ada script yang mengeksekusi dari dalam Backend
if [ -d "$SCRIPT_DIR/vendor" ] && [ ! -d "$SCRIPT_DIR/Backend/vendor" ]; then
    ln -sfn "$SCRIPT_DIR/vendor" "$SCRIPT_DIR/Backend/vendor"
fi

if [ -f "$SCRIPT_DIR/.env" ] && [ ! -f "$SCRIPT_DIR/Backend/.env" ]; then
    ln -sfn "$SCRIPT_DIR/.env" "$SCRIPT_DIR/Backend/.env"
fi

# 2. Update frontend public assets
if [ -d "$SCRIPT_DIR/frontend/dist" ]; then
    echo "📦 Memperbarui aset frontend ke public/..."
    mkdir -p "$SCRIPT_DIR/public"
    \cp -rf "$SCRIPT_DIR/frontend/dist/"* "$SCRIPT_DIR/public/"
fi

# 3. Jalankan Artisan Commands dari root server (tempat vendor & .env berada)
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
