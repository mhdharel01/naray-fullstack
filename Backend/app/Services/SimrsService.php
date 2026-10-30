<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use App\Models\RoomType;
use App\Models\Room;
use App\Models\Doctor;
use App\Models\DoctorSchedule;
use App\Models\Poliklinik;
use App\Models\Specialization;

class SimrsService
{
    protected string $baseUrl;
    protected int $cacheMinutes;

    public function __construct()
    {
        $this->baseUrl = rtrim(env('SIMRS_API_BASE_URL', 'http://dekago-v2.test/api/v1/pasien'), '/');
        $this->cacheMinutes = (int) env('SIMRS_SYNC_CACHE_MINUTES', 3);
    }

    /**
     * Mengambil ketersediaan tempat tidur real-time dari SIMRS Dekago
     * Sesuai Postman: GET /kamar/persediaan
     */
    public function getBedAvailability(bool $forceRefresh = false): array
    {
        if ($forceRefresh) {
            Cache::forget('simrs_persediaan_kamar');
        }

        return Cache::remember('simrs_persediaan_kamar', now()->addMinutes($this->cacheMinutes), function () {
            try {
                if (!empty($this->baseUrl) && filter_var($this->baseUrl, FILTER_VALIDATE_URL)) {
                    $response = Http::withoutVerifying()
                        ->timeout(8)
                        ->acceptJson()
                        ->get("{$this->baseUrl}/kamar/persediaan");

                    if ($response->successful()) {
                        $json = $response->json();
                        if (!empty($json['data']['persediaan_kamar'])) {
                            return [
                                'source' => 'simrs_live',
                                'success' => true,
                                'persediaan_kamar' => $json['data']['persediaan_kamar'],
                                'last_fetched' => $json['data']['last_fetched'] ?? now()->format('d/m/Y H:i:s'),
                            ];
                        }
                    }
                }
            } catch (\Throwable $e) {
                Log::warning('SIMRS Dekago unreachable, using database fallback: ' . $e->getMessage());
            }

            return $this->getDatabaseBedAvailability();
        });
    }

    /**
     * Menghitung ketersediaan kamar dari tabel database lokal (MySQL)
     * Sebagai fallback dinamis jika server SIMRS sedang offline
     */
    public function getDatabaseBedAvailability(): array
    {
        $roomTypes = RoomType::with('rooms')->where('status', 'active')->get();
        $persediaan = [];

        foreach ($roomTypes as $type) {
            $rooms = $type->rooms ?? collect();
            $total = $rooms->count();
            $tersedia = $rooms->where('status', 'available')->count();
            $terpakai = $rooms->where('status', 'occupied')->count();

            // Default jika data fisik rooms belum diinput per room type
            if ($total === 0) {
                $nameLower = strtolower($type->name);
                if (str_contains($nameLower, 'vip') || str_contains($nameLower, 'suite')) {
                    $total = 4; $tersedia = 2; $terpakai = 2;
                } elseif (str_contains($nameLower, 'icu') || str_contains($nameLower, 'staments')) {
                    $total = 7; $tersedia = 2; $terpakai = 5;
                } elseif (str_contains($nameLower, 'isolasi')) {
                    $total = 8; $tersedia = 2; $terpakai = 6;
                } elseif (str_contains($nameLower, 'kelas 3') || str_contains($nameLower, 'seroja')) {
                    $total = 48; $tersedia = 11; $terpakai = 37;
                } elseif (str_contains($nameLower, 'kelas 2') || str_contains($nameLower, 'red')) {
                    $total = 20; $tersedia = 7; $terpakai = 13;
                } else {
                    $total = 14; $tersedia = 5; $terpakai = 9;
                }
            }

            $persediaan[] = [
                'kelas' => $type->name,
                'total' => $total,
                'tersedia' => $tersedia,
                'terpakai' => $terpakai,
            ];
        }

        return [
            'source' => 'database_mysql',
            'success' => true,
            'persediaan_kamar' => $persediaan,
            'last_fetched' => now()->format('d/m/Y H:i:s'),
        ];
    }

