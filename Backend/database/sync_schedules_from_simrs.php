<?php

require dirname(__DIR__) . '/vendor/autoload.php';
$app = require_once dirname(__DIR__) . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Doctor;
use App\Models\DoctorSchedule;
use App\Models\Poliklinik;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\DB;

echo "=== MEMULAI SINKRONISASI JADWAL SIMRS KE DB LOKAL ===\n\n";

// 1. Fetch live schedule from SIMRS
$url = 'https://antrol.narayhospital.com/api/v1/pasien/jadwal-dokter';
try {
    $r = Http::withoutVerifying()->timeout(10)->get($url);
    if (!$r->successful()) {
        die("Gagal mengambil data dari SIMRS: HTTP " . $r->status() . "\n");
    }
    $simrsData = $r->json()['data'] ?? [];
    $days = $simrsData['jadwal_dokter'] ?? [];
} catch (\Throwable $e) {
    die("Error koneksi SIMRS: " . $e->getMessage() . "\n");
}

if (empty($days)) {
    die("Tidak ada data jadwal di SIMRS.\n");
}

// 2. Ambil semua dokter dari DB lokal
$dbDoctors = Doctor::all();
$dbPolis = Poliklinik::all();

function cleanDocName($name) {
    $clean = strtolower($name);
    $clean = preg_replace('/^(dr\.|drg\.|prof\.)/i', '', $clean);
    $clean = preg_replace('/,.*$/', '', $clean);
    $clean = preg_replace('/[^a-z0-9\s]/', ' ', $clean);
    return trim($clean);
}

function matchDoc($dbName, $simrsName) {
    $t1 = array_filter(explode(' ', cleanDocName($dbName)), fn($w) => strlen($w) >= 3);
    $t2 = array_filter(explode(' ', cleanDocName($simrsName)), fn($w) => strlen($w) >= 3);
    $common = array_filter($t1, fn($w) => count(array_filter($t2, fn($x) => str_contains($x, $w) || str_contains($w, $x))) > 0);
    return count($common) >= min(2, min(count($t1), count($t2)));
}

// Mapping Poli nama -> ID
function findOrCreatePoli($poliName, $dbPolis) {
    if (empty($poliName)) return 1;
    $cleanName = trim($poliName);
    
    foreach ($dbPolis as $p) {
        if (stripos($p->name, $cleanName) !== false || stripos($cleanName, $p->name) !== false) {
            return $p->id;
        }
    }
    // Jika belum ada, buat poliklinik baru
    $slug = strtolower(preg_replace('/[^a-z0-9]+/i', '-', $cleanName));
    $newPoli = Poliklinik::create([
        'name' => $cleanName,
        'slug' => $slug,
        'description' => "Layanan rawat jalan {$cleanName} Naray Hospital",
        'status' => 'active'
    ]);
    return $newPoli->id;
}

// 3. Backup / Clear old doctor schedules
echo "Membersihkan tabel doctor_schedules lama...\n";
// Non-aktifkan foreign key checks sementara saat truncate jika perlu
DB::statement('SET FOREIGN_KEY_CHECKS=0;');
DoctorSchedule::truncate();
DB::statement('SET FOREIGN_KEY_CHECKS=1;');
echo "Tabel doctor_schedules berhasil dikosongkan untuk sinkronisasi baru.\n\n";

$inserted = 0;
$skipped = 0;

// Konversi day_of_week SIMRS: 0 = Minggu (7), 1 = Senin (1), ..., 6 = Sabtu (6)
foreach ($days as $dayItem) {
    $simrsDow = (int)$dayItem['day_of_week'];
    $dbDow = ($simrsDow === 0) ? 7 : $simrsDow; // Ubah 0 (Minggu) menjadi 7 untuk konsistensi DB lokal

    foreach ($dayItem['jadwal'] ?? [] as $j) {
        $simrsDocName = $j['dokter']['nama'] ?? '';
        $simrsPoliName = $j['ruangan']['nama'] ?? 'Poli Umum';
        $startTime = $j['start_time'] ?? '08:00:00';
        $endTime = $j['end_time'] ?? '14:00:00';

        // Cari dokter yang cocok di DB lokal
        $matchedDoctor = null;
        foreach ($dbDoctors as $doc) {
            if (matchDoc($doc->name, $simrsDocName)) {
                $matchedDoctor = $doc;
                break;
            }
        }

        if (!$matchedDoctor) {
            $skipped++;
            continue;
        }

        // Cari atau buat poliklinik
        $poliId = findOrCreatePoli($simrsPoliName, $dbPolis);

        // Cek apakah jadwal yang persis sama sudah ada untuk dokter di hari & jam tersebut
        $exists = DoctorSchedule::where('doctor_id', $matchedDoctor->id)
            ->where('day_of_week', $dbDow)
            ->where('start_time', $startTime)
            ->where('end_time', $endTime)
            ->first();

        if (!$exists) {
            DoctorSchedule::create([
                'doctor_id' => $matchedDoctor->id,
                'branch_id' => 1,
                'poliklinik_id' => $poliId,
                'day_of_week' => $dbDow,
                'start_time' => $startTime,
                'end_time' => $endTime,
                'status' => 'active'
            ]);
            $inserted++;
        }
    }
}

echo "HASIL SINKRONISASI JADWAL:\n";
echo " - Jadwal berhasil dibuat: {$inserted}\n";
echo " - Jadwal diskip (tidak cocok nama): {$skipped}\n";

$totalNow = DoctorSchedule::count();
echo " - Total Jadwal Aktif di DB sekarang: {$totalNow}\n";
