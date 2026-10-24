<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Doctor;
use App\Models\Poliklinik;

echo "=========================================================\n";
echo "           DAFTAR 30 DOKTER AKTIF NARAY HOSPITAL         \n";
echo "=========================================================\n";

$doctors = Doctor::with('polikliniks', 'specialization')->orderBy('name')->get();

$nonSimrsPhotos = 0;
foreach ($doctors as $idx => $d) {
    $num = $idx + 1;
    $polis = $d->polikliniks->pluck('name')->implode(', ');
    $isSimrs = str_starts_with($d->photo_url, 'https://antrol.narayhospital.com/storage/avatars/');
    if (!$isSimrs) $nonSimrsPhotos++;
    $statusIcon = $isSimrs ? '✓ SIMRS Photo' : '✗ NON-SIMRS Photo';

    echo "{$num}. [ID {$d->id}] {$d->name}\n";
    echo "   Spesialis : " . ($d->specialization->name ?? 'N/A') . "\n";
    echo "   Poli      : " . ($polis ?: 'Umum') . "\n";
    echo "   Status    : {$statusIcon}\n";
    echo "   Foto URL  : {$d->photo_url}\n\n";
}

echo "Ringkasan Foto: " . (30 - $nonSimrsPhotos) . "/30 Dokter menggunakan Avatar Resmi SIMRS Dekago.\n";

echo "\n=========================================================\n";
echo "             DAFTAR 19 POLIKLINIK RESMI SIMRS            \n";
echo "=========================================================\n";
$polis = Poliklinik::orderBy('id')->get();
foreach ($polis as $p) {
    $docCount = $p->doctors()->count();
    echo "- [ID {$p->id}] {$p->name} ({$docCount} dokter)\n";
}