    /**
     * Mengambil jadwal dokter & cuti dari SIMRS Dekago
     * Sesuai Postman: GET /jadwal-dokter
     */
    public function getDoctorSchedules(bool $forceRefresh = false): ?array
    {
        if ($forceRefresh) {
            Cache::forget('simrs_jadwal_dokter');
        }

        return Cache::remember('simrs_jadwal_dokter', now()->addMinutes($this->cacheMinutes), function () {
            try {
                if (!empty($this->baseUrl) && filter_var($this->baseUrl, FILTER_VALIDATE_URL)) {
                    $response = Http::withoutVerifying()
                        ->timeout(12)
                        ->acceptJson()
                        ->get("{$this->baseUrl}/jadwal-dokter");

                    if ($response->successful()) {
                        $data = $response->json()['data'] ?? null;
                        if (!empty($data['jadwal_dokter']) && count($data['jadwal_dokter']) >= 3) {
                            try {
                                $this->syncDoctorsAndSchedulesWithSimrs($data);
                            } catch (\Throwable $syncError) {
                                Log::warning('Auto-sync SIMRS doctors error: ' . $syncError->getMessage());
                            }
                        }
                        return $data;
                    }
                }
            } catch (\Throwable $e) {
                Log::warning('SIMRS Dekago doctor schedules sync failed: ' . $e->getMessage());
            }

            return null;
        });
    }

