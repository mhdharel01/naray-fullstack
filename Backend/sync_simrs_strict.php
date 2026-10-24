<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Doctor;
use App\Models\Poliklinik;
use App\Models\Specialization;
use App\Models\DoctorSchedule;
use App\Models\DoctorLeave;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\DB;

echo "===============================================================\n";
echo "   SINKRONISASI KETAT DOKTER & POLIKLINIK SESUAI API SIMRS    \n";
echo "===============================================================\n\n";

// 1. Fetch Live SIMRS Data
$url = 'https://antrol.narayhospital.com/api/v1/pasien/jadwal-dokter';
echo "1. Menghubungi API SIMRS: {$url} ...\n";

$response = Http::withoutVerifying()->timeout(15)->get($url);
if (!$response->successful()) {
    die("ERROR: Gagal menghubungi API SIMRS. Status HTTP: " . $response->status() . "\n");
}

$apiData = $response->json()['data'] ?? [];
$simrsDays = $apiData['jadwal_dokter'] ?? [];

if (empty($simrsDays)) {
    die("ERROR: Data jadwal_dokter kosong dari API SIMRS.\n");
}

echo "   Berhasil mengambil data dari SIMRS Dekago!\n\n";

// Normalization helper
function cleanNorm($s) {
    return strtolower(trim(preg_replace('/[^a-zA-Z0-9]/', '', $s)));
}

function matchDoc($name1, $name2) {
    if (!$name1 || !$name2) return false;
    $c1 = cleanNorm($name1);
    $c2 = cleanNorm($name2);
    if ($c1 === $c2 || str_contains($c1, $c2) || str_contains($c2, $c1)) return true;

    // Token match without title
    $cleanTitles = function($str) {
        $s = strtolower($str);
        $s = preg_replace('/^(dr\.|drg\.|prof\.)/i', '', $s);
        $s = preg_replace('/,.*$/', '', $s);
        $s = preg_replace('/[^a-z0-9\s]/', ' ', $s);
        return array_values(array_filter(explode(' ', trim($s)), fn($w) => strlen($w) >= 3));
    };
    $t1 = $cleanTitles($name1);
    $t2 = $cleanTitles($name2);
    if (empty($t1) || empty($t2)) return false;
    $common = array_intersect($t1, $t2);
    return count($common) >= min(2, min(count($t1), count($t2)));
}

// 2. Extract unique Polikliniks and unique Doctors from API
$apiPoli = [];    // raw_name => ['id' => ruangan_id, 'name' => ruangan_nama]
$apiDoctors = []; // raw_name => ['id' => dokter_id, 'name' => nama, 'avatar_url' => url, 'ruangan' => ruangan_nama, 'ruangan_id' => ruangan_id]
$allApiSchedules = [];

foreach ($simrsDays as $day) {
    $dow = (int) ($day['day_of_week'] ?? 1);
    $dayNum = ($dow === 0) ? 7 : $dow; // 1=Senin ... 7=Minggu

    foreach ($day['jadwal'] ?? [] as $j) {
        $doc = $j['dokter'] ?? [];
        $ruang = $j['ruangan'] ?? [];

        $dName = trim($doc['nama'] ?? '');
        $dAvatar = trim($doc['avatar_url'] ?? '');
        $dId = $doc['id'] ?? null;

        $rName = trim($ruang['nama'] ?? '');
        $rId = $ruang['id'] ?? null;

        if ($rName && !isset($apiPoli[$rName])) {
            $apiPoli[$rName] = [
                'ruangan_id' => $rId,
                'name' => $rName
            ];
        }

        if ($dName) {
            if (!isset($apiDoctors[$dName])) {
                $apiDoctors[$dName] = [
                    'simrs_id' => $dId,
                    'name' => $dName,
                    'avatar_url' => $dAvatar,
                    'ruangan' => $rName,
                    'ruangan_id' => $rId
                ];
            } else if ($dAvatar && empty($apiDoctors[$dName]['avatar_url'])) {
                $apiDoctors[$dName]['avatar_url'] = $dAvatar;
            }

            $allApiSchedules[] = [
                'doctor_name' => $dName,
                'ruangan_name' => $rName,
                'ruangan_id' => $rId,
                'day_of_week' => $dayNum,
                'start_time' => $j['start_time'] ?? '08:00:00',
                'end_time' => $j['end_time'] ?? '14:00:00',
                'status' => 'active'
            ];
        }
    }
}

