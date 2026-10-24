<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Doctor;
use App\Models\Specialization;
use App\Models\Poliklinik;
use Illuminate\Support\Facades\Http;

echo "=== SINKRONISASI DOKTER DARI SIMRS KE DATABASE MYSQL ===\n";

$specs = Specialization::all()->keyBy('id');
$specsByName = [];
foreach ($specs as $s) {
    $specsByName[strtolower($s->name)] = $s->id;
}

// Specialization mapping helper
function resolveSpecId($ruanganName, $specsByName) {
    $r = strtolower($ruanganName);
    if (str_contains($r, 'anak')) return 7; // Anak & Pediatrik
    if (str_contains($r, 'penyakit dalam')) return 2; // Penyakit Dalam
    if (str_contains($r, 'gigi')) return 3; // Gigi & Mulut
    if (str_contains($r, 'paru') || str_contains($r, 'respirasi') || str_contains($r, 'pulmonologi')) return 4; // Paru & Pernapasan
    if (str_contains($r, 'kulit') || str_contains($r, 'venereologi') || str_contains($r, 'dermatologi')) return 5; // Kulit & Kelamin
    if (str_contains($r, 'tht')) return 6; // THT-KL
    if (str_contains($r, 'bedah') || str_contains($r, 'orthopedi')) return 8; // Bedah
    if (str_contains($r, 'mata')) return 9; // Mata
    if (str_contains($r, 'kandungan') || str_contains($r, 'kebidanan')) return 10; // Kebidanan & Kandungan
    if (str_contains($r, 'jantung')) return 11; // Jantung & Pembuluh Darah
    if (str_contains($r, 'saraf') || str_contains($r, 'neuro')) return 12; // Saraf & Neurologi
    if (str_contains($r, 'jiwa') || str_contains($r, 'psikiatri')) return 13; // Psikiatri & Jiwa
    if (str_contains($r, 'umum') || str_contains($r, 'mcu') || str_contains($r, 'ugd')) return 1; // UGD & Dokter Umum
    return 1;
}

// Fetch live from SIMRS
$url = 'https://antrol.narayhospital.com/api/v1/pasien/jadwal-dokter';
$response = Http::withoutVerifying()->timeout(10)->get($url);

if (!$response->successful()) {
    die("Gagal mengambil data SIMRS: " . $response->status() . "\n");
}

$data = $response->json()['data'] ?? [];
$simrsDays = $data['jadwal_dokter'] ?? [];

$uniqueDoctors = [];
foreach ($simrsDays as $day) {
    foreach ($day['jadwal'] ?? [] as $j) {
        $name = trim($j['dokter']['nama'] ?? '');
        if (!$name) continue;
        
        $ruangan = $j['ruangan']['nama'] ?? '';
        $avatar = $j['dokter']['avatar_url'] ?? '';

        if (!isset($uniqueDoctors[$name])) {
            $uniqueDoctors[$name] = [
                'name' => $name,
                'ruangan' => $ruangan,
                'avatar' => $avatar
            ];
        }
    }
}

echo "Ditemukan " . count($uniqueDoctors) . " dokter aktif dari feed SIMRS Dekago:\n";

foreach ($uniqueDoctors as $simrsDoc) {
    $name = $simrsDoc['name'];
    $specId = resolveSpecId($simrsDoc['ruangan'], $specsByName);
    
    // Check if doctor exists by exact name or similar
    $cleanName = preg_replace('/[^a-zA-Z]/', '', strtolower($name));
    $existing = Doctor::all()->first(function($d) use ($cleanName) {
        $c = preg_replace('/[^a-zA-Z]/', '', strtolower($d->name));
        return $c === $cleanName || str_contains($c, $cleanName) || str_contains($cleanName, $c);
    });

    if ($existing) {
        // Update photo if existing has no photo or default
        echo "✓ Sudah ada di DB: {$existing->name} (ID: {$existing->id})\n";
    } else {
        // Create new doctor
        $isFemale = preg_match('/siti|indah|atikanur|asri|levina|nurul|dwi/i', $name);
        $newDoc = Doctor::create([
            'name' => $name,
            'specialization_id' => $specId,
            'branch_id' => 1,
            'phone' => '0765-31234',
            'email' => strtolower(preg_replace('/[^a-z0-9]/', '', substr($name, 0, 15))) . '@narayhospital.com',
            'photo_url' => $simrsDoc['avatar'] ?: ($isFemale ? '/images/doctors/doctor-female-default.jpg' : '/images/doctors/doctor-male-default.jpg'),
            'bio' => "Dokter Spesialis berdedikasi tinggi di Naray Hospital Dumai, memberikan pelayanan medis paripurna dengan standar keselamatan pasien terkini.",
            'status' => 'active'
        ]);
        echo "+ Berhasil ditambahkan ke DB: {$newDoc->name} (ID: {$newDoc->id}) - Poli Spec ID: {$specId}\n";
    }
}

echo "\nTotal dokter di DB sekarang: " . Doctor::count() . "\n";
