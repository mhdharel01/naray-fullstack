<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Doctor;
use Illuminate\Support\Facades\Http;

echo "=== 1. DOKTER DI DATABASE MYSQL KITA ===\n";
$dbDoctors = Doctor::with('specialization')->get();
foreach ($dbDoctors as $d) {
    echo "- ID: {$d->id} | {$d->name} | Spesialisasi: " . ($d->specialization->name ?? '-') . "\n";
}

echo "\n=== 2. DOKTER DI API SIMRS DEKAGO LIVE ===\n";
$response = Http::withoutVerifying()->timeout(8)->get('https://antrol.narayhospital.com/api/v1/pasien/jadwal-dokter');
if ($response->successful()) {
    $data = $response->json()['data'] ?? [];
    $simrsDays = $data['jadwal_dokter'] ?? [];
    
    $simrsDocs = [];
    foreach ($simrsDays as $day) {
        $dayName = $day['nama_hari'] ?? "Hari {$day['day_of_week']}";
        foreach ($day['jadwal'] ?? [] as $j) {
            $docId = $j['dokter']['id'] ?? 0;
            $docName = $j['dokter']['nama'] ?? '';
            $ruangan = $j['ruangan']['nama'] ?? '';
            $time = ($j['start_time'] ?? '') . ' - ' . ($j['end_time'] ?? '');
            
            if (!isset($simrsDocs[$docName])) {
                $simrsDocs[$docName] = [
                    'id' => $docId,
                    'avatar' => $j['dokter']['avatar_url'] ?? '',
                    'schedules' => []
                ];
            }
            $simrsDocs[$docName]['schedules'][] = "{$dayName}: {$time} ({$ruangan})";
        }
    }

    foreach ($simrsDocs as $name => $info) {
        echo "- SIMRS ID: {$info['id']} | {$name}\n";
        foreach ($info['schedules'] as $s) {
            echo "    * {$s}\n";
        }
    }
} else {
    echo "Gagal mengambil data SIMRS: " . $response->status() . "\n";
}