echo "2. Ringkasan Data API SIMRS:\n";
echo "   - Total Poliklinik Resmi di API: " . count($apiPoli) . "\n";
echo "   - Total Dokter Resmi di API    : " . count($apiDoctors) . "\n";
echo "   - Total Sesi Jadwal Praktik     : " . count($allApiSchedules) . "\n\n";

DB::beginTransaction();
try {
    // -------------------------------------------------------------
    // 3. KONSOLIDASI & PEMBERSIHAN TABEL POLIKLINIK
    // -------------------------------------------------------------
    echo "3. Membersihkan dan Mengonsolidasikan Poliklinik di Database...\n";
    $oldPoliCount = Poliklinik::count();
    echo "   Jumlah baris poliklinik saat ini: {$oldPoliCount}\n";

    // Map: simrsRuanganName => canonicalPoliklinikId
    $canonicalPoliMap = [];
    $allExistingPoli = Poliklinik::all();

    foreach ($apiPoli as $rName => $pInfo) {
        // Cari apakah sudah ada poliklinik yang namanya persis atau sangat mirip
        $canonical = $allExistingPoli->first(function($p) use ($rName) {
            return cleanNorm($p->name) === cleanNorm($rName);
        });

        if ($canonical) {
            // Update nama agar persis seperti API
            $canonical->name = $rName;
            $canonical->status = 'active';
            $canonical->save();
        } else {
            // Buat baru jika belum ada
            $canonical = Poliklinik::create([
                'name' => $rName,
                'description' => "Layanan medis spesialis rawat jalan {$rName} di Naray Hospital Dumai.",
                'image_url' => '/images/default-image.svg',
                'status' => 'active'
            ]);
        }

        $canonicalPoliMap[$rName] = $canonical->id;
        echo "   ✓ Poliklinik Resmi [ID {$canonical->id}]: {$rName}\n";
    }

    // Remap semua poliklinik lama/duplikat ke canonical IDs
    $idRemap = []; // old_id => new_canonical_id
    foreach ($allExistingPoli as $oldP) {
        $matchedCanonicalId = null;
        $normOld = cleanNorm($oldP->name);

        foreach ($canonicalPoliMap as $rName => $canonId) {
            $normCanon = cleanNorm($rName);
            if ($normOld === $normCanon || str_contains($normOld, $normCanon) || str_contains($normCanon, $normOld)) {
                $matchedCanonicalId = $canonId;
                break;
            }
        }

        if ($matchedCanonicalId) {
            $idRemap[$oldP->id] = $matchedCanonicalId;
        }
    }

    // Update references in doctor_schedules, doctor_poliklinik, appointments
    foreach ($idRemap as $oldId => $newId) {
        if ($oldId !== $newId) {
            DB::table('doctor_schedules')->where('poliklinik_id', $oldId)->update(['poliklinik_id' => $newId]);
            DB::table('appointments')->where('poliklinik_id', $oldId)->update(['poliklinik_id' => $newId]);
            DB::table('doctor_poliklinik')->where('poliklinik_id', $oldId)->update(['poliklinik_id' => $newId]);
        }
    }

    // Hapus seluruh poliklinik yang BUKAN merupakan canonical ID resmi dari API
    $canonicalIds = array_values($canonicalPoliMap);
    
    // Update sisa relasi yang mungkin masih nyangkut ke canonical default (Poli Umum)
    $defaultPoliId = $canonicalPoliMap['Poli Umum'] ?? $canonicalIds[0];
    DB::table('doctor_schedules')->whereNotIn('poliklinik_id', $canonicalIds)->update(['poliklinik_id' => $defaultPoliId]);
    DB::table('appointments')->whereNotIn('poliklinik_id', $canonicalIds)->update(['poliklinik_id' => $defaultPoliId]);
    DB::table('doctor_poliklinik')->whereNotIn('poliklinik_id', $canonicalIds)->delete();

    // Hapus baris poliklinik non-canonical
    $deletedPoliCount = Poliklinik::whereNotIn('id', $canonicalIds)->delete();
    echo "   Berhasil menghapus {$deletedPoliCount} baris poliklinik duplikat / yang tidak ada di API.\n";
    echo "   Sisa poliklinik resmi sekarang: " . Poliklinik::count() . " poliklinik.\n\n";

    // -------------------------------------------------------------
    // 4. KONSOLIDASI, UPDATE FOTO & HAPUS DOKTER YANG TIDAK ADA DI API
    // -------------------------------------------------------------
    echo "4. Menyelaraskan Dokter & Memperbarui Foto Resmi dari SIMRS API...\n";

    // Specialization helper
    function getSpecIdForRoom($roomName) {
        $r = strtolower($roomName);
        if (str_contains($r, 'anak')) return 7;
        if (str_contains($r, 'penyakit dalam') || str_contains($r, 'patologi')) return 2;
        if (str_contains($r, 'gigi') || str_contains($r, 'mulut')) return 3;
        if (str_contains($r, 'paru') || str_contains($r, 'respirasi') || str_contains($r, 'pulmonologi')) return 4;
        if (str_contains($r, 'kulit') || str_contains($r, 'venereologi') || str_contains($r, 'dermatologi')) return 5;
        if (str_contains($r, 'tht')) return 6;
        if (str_contains($r, 'bedah') || str_contains($r, 'orthopedi')) return 8;
        if (str_contains($r, 'mata')) return 9;
        if (str_contains($r, 'kandungan') || str_contains($r, 'kebidanan')) return 10;
        if (str_contains($r, 'jantung')) return 11;
        if (str_contains($r, 'saraf') || str_contains($r, 'neuro')) return 12;
        if (str_contains($r, 'jiwa') || str_contains($r, 'psikiatri')) return 13;
        if (str_contains($r, 'radiologi')) return 2;
        return 1;
    }

    $existingDoctors = Doctor::all();
    $matchedDocIds = []; // ID dokter di DB yang valid ada di API

    foreach ($apiDoctors as $apiName => $apiInfo) {
        // Cari dokter yang cocok di DB
        $matched = $existingDoctors->first(function($d) use ($apiName) {
            return matchDoc($d->name, $apiName);
        });

        $specId = getSpecIdForRoom($apiInfo['ruangan']);
        $avatarUrl = $apiInfo['avatar_url'];

        if ($matched) {
            // Update nama resmi dan FOTO resmi dari API SIMRS
            $matched->name = $apiName;
            $matched->photo_url = $avatarUrl ?: $matched->photo_url;
            $matched->status = 'active';
            $matched->specialization_id = $specId;
            $matched->save();
            $matchedDocIds[] = $matched->id;
            echo "   ✓ [UPDATE FOTO API] ID {$matched->id}: {$matched->name}\n";
            echo "      Foto: {$matched->photo_url}\n";
        } else {
            // Dokter baru di API yang belum ada di DB -> Tambahkan
            $newDoc = Doctor::create([
                'name' => $apiName,
                'specialization_id' => $specId,
                'branch_id' => 1,
                'phone' => '0765-31234',
                'email' => strtolower(preg_replace('/[^a-z0-9]/', '', substr($apiName, 0, 15))) . '@narayhospital.com',
                'photo_url' => $avatarUrl,
                'bio' => "Dokter Spesialis Naray Hospital Kota Dumai, melayani di {$apiInfo['ruangan']}.",
                'status' => 'active'
            ]);
            $matchedDocIds[] = $newDoc->id;
            echo "   + [TAMBAH DOKTER API] ID {$newDoc->id}: {$newDoc->name}\n";
            echo "      Foto: {$newDoc->photo_url}\n";
        }
    }

    // Hapus seluruh dokter di DB yang TIDAK ADA di API
    $unmatchedDoctors = Doctor::whereNotIn('id', $matchedDocIds)->get();
    echo "\n   Menemukan " . $unmatchedDoctors->count() . " dokter di DB yang TIDAK ADA di API SIMRS (akan dihapus):\n";

    foreach ($unmatchedDoctors as $badDoc) {
        echo "   ✗ Hapus Dokter ID {$badDoc->id}: '{$badDoc->name}' ...\n";
        // Hapus relasi terkait terlebih dahulu agar aman
        DB::table('doctor_schedules')->where('doctor_id', $badDoc->id)->delete();
        DB::table('doctor_leaves')->where('doctor_id', $badDoc->id)->delete();
        DB::table('doctor_poliklinik')->where('doctor_id', $badDoc->id)->delete();
        DB::table('appointments')->where('doctor_id', $badDoc->id)->delete();
        // Force delete agar tidak tersisa di database
        $badDoc->forceDelete();
    }

    echo "   Dokter non-API berhasil dibersihkan dari database!\n";
    echo "   Total dokter aktif resmi di database sekarang: " . Doctor::count() . " dokter.\n\n";

    // -------------------------------------------------------------
    // 5. SINKRONISASI JADWAL PRAKTIK & RELASI POLIKLINIK
    // -------------------------------------------------------------
    echo "5. Menyinkronkan Jadwal Praktik Sesuai Data API SIMRS...\n";

    DB::table('doctor_poliklinik')->delete();

    $currentDbDoctors = Doctor::all();
    $insertedScheduleCount = 0;
    $keptScheduleIds = [];

    foreach ($allApiSchedules as $sch) {
        // Cari dokter DB
        $dbDoc = $currentDbDoctors->first(function($d) use ($sch) {
            return matchDoc($d->name, $sch['doctor_name']);
        });

        if (!$dbDoc) continue;

        $targetPoliId = $canonicalPoliMap[$sch['ruangan_name']] ?? $defaultPoliId;

        // Cari jadwal yang sudah ada (matching doctor, day, start_time, end_time)
        $existingSchedule = DoctorSchedule::where('doctor_id', $dbDoc->id)
            ->where('day_of_week', $sch['day_of_week'])
            ->where('start_time', $sch['start_time'])
            ->where('end_time', $sch['end_time'])
            ->first();

        if ($existingSchedule) {
            $existingSchedule->poliklinik_id = $targetPoliId;
            $existingSchedule->status = 'active';
            $existingSchedule->save();
            $keptScheduleIds[] = $existingSchedule->id;
        } else {
            $newSch = DoctorSchedule::create([
                'doctor_id' => $dbDoc->id,
                'poliklinik_id' => $targetPoliId,
                'branch_id' => 1,
                'day_of_week' => $sch['day_of_week'],
                'start_time' => $sch['start_time'],
                'end_time' => $sch['end_time'],
                'status' => 'active'
            ]);
            $keptScheduleIds[] = $newSch->id;
        }
        $insertedScheduleCount++;

        // Pastikan relasi pivot doctor_poliklinik ada
        $existsPivot = DB::table('doctor_poliklinik')
            ->where('doctor_id', $dbDoc->id)
            ->where('poliklinik_id', $targetPoliId)
            ->exists();
        if (!$existsPivot) {
            DB::table('doctor_poliklinik')->insert([
                'doctor_id' => $dbDoc->id,
                'poliklinik_id' => $targetPoliId
            ]);
        }
    }

    // Bersihkan jadwal lama yang tidak ada di API (jika terikat appointment, nonaktifkan)
    $orphanSchedules = DoctorSchedule::whereNotIn('id', $keptScheduleIds)->get();
    foreach ($orphanSchedules as $orphan) {
        $hasApt = DB::table('appointments')->where('doctor_schedule_id', $orphan->id)->exists();
        $hasLeave = DB::table('doctor_leaves')->where('doctor_schedule_id', $orphan->id)->exists();
        if ($hasApt || $hasLeave) {
            $orphan->status = 'inactive';
            $orphan->save();
        } else {
            $orphan->forceDelete();
        }
    }

    echo "   Berhasil menyinkronkan {$insertedScheduleCount} jadwal sesi praktik aktif ke DB.\n";

    if (DB::transactionLevel() > 0) {
        DB::commit();
    }
    echo "\n=== SINKRONISASI BERHASIL 100%! SEMUA PERUBAHAN TERSIMPAN DI MYSQL. ===\n";

} catch (\Throwable $e) {
    if (DB::transactionLevel() > 0) {
        DB::rollBack();
    }
    echo "\nERROR TERJADI: " . $e->getMessage() . "\n";
    echo "Line: " . $e->getLine() . " in " . $e->getFile() . "\n";
    exit(1);
}
