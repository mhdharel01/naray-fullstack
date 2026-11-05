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

# Pastikan storage tersedia di root & Backend beserta seluruh subfolder upload
echo "📁 Menyiapkan folder storage dan upload..."
for f in doctors articles rooms facilities centers media banners avatars leadership general; do
    mkdir -p "$SCRIPT_DIR/Backend/storage/app/public/uploads/$f"
    mkdir -p "$SCRIPT_DIR/storage/app/public/uploads/$f" 2>/dev/null || true
done
mkdir -p "$SCRIPT_DIR/Backend/bootstrap/cache" "$SCRIPT_DIR/bootstrap/cache" 2>/dev/null || true
mkdir -p "$SCRIPT_DIR/Backend/storage/logs" "$SCRIPT_DIR/storage/logs"
mkdir -p "$SCRIPT_DIR/Backend/storage/framework/cache" "$SCRIPT_DIR/Backend/storage/framework/sessions" "$SCRIPT_DIR/Backend/storage/framework/views"
mkdir -p "$SCRIPT_DIR/storage/framework/cache" "$SCRIPT_DIR/storage/framework/sessions" "$SCRIPT_DIR/storage/framework/views" 2>/dev/null || true

touch "$SCRIPT_DIR/Backend/storage/logs/laravel.log" 2>/dev/null || true
touch "$SCRIPT_DIR/storage/logs/laravel.log" 2>/dev/null || true

if [ ! -d "$SCRIPT_DIR/storage" ]; then
    ln -sfn "$SCRIPT_DIR/Backend/storage" "$SCRIPT_DIR/storage"
fi

# Pastikan Backend juga memiliki akses jika ada script yang mengeksekusi dari dalam Backend
if [ -d "$SCRIPT_DIR/vendor" ] && [ ! -d "$SCRIPT_DIR/Backend/vendor" ]; then
    ln -sfn "$SCRIPT_DIR/vendor" "$SCRIPT_DIR/Backend/vendor"
fi

if [ -f "$SCRIPT_DIR/.env" ] && [ ! -f "$SCRIPT_DIR/Backend/.env" ]; then
    ln -sfn "$SCRIPT_DIR/.env" "$SCRIPT_DIR/Backend/.env"
fi

# 2. Update frontend public assets & API index.php entrypoint
if [ -d "$SCRIPT_DIR/frontend/dist" ]; then
    echo "📦 Memperbarui aset frontend ke public/..."
    mkdir -p "$SCRIPT_DIR/public"
    \cp -rf "$SCRIPT_DIR/frontend/dist/"* "$SCRIPT_DIR/public/"
fi

echo "🔌 Memastikan gateway API (public/index.php) tersedia..."
\cp -f "$SCRIPT_DIR/Backend/public/index.php" "$SCRIPT_DIR/public/index.php"
if [ -f "$SCRIPT_DIR/Backend/public/.htaccess" ]; then
    \cp -f "$SCRIPT_DIR/Backend/public/.htaccess" "$SCRIPT_DIR/public/.htaccess"
fi

# Pastikan symlink storage terhubung
if [ -d "$SCRIPT_DIR/Backend/storage/app/public" ]; then
    ln -sfn "$SCRIPT_DIR/Backend/storage/app/public" "$SCRIPT_DIR/public/storage"
elif [ -d "$SCRIPT_DIR/storage/app/public" ]; then
    ln -sfn "$SCRIPT_DIR/storage/app/public" "$SCRIPT_DIR/public/storage"
fi

# Atur izin akses (permissions) storage, logs, & cache agar webserver (nginx / php-fpm) bisa menulis tanpa Permission Denied
echo "🔒 Menyetel izin akses storage, logs, & upload (chmod 777)..."
chmod -R 777 "$SCRIPT_DIR/Backend/storage" "$SCRIPT_DIR/storage" "$SCRIPT_DIR/public/storage" "$SCRIPT_DIR/Backend/bootstrap/cache" "$SCRIPT_DIR/bootstrap/cache" 2>/dev/null || true
chmod 666 "$SCRIPT_DIR/Backend/storage/logs/laravel.log" 2>/dev/null || true
chmod 666 "$SCRIPT_DIR/storage/logs/laravel.log" 2>/dev/null || true
chown -R nginx:nginx "$SCRIPT_DIR/Backend/storage" "$SCRIPT_DIR/storage" "$SCRIPT_DIR/public/storage" "$SCRIPT_DIR/Backend/bootstrap/cache" "$SCRIPT_DIR/bootstrap/cache" 2>/dev/null || chown -R www-data:www-data "$SCRIPT_DIR/Backend/storage" "$SCRIPT_DIR/storage" "$SCRIPT_DIR/public/storage" "$SCRIPT_DIR/Backend/bootstrap/cache" "$SCRIPT_DIR/bootstrap/cache" 2>/dev/null || true

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