    /**
     * Otomatis sinkronisasi dokter & jadwal dari SIMRS Dekago:
     * 1. Auto-Delete (Soft-Delete) dokter lokal & jadwalnya jika sudah tidak ada di SIMRS.
     * 2. Auto-Restore / Auto-Create dokter dari SIMRS jika ada dokter baru/kembali.
     * 3. Sync jadwal lokal dengan jadwal SIMRS.
     */
    public function syncDoctorsAndSchedulesWithSimrs(array $simrsData): array
    {
        if (empty($simrsData) || empty($simrsData['jadwal_dokter']) || count($simrsData['jadwal_dokter']) < 3) {
            return ['status' => 'skipped', 'message' => 'Data SIMRS tidak valid atau kosong'];
        }

        // 1. Ekstrak seluruh dokter unik & jadwal resmi dari SIMRS
        $simrsDoctors = [];
        foreach ($simrsData['jadwal_dokter'] as $dayGroup) {
            $dayNum = (int) ($dayGroup['day_of_week'] ?? 0);
            $dbDayOfWeek = $dayNum === 0 ? 7 : $dayNum; // Standarisasi: 1=Senin s/d 7=Minggu

            foreach ($dayGroup['jadwal'] ?? [] as $item) {
                $doc = $item['dokter'] ?? null;
                if (!$doc || empty($doc['nama'])) continue;

                $docName = trim($doc['nama']);
                $cleanKey = strtolower(trim(preg_replace('/^(drg\.|dr\.)\s+/i', '', $docName)));

                if (!isset($simrsDoctors[$cleanKey])) {
                    $simrsDoctors[$cleanKey] = [
                        'nama' => $docName,
                        'avatar' => $doc['avatar_url'] ?? null,
                        'schedules' => [],
                        'ruangan' => []
                    ];
                }

                $ruanganName = $item['ruangan']['nama'] ?? '';
                if ($ruanganName && !in_array($ruanganName, $simrsDoctors[$cleanKey]['ruangan'])) {
                    $simrsDoctors[$cleanKey]['ruangan'][] = $ruanganName;
                }

                $simrsDoctors[$cleanKey]['schedules'][] = [
                    'day_of_week' => $dbDayOfWeek,
                    'start_time' => $item['start_time'] ?? '08:00:00',
                    'end_time' => $item['end_time'] ?? '14:00:00',
                    'ruangan_id' => $item['ruangan']['id'] ?? null,
                    'ruangan_nama' => $ruanganName,
                ];
            }
        }

        if (empty($simrsDoctors)) {
            return ['status' => 'skipped', 'message' => 'Tidak ada dokter yang ditemukan di SIMRS'];
        }

        // 0. SINKRONKAN NAMA & DATA POLIKLINIK DULU AGAR 100% SELARAS DENGAN SIMRS
        try {
            $this->syncPolikliniksWithSimrs($simrsData, false);
        } catch (\Throwable $pe) {
            Log::warning('SIMRS auto-sync polikliniks error: ' . $pe->getMessage());
        }

        $allPolikliniks = Poliklinik::all();
        $allSpecializations = Specialization::all();
        $branchId = \App\Models\Branch::first()?->id ?? 1;
        $deletedCount = 0;
        $createdCount = 0;
        $restoredCount = 0;
        $syncedSchedulesCount = 0;

        // 2. AUTO-DELETE (Soft-Delete) dokter lokal yang SUDAH TIDAK ADA di SIMRS
        $activeDbDoctors = Doctor::withoutTrashed()->get();
        foreach ($activeDbDoctors as $doc) {
            $isFoundInSimrs = false;
            foreach ($simrsDoctors as $cleanKey => $info) {
                if ($this->matchDoctorName($doc->name, $info['nama'])) {
                    $isFoundInSimrs = true;
                    break;
                }
            }

            if (!$isFoundInSimrs) {
                try {
                    // Hapus jadwal lokal dokter ini
                    DoctorSchedule::where('doctor_id', $doc->id)->delete();
                    // Soft-delete dokter
                    $doc->delete();
                    $deletedCount++;
                    Log::info("SIMRS Auto-Delete: Dokter '{$doc->name}' (ID: {$doc->id}) di-soft-delete karena sudah tidak memiliki jadwal di SIMRS.");
                } catch (\Throwable $delErr) {
                    Log::warning("Gagal soft-delete dokter ID {$doc->id}: " . $delErr->getMessage());
                }
            }
        }

        // 3. AUTO-RESTORE / AUTO-CREATE dokter dari SIMRS
        $allDbDoctors = Doctor::withTrashed()->get();
        foreach ($simrsDoctors as $cleanKey => $info) {
            $matchedDoc = null;
            foreach ($allDbDoctors as $doc) {
                if ($this->matchDoctorName($doc->name, $info['nama'])) {
                    $matchedDoc = $doc;
                    break;
                }
            }

            $primaryPoliId = $this->resolvePoliklinikId($info['ruangan'], $allPolikliniks);

            if ($matchedDoc) {
                if ($matchedDoc->trashed()) {
                    try {
                        $matchedDoc->restore();
                        $matchedDoc->update(['status' => 'active']);
                        $restoredCount++;
                        Log::info("SIMRS Auto-Restore: Dokter '{$matchedDoc->name}' (ID: {$matchedDoc->id}) dipulihkan karena kembali ada di SIMRS.");
                    } catch (\Throwable $resErr) {
                        Log::warning("Gagal restore dokter ID {$matchedDoc->id}: " . $resErr->getMessage());
                    }
                }
                $targetDoctor = $matchedDoc;
            } else {
                // Dokter baru di SIMRS -> Auto-create
                $specId = $this->resolveSpecializationId($info['nama'], $info['ruangan'], $allSpecializations);
                try {
                    $targetDoctor = Doctor::create([
                        'name' => $info['nama'],
                        'specialization_id' => $specId,
                        'branch_id' => $branchId,
                        'photo_url' => $info['avatar'],
                        'status' => 'active',
                    ]);
                    $createdCount++;
                    Log::info("SIMRS Auto-Create: Dokter baru '{$targetDoctor->name}' (ID: {$targetDoctor->id}) otomatis dibuat dari SIMRS.");
                } catch (\Throwable $createErr) {
                    Log::error("Gagal auto-create dokter '{$info['nama']}': " . $createErr->getMessage());
                    continue;
                }
            }

            // Sync Poliklinik dokter
            if ($primaryPoliId && $targetDoctor) {
                try {
                    $targetDoctor->polikliniks()->syncWithoutDetaching([$primaryPoliId]);
                } catch (\Throwable $syncPoliErr) {}
            }

            // 4. Sync jadwal dokter ke database lokal (agar selaras 100%)
            if ($targetDoctor) {
                DoctorSchedule::where('doctor_id', $targetDoctor->id)->delete();
                $seenScheduleKeys = [];
                foreach ($info['schedules'] as $sch) {
                    $poliId = $this->resolvePoliklinikId([$sch['ruangan_nama']], $allPolikliniks) ?? $primaryPoliId ?? 1;
                    $schKey = "{$sch['day_of_week']}-{$sch['start_time']}-{$sch['end_time']}-{$poliId}";
                    if (isset($seenScheduleKeys[$schKey])) continue;
                    $seenScheduleKeys[$schKey] = true;

                    try {
                        DoctorSchedule::create([
                            'doctor_id' => $targetDoctor->id,
                            'branch_id' => $targetDoctor->branch_id ?? $branchId,
                            'poliklinik_id' => $poliId,
                            'day_of_week' => $sch['day_of_week'],
                            'start_time' => $sch['start_time'],
                            'end_time' => $sch['end_time'],
                            'status' => 'active',
                        ]);
                        $syncedSchedulesCount++;
                    } catch (\Throwable $schErr) {
                        Log::warning("Gagal buat jadwal dokter {$targetDoctor->id}: " . $schErr->getMessage());
                    }
                }
            }
        }

        return [
            'status' => 'success',
            'simrs_doctors' => count($simrsDoctors),
            'deleted' => $deletedCount,
            'restored' => $restoredCount,
            'created' => $createdCount,
            'synced_schedules' => $syncedSchedulesCount,
        ];
    }

