#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "========================================="
echo " 🚀 NARAY HOSPITAL - DEPLOYMENT SCRIPT"
echo "========================================="

# 1. Bersihkan sisa shortcut/symlink lama jika ada
echo "🧹 Membersihkan shortcut lama agar struktur murni & rapi..."
for link in app routes config bootstrap database artisan; do
    if [ -L "$SCRIPT_DIR/$link" ]; then
        rm -f "$SCRIPT_DIR/$link"
        echo "   Dihapus shortcut: $link"
    fi
done

# Amankan file upload dari Backend/storage lama jika ada
if [ -d "$SCRIPT_DIR/Backend/storage/app/public" ]; then
    echo "📦 Mengamankan file upload dari folder Backend lama..."
    mkdir -p "$SCRIPT_DIR/storage/app/public"
    \cp -rn "$SCRIPT_DIR/Backend/storage/app/public/"* "$SCRIPT_DIR/storage/app/public/" 2>/dev/null || true
fi

# Hapus folder Backend lama jika masih tertinggal di server agar tidak ganda/membingungkan
if [ -d "$SCRIPT_DIR/Backend" ]; then
    echo "🗑️ Menghapus folder Backend lama agar tidak dobel..."
    rm -rf "$SCRIPT_DIR/Backend"
fi

# 2. Siapkan folder storage, upload, dan cache
echo "📁 Menyiapkan folder storage dan upload..."
for f in doctors articles rooms facilities centers media banners avatars leadership general; do
    mkdir -p "$SCRIPT_DIR/storage/app/public/uploads/$f"
done
mkdir -p "$SCRIPT_DIR/bootstrap/cache"
mkdir -p "$SCRIPT_DIR/storage/logs"
mkdir -p "$SCRIPT_DIR/storage/framework/cache" "$SCRIPT_DIR/storage/framework/sessions" "$SCRIPT_DIR/storage/framework/views"
touch "$SCRIPT_DIR/storage/logs/laravel.log" 2>/dev/null || true

# Sinkronkan seluruh foto upload (dokter, fasilitas, ruangan, banner, artikel, dll)
echo "🖼️ Memastikan seluruh foto upload tersedia di storage..."
for f in doctors articles rooms facilities centers media banners avatars leadership general; do
    if [ -d "$SCRIPT_DIR/public/images/$f" ]; then
        \cp -rn "$SCRIPT_DIR/public/images/$f/"* "$SCRIPT_DIR/storage/app/public/uploads/$f/" 2>/dev/null || true
    fi
done

# Jika ada backup cadangan di /home/nginx/storage_backup_aman, gabungkan juga
if [ -d "/home/nginx/storage_backup_aman" ]; then
    echo "📦 Menggabungkan foto dari folder backup aman..."
    \cp -rn /home/nginx/storage_backup_aman/app/public/* "$SCRIPT_DIR/storage/app/public/" 2>/dev/null || true
    \cp -rn /home/nginx/storage_backup_aman/uploads/* "$SCRIPT_DIR/storage/app/public/uploads/" 2>/dev/null || true
fi

# 3. Hubungkan symlink storage ke public/storage (selalu perbarui agar mengarah ke storage baru)
echo "🔗 Menghubungkan storage publik (public/storage)..."
rm -f "$SCRIPT_DIR/public/storage" 2>/dev/null || true
ln -sfn "$SCRIPT_DIR/storage/app/public" "$SCRIPT_DIR/public/storage"

# 4. Update aset frontend dari dist ke public/ jika ada update
if [ -d "$SCRIPT_DIR/frontend/dist" ]; then
    echo "📦 Memperbarui aset frontend ke public/..."
    mkdir -p "$SCRIPT_DIR/public"
    \cp -rf "$SCRIPT_DIR/frontend/dist/"* "$SCRIPT_DIR/public/"
fi

# Pastikan public/index.php dan .htaccess selalu ada
if [ ! -f "$SCRIPT_DIR/public/index.php" ]; then
    echo "⚠️ public/index.php tidak ditemukan, membuat ulang..."
    cat << 'EOF' > "$SCRIPT_DIR/public/index.php"
<?php

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

if (file_exists($maintenance = __DIR__.'/../storage/framework/maintenance.php')) {
    require $maintenance;
}

require __DIR__.'/../vendor/autoload.php';

/** @var Application $app */
$app = require_once __DIR__.'/../bootstrap/app.php';

$app->handleRequest(Request::capture());
EOF
fi

# 5. Atur izin akses (permissions) agar webserver nginx & php-fpm bisa menulis
echo "🔒 Menyetel izin akses storage, logs, & cache (chmod 777)..."
chmod -R 777 "$SCRIPT_DIR/storage" "$SCRIPT_DIR/bootstrap/cache" "$SCRIPT_DIR/public/storage" 2>/dev/null || true
chmod 666 "$SCRIPT_DIR/storage/logs/laravel.log" 2>/dev/null || true
chown -R nginx:nginx "$SCRIPT_DIR/storage" "$SCRIPT_DIR/bootstrap/cache" "$SCRIPT_DIR/public/storage" 2>/dev/null || chown -R www-data:www-data "$SCRIPT_DIR/storage" "$SCRIPT_DIR/bootstrap/cache" "$SCRIPT_DIR/public/storage" 2>/dev/null || true

# 6. Jalankan Artisan Commands langsung dari root
echo "🧹 Membersihkan cache Laravel & rute API..."
php "$SCRIPT_DIR/artisan" optimize:clear
php "$SCRIPT_DIR/artisan" route:clear

echo "🗄️ Menjalankan migrasi tabel database..."
php "$SCRIPT_DIR/artisan" migrate --force

echo "📋 Memverifikasi rute admin appointments..."
php "$SCRIPT_DIR/artisan" route:list --path=appointments

echo "========================================="
echo " ✅ DEPLOYMENT BERHASIL 100%!"
echo " Struktur bersih: Backend di root, Frontend di public/."
echo "========================================="