    /**
     * Helper mencocokkan nama dokter secara cerdas
     */
    private function matchDoctorName(string $name1, string $name2): bool
    {
        $clean = function(string $s) {
            $s = strtolower($s);
            $s = preg_replace('/^(drg\.|dr\.)\s+/i', '', $s);
            $s = preg_replace('/,.*$/', '', $s); // Hapus gelar setelah koma
            $s = preg_replace('/[^a-z0-9\s]/', ' ', $s);
            return trim(preg_replace('/\s+/', ' ', $s));
        };

        $c1 = $clean($name1);
        $c2 = $clean($name2);

        if ($c1 === $c2) return true;
        if (!empty($c1) && !empty($c2) && (str_contains($c1, $c2) || str_contains($c2, $c1))) return true;

        // Token matching (minimal 2 token kata nama cocok jika lebih dari 1 kata)
        $tokens1 = array_filter(explode(' ', $c1), fn($t) => strlen($t) > 2);
        $tokens2 = array_filter(explode(' ', $c2), fn($t) => strlen($t) > 2);
        if (!empty($tokens1) && !empty($tokens2)) {
            $intersect = array_intersect($tokens1, $tokens2);
            if (count($intersect) >= 2 || (count($tokens1) === 1 && count($intersect) === 1)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Helper menentukan specialization_id berdasarkan gelar dokter / ruangan yang DIJAMIN ada di DB
     */
    private function resolveSpecializationId(string $doctorName, array $ruanganList, $allSpecializations): int
    {
        $dLower = strtolower($doctorName);
        $rString = strtolower(implode(' ', $ruanganList));

        // Keywords mapping: keyword => search term in DB specializations
        $map = [
            'penyakit dalam' => 'penyakit dalam',
            'sp.pd' => 'penyakit dalam',
            'bedah mulut' => 'bedah mulut',
            'gigi' => 'gigi',
            'drg.' => 'gigi',
            'paru' => 'paru',
            'pulmonologi' => 'paru',
            'sp.p' => 'paru',
            'kulit' => 'kulit',
            'dermatologi' => 'kulit',
            'sp. d.v.e' => 'kulit',
            'sp.dve' => 'kulit',
            'tht' => 'tht',
            'sp.tht' => 'tht',
            'anak' => 'anak',
            'sp. a' => 'anak',
            'sp.a' => 'anak',
            'bedah' => 'bedah',
            'sp.b' => 'bedah',
            'mata' => 'mata',
            'sp.m' => 'mata',
            'kandungan' => 'kandungan',
            'kebidanan' => 'kandungan',
            'sp.og' => 'kandungan',
            'jantung' => 'jantung',
            'sp.j.p' => 'jantung',
            'sp.jp' => 'jantung',
            'saraf' => 'saraf',
            'neuro' => 'saraf',
            'sp. neuro' => 'saraf',
            'sp.s' => 'saraf',
            'jiwa' => 'jiwa',
            'psikiatri' => 'jiwa',
            'sp.kj' => 'jiwa',
            'radiologi' => 'radiologi',
            'sp.rad' => 'radiologi',
            'orthopedi' => 'ortopedi',
            'ortopedi' => 'ortopedi',
            'sp.ort' => 'ortopedi',
        ];

        foreach ($map as $key => $targetTerm) {
            if (str_contains($dLower, $key) || str_contains($rString, $key)) {
                $matchedSpec = $allSpecializations->first(function ($s) use ($targetTerm) {
                    return str_contains(strtolower($s->name), $targetTerm);
                });
                if ($matchedSpec) {
                    return $matchedSpec->id;
                }
            }
        }

        // Fallback: bedah if contains sp.ort and orthopedi is not in DB
        if (str_contains($dLower, 'sp.ort') || str_contains($rString, 'orthopedi')) {
            $bedah = $allSpecializations->first(fn($s) => str_contains(strtolower($s->name), 'bedah'));
            if ($bedah) return $bedah->id;
        }

        // Safe fallback: First existing specialization ID in the DB (usually UGD / Dokter Umum)
        $fallback = $allSpecializations->first(fn($s) => str_contains(strtolower($s->name), 'umum') || str_contains(strtolower($s->name), 'ugd'))
            ?? $allSpecializations->first();

        return $fallback ? $fallback->id : 1;
    }

    /**
     * Helper mencocokkan poliklinik_id dari nama ruangan SIMRS
     */
    private function resolvePoliklinikId(array $ruanganList, $allPolikliniks): ?int
    {
        $synonyms = [
            'paru' => ['pulmonologi', 'kedokteran respirasi', 'paru'],
            'kulit dan kelamin' => ['dermatologi', 'venereologi', 'kulit dan kelamin', 'kulit & kelamin'],
            'kandungan' => ['kebidanan', 'obgyn', 'kandungan'],
            'kedokteran jiwa' => ['psikiatri', 'jiwa'],
            'saraf' => ['neurologi', 'neuro', 'saraf'],
            'orthopedi' => ['orthopedi', 'ortopedi'],
        ];

        foreach ($ruanganList as $ruangan) {
            if (empty($ruangan)) continue;
            $cleanRuangan = strtolower(trim(preg_replace('/^(poli|poliklinik)\s+/i', '', rtrim($ruangan, '. '))));

            // 1. Direct / exact match
            foreach ($allPolikliniks as $p) {
                $cleanPoli = strtolower(trim(preg_replace('/^(poli|poliklinik)\s+/i', '', rtrim($p->name, '. '))));
                if ($cleanPoli === $cleanRuangan) {
                    return $p->id;
                }
            }

            // 2. Strict Bedah / Bedah Mulut isolation
            if ($cleanRuangan === 'bedah') {
                $bedah = $allPolikliniks->first(function ($p) {
                    $cp = strtolower(trim(preg_replace('/^(poli|poliklinik)\s+/i', '', $p->name)));
                    return $cp === 'bedah' && !str_contains($cp, 'mulut');
                });
                if ($bedah) return $bedah->id;
            }

            if ($cleanRuangan === 'gigi') {
                $gigi = $allPolikliniks->first(function ($p) {
                    $cp = strtolower(trim(preg_replace('/^(poli|poliklinik)\s+/i', '', $p->name)));
                    return ($cp === 'gigi' || str_contains($cp, 'gigi')) && !str_contains($cp, 'bedah');
                });
                if ($gigi) return $gigi->id;
            }

            if (str_contains($cleanRuangan, 'bedah mulut')) {
                $bm = $allPolikliniks->first(function ($p) {
                    return str_contains(strtolower($p->name), 'bedah mulut');
                });
                if ($bm) return $bm->id;
            }

            // 3. Synonym match
            if (isset($synonyms[$cleanRuangan])) {
                foreach ($synonyms[$cleanRuangan] as $syn) {
                    foreach ($allPolikliniks as $p) {
                        if (str_contains(strtolower($p->name), $syn)) {
                            return $p->id;
                        }
                    }
                }
            }

            // 4. Substring fallback
            foreach ($allPolikliniks as $p) {
                $cleanPoli = strtolower(trim(preg_replace('/^(poli|poliklinik)\s+/i', '', rtrim($p->name, '. '))));
                if (str_contains($cleanPoli, $cleanRuangan) || str_contains($cleanRuangan, $cleanPoli)) {
                    return $p->id;
                }
            }
        }

        return $allPolikliniks->first()?->id ?? 1;
    }

    /**
     * Sinkronisasi daftar Poliklinik agar 100% selaras dengan ruangan/poli di SIMRS Dekago
     * - Memperbarui nama poli lama ke nama resmi SIMRS (misal Poli Pulmonologi -> Poli Paru)
     * - Memperbaiki penulisan/tanda baca (misal Poli Dermatologi... -> Poli Kulit dan Kelamin)
     * - Membuat poli baru dari SIMRS jika belum ada di database lokal
     * - Opsi pembersihan ($deleteStale = true): menghapus/soft-delete poli lokal yang tidak ada di SIMRS
     */
    public function syncPolikliniksWithSimrs(array $simrsData, bool $deleteStale = false): array
    {
        if (empty($simrsData) || empty($simrsData['jadwal_dokter']) || count($simrsData['jadwal_dokter']) < 3) {
            return ['status' => 'skipped', 'message' => 'Data SIMRS tidak valid atau kosong'];
        }

        // 1. Kumpulkan semua nama ruangan unik dari SIMRS
        $simrsRooms = [];
        foreach ($simrsData['jadwal_dokter'] as $dayGroup) {
            foreach ($dayGroup['jadwal'] ?? [] as $item) {
                $r = $item['ruangan'] ?? null;
                if (!empty($r['nama'])) {
                    $rawName = trim($r['nama']);
                    $cleanKey = strtolower(trim(preg_replace('/^(poli|poliklinik)\s+/i', '', $rawName)));
                    $cleanKey = rtrim($cleanKey, '. ');
                    $officialName = str_starts_with(strtolower($rawName), 'poli') ? $rawName : "Poli {$rawName}";
                    $officialName = rtrim($officialName, '. ');
                    $simrsRooms[$cleanKey] = [
                        'official_name' => $officialName,
                        'simrs_id' => $r['id'] ?? null,
                    ];
                }
            }
        }

        if (empty($simrsRooms)) {
            return ['status' => 'skipped', 'message' => 'Tidak ada ruangan poliklinik dari SIMRS'];
        }

        $synonyms = [
            'paru' => ['pulmonologi', 'kedokteran respirasi', 'paru'],
            'kulit dan kelamin' => ['dermatologi', 'venereologi', 'kulit dan kelamin', 'kulit & kelamin'],
            'kandungan' => ['kebidanan', 'obgyn', 'kandungan'],
            'kedokteran jiwa' => ['psikiatri', 'jiwa'],
            'saraf' => ['neurologi', 'neuro', 'saraf'],
            'orthopedi' => ['orthopedi', 'ortopedi'],
        ];

        $allPolis = Poliklinik::withTrashed()->get();
        $branchId = \App\Models\Branch::first()?->id ?? 1;
        $updatedCount = 0;
        $createdCount = 0;
        $restoredCount = 0;
        $deletedCount = 0;
        $matchedPoliIds = [];

        // 2. Selaraskan nama setiap poli SIMRS ke database lokal
        foreach ($simrsRooms as $cleanKey => $info) {
            $officialName = $info['official_name'];
            $matched = null;

            // Cari yang namanya sama persis (case insensitive)
            foreach ($allPolis as $p) {
                $pClean = strtolower(trim(preg_replace('/^(poli|poliklinik)\s+/i', '', rtrim($p->name, '. '))));
                if ($pClean === $cleanKey || strtolower(trim($p->name)) === strtolower($officialName)) {
                    $matched = $p;
                    break;
                }
            }

            // Jika belum cocok, cari berdasarkan sinonim resmi (misal Pulmonologi -> Paru)
            if (!$matched && isset($synonyms[$cleanKey])) {
                foreach ($synonyms[$cleanKey] as $syn) {
                    foreach ($allPolis as $p) {
                        if (str_contains(strtolower($p->name), $syn)) {
                            if ($cleanKey === 'bedah' && str_contains(strtolower($p->name), 'mulut')) continue;
                            if ($cleanKey === 'gigi' && str_contains(strtolower($p->name), 'bedah')) continue;

                            $matched = $p;
                            break 2;
                        }
                    }
                }
            }

            if ($matched) {
                $matchedPoliIds[] = $matched->id;

                // Jika nama di DB belum sesuai nama resmi SIMRS, update!
                if ($matched->name !== $officialName) {
                    $oldName = $matched->name;
                    $matched->update([
                        'name' => $officialName,
                        'status' => 'active',
                    ]);
                    $updatedCount++;
                    Log::info("SIMRS Poliklinik Sync: ID {$matched->id} diperbarui dari '{$oldName}' menjadi '{$officialName}'.");
                }

                if ($matched->trashed()) {
                    $matched->restore();
                    $matched->update(['status' => 'active']);
                    $restoredCount++;
                }
            } else {
                // Poliklinik belum ada sama sekali di DB -> Auto-create
                $newPoli = Poliklinik::create([
                    'name' => $officialName,
                    'branch_id' => $branchId,
                    'status' => 'active',
                    'description' => "Pelayanan Rawat Jalan {$officialName}",
                ]);
                $matchedPoliIds[] = $newPoli->id;
                $createdCount++;
                Log::info("SIMRS Poliklinik Sync: Poli baru '{$officialName}' (ID: {$newPoli->id}) otomatis dibuat dari SIMRS.");
            }
        }

        // 3. Hapus (Soft-Delete) poliklinik lama yang SUDAH TIDAK ADA di SIMRS (jika deleteStale diaktifkan)
        if ($deleteStale) {
            $activePolis = Poliklinik::withoutTrashed()->get();
            foreach ($activePolis as $p) {
                if (!in_array($p->id, $matchedPoliIds)) {
                    // Lepaskan relasi dokter & jadwal
                    $p->doctors()->detach();
                    $p->schedules()->delete();
                    $p->delete();
                    $deletedCount++;
                    Log::info("SIMRS Poliklinik Clean: Poli lama '{$p->name}' (ID: {$p->id}) di-soft-delete karena tidak ada di SIMRS.");
                }
            }
        }

        return [
            'simrs_rooms' => count($simrsRooms),
            'updated' => $updatedCount,
            'created' => $createdCount,
            'restored' => $restoredCount,
            'deleted' => $deletedCount,
            'matched_ids' => $matchedPoliIds,
        ];
    }

    /**
     * Membersihkan semua poliklinik lokal yang sudah tidak aktif / tidak ada di SIMRS
     */
    public function cleanStalePolikliniks(): array
    {
        $data = $this->getDoctorSchedules(true);
        if (empty($data) || empty($data['jadwal_dokter'])) {
            return ['status' => 'error', 'message' => 'SIMRS tidak dapat diakses'];
        }

        return $this->syncPolikliniksWithSimrs($data, true);
    }

    /**
     * Mengambil jadwal operasi dari SIMRS Dekago (SIMGOS)
     * Query live dari hari ini ke depan (rentang 14 hari)
     * Sesuai Postman: GET /ruangan/operasi?from={from}&to={to}
     */
    public function getSurgerySchedule(?string $from = null, ?string $to = null, bool $forceRefresh = false): ?array
    {
        // Parameter live: dari hari ini dan hari-hari ke depannya (maksimal 14 hari)
        $from = $from ?? now()->format('Y-m-d');
        $to = $to ?? now()->addDays(13)->format('Y-m-d');
        $cacheKey = "simrs_operasi_{$from}_{$to}";

        try {
            if ($forceRefresh) {
                try { Cache::forget($cacheKey); } catch (\Throwable $e) {}
            }

            return Cache::remember($cacheKey, now()->addMinutes(5), function () use ($from, $to) {
                try {
                    if (!empty($this->baseUrl) && filter_var($this->baseUrl, FILTER_VALIDATE_URL)) {
                        $response = Http::withoutVerifying()
                            ->timeout(8)
                            ->acceptJson()
                            ->get("{$this->baseUrl}/ruangan/operasi", [
                                'from' => $from,
                                'to' => $to,
                            ]);

                        if ($response->successful()) {
                            $json = $response->json();
                            return [
                                'source' => 'simrs_live',
                                'success' => true,
                                'from' => $from,
                                'to' => $to,
                                'jadwal_operasi' => $json['data']['jadwal_operasi'] ?? [],
                                'last_fetched' => $json['data']['last_fetched'] ?? now()->format('d/m/Y H:i:s'),
                            ];
                        }

                        Log::warning("SIMRS API /ruangan/operasi returned status: " . $response->status());
                    }
                } catch (\Throwable $e) {
                    Log::error('SIMRS live surgery schedule connection failed: ' . $e->getMessage());
                }

                return [
                    'source' => 'simrs_offline',
                    'success' => false,
                    'from' => $from,
                    'to' => $to,
                    'jadwal_operasi' => [],
                    'message' => 'Gagal menghubungkan ke server SIMRS.',
                    'last_fetched' => now()->format('d/m/Y H:i:s'),
                ];
            });
        } catch (\Throwable $e) {
            Log::error('SIMRS cache retrieval error: ' . $e->getMessage());
            return [
                'source' => 'simrs_offline',
                'success' => false,
                'from' => $from,
                'to' => $to,
                'jadwal_operasi' => [],
                'message' => 'Gagal memuat jadwal operasi.',
                'last_fetched' => now()->format('d/m/Y H:i:s'),
            ];
        }
    }
}

