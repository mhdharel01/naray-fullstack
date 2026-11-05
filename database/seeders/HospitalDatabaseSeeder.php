<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use App\Models\Admin;
use App\Models\HospitalInfo;
use App\Models\Branch;
use App\Models\Specialization;
use App\Models\Poliklinik;
use App\Models\Doctor;
use App\Models\DoctorSchedule;
use App\Models\Facility;
use App\Models\CenterOfExcellence;
use App\Models\RoomType;
use App\Models\Room;
use App\Models\McuPackage;
use App\Models\InsurancePartner;
use App\Models\ArticleCategory;
use App\Models\Article;
use App\Models\MediaCategory;
use App\Models\Media;

class HospitalDatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $jsonPath = __DIR__ . '/hospital_data.json';
        if (!file_exists($jsonPath)) {
            $this->command->error("hospital_data.json tidak ditemukan!");
            return;
        }

        $data = json_decode(file_get_contents($jsonPath), true);

        // 1. ADMIN
        $admin = Admin::firstOrCreate(
            ['email' => 'admin@narayhospital.com'],
            [
                'name' => 'Super Admin Naray',
                'password' => Hash::make('admin123')
            ]
        );

        // 2. HOSPITAL INFO
        $info = $data['hospitalInfo'] ?? [];
        HospitalInfo::firstOrCreate(
            ['name' => $info['name'] ?? 'Naray Hospital'],
            [
                'address' => $info['address'] ?? 'Jl. Dr. Wahidin No.98-99, Purnama, Dumai, Riau',
                'phone' => $info['callCenter'] ?? '+62 811-7529-798',
                'email' => $info['email'] ?? 'admin@narayhospital.com',
                'emergency_hotline' => $info['emergencyHotline'] ?? '+62 853-6339-5383',
                'operating_hours' => $info['operatingHours'] ?? 'IGD 24 Jam | Poliklinik: Senin - Sabtu',
                'logo_url' => '/mbg.png',
                'banner_image_url' => 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=1200&q=80',
                'description' => $info['aboutText'] ?? 'Rumah Sakit Modern, Nyaman & Terpercaya di Kota Dumai, Riau'
            ]
        );

        // 3. BRANCHES
        $branchMap = [];
        foreach ($data['branches'] ?? [] as $b) {
            $branch = Branch::firstOrCreate(
                ['name' => $b['name']],
                [
                    'address' => $b['address'] ?? '',
                    'phone' => $b['phone'] ?? '+62 811-7529-798',
                    'email' => 'dumai@narayhospital.com',
                    'latitude' => $b['mapCoords']['lat'] ?? 1.698878,
                    'longitude' => $b['mapCoords']['lng'] ?? 101.396898,
                    'status' => 'active'
                ]
            );
            $branchMap[$b['id']] = $branch->id;
        }

        $mainBranchId = reset($branchMap) ?: 1;

        // 4. POLIKLINIKS
        $poliMap = [];
        foreach ($data['poliklinikList'] ?? [] as $poli) {
            $createdPoli = Poliklinik::firstOrCreate(
                ['name' => $poli['name']],
                [
                    'description' => $poli['desc'] ?? '',
                    'branch_id' => $mainBranchId,
                    'image_url' => null,
                    'status' => 'active'
                ]
            );
            $poliMap[$poli['id']] = $createdPoli->id;
            $poliMap[strtolower($poli['name'])] = $createdPoli->id;
        }

        // 5. SPECIALIZATIONS
        $specMap = [];
        $specializationNames = [
            'UGD & Dokter Umum', 'Penyakit Dalam', 'Gigi & Mulut', 'Paru & Pernapasan',
            'Kulit & Kelamin', 'THT-KL', 'Anak & Pediatrik', 'Bedah', 'Mata',
            'Kebidanan & Kandungan', 'Jantung & Pembuluh Darah', 'Saraf & Neurologi',
            'Psikiatri & Jiwa', 'Geriatri & Rehabilitasi'
        ];

        foreach ($specializationNames as $specName) {
            $spec = Specialization::firstOrCreate(
                ['name' => $specName],
                [
                    'slug' => Str::slug($specName),
                    'description' => "Layanan medis bidang {$specName}"
                ]
            );
            $specMap[$specName] = $spec->id;
        }

        // 6. DOCTORS & SCHEDULES
        $dayIndex = [
            'senin' => 1, 'selasa' => 2, 'rabu' => 3,
            'kamis' => 4, 'jumat' => 5, 'sabtu' => 6, 'minggu' => 7
        ];

        foreach ($data['doctors'] ?? [] as $d) {
            $specGroup = $d['specialtyGroup'] ?? 'UGD & Dokter Umum';
            $specId = $specMap[$specGroup] ?? (reset($specMap) ?: 1);
            $bId = $branchMap[$d['branchId'] ?? ''] ?? $mainBranchId;

            $doctor = Doctor::firstOrCreate(
                ['name' => $d['name']],
                [
                    'specialization_id' => $specId,
                    'branch_id' => $bId,
                    'phone' => '+62 811-7529-798',
                    'email' => Str::slug($d['name']) . '@narayhospital.com',
                    'photo_url' => $d['photo'] ?? null,
                    'bio' => ($d['bio'] ?? '') . "\n\nPendidikan: " . ($d['education'] ?? '') . "\nSub-Spesialisasi: " . ($d['subSpecialty'] ?? ''),
                    'status' => 'active'
                ]
            );

            // Connect doctor to related poliklinik
            $matchedPoliId = null;
            $specLower = strtolower($d['specialty']);
            foreach ($poliMap as $key => $pId) {
                if (str_contains($key, 'poli-')) {
                    $slugPart = str_replace('poli-', '', $key);
                    if (str_contains($specLower, $slugPart)) {
                        $matchedPoliId = $pId;
                        break;
                    }
                }
            }
            if (!$matchedPoliId) {
                $matchedPoliId = reset($poliMap);
            }

            if ($matchedPoliId) {
                DB::table('doctor_poliklinik')->updateOrInsert(
                    ['doctor_id' => $doctor->id, 'poliklinik_id' => $matchedPoliId],
                    []
                );
            }

            // Create Doctor Schedules
            if (!empty($d['availableDays'])) {
                foreach ($d['availableDays'] as $dayName) {
                    $dLower = strtolower(trim($dayName));
                    $dayNum = $dayIndex[$dLower] ?? 1;

                    // Parse start and end time if present in schedules
                    $startTime = '09:00:00';
                    $endTime = '14:00:00';
                    if (!empty($d['schedules'])) {
                        $schText = $d['schedules'][0]['time'] ?? '';
                        if (preg_match('/(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})/', $schText, $m)) {
                            $startTime = $m[1] . ':00';
                            $endTime = $m[2] . ':00';
                        }
                    }

                    DoctorSchedule::firstOrCreate(
                        [
                            'doctor_id' => $doctor->id,
                            'day_of_week' => $dayNum,
                            'start_time' => $startTime
                        ],
                        [
                            'branch_id' => $bId,
                            'poliklinik_id' => $matchedPoliId,
                            'end_time' => $endTime,
                            'status' => 'active'
                        ]
                    );
                }
            }
        }

        // 7. FACILITIES
        foreach ($data['facilitiesData'] ?? [] as $item) {
            $cat = $item['category'] ?? '';
            $type = (str_contains(strtolower($cat), 'gawat') || str_contains(strtolower($cat), 'kritis') || str_contains(strtolower($cat), 'bedah')) ? 'advanced' : 'basic';
            Facility::firstOrCreate(
                ['name' => $item['name']],
                [
                    'type' => $type,
                    'description' => "Kategori: {$cat}\n" . ($item['description'] ?? ''),
                    'image_url' => $item['image'] ?? null,
                    'status' => 'active',
                    'branch_id' => $mainBranchId
                ]
            );
        }

        // 8. CENTERS OF EXCELLENCE
        foreach ($data['centersOfExcellence'] ?? [] as $c) {
            CenterOfExcellence::firstOrCreate(
                ['name' => $c['title']],
                [
                    'slug' => $c['id'] ?? Str::slug($c['title']),
                    'description' => ($c['tagline'] ?? '') . "\n" . ($c['description'] ?? ''),
                    'image_url' => $c['image'] ?? null,
                    'status' => 'active',
                    'branch_id' => $mainBranchId
                ]
            );
        }

        // 9. ROOM TYPES & ROOMS
        foreach ($data['inpatientRooms'] ?? [] as $idx => $r) {
            $price = 500000;
            if (preg_match('/Rp\s*([\d\.]+)/', $r['price'] ?? '', $m)) {
                $price = (float) str_replace('.', '', $m[1]);
            }

            $roomType = RoomType::firstOrCreate(
                ['name' => $r['name']],
                [
                    'description' => ($r['tagline'] ?? '') . "\n" . ($r['description'] ?? ''),
                    'price_per_night' => $price,
                    'image_url' => $r['image'] ?? null,
                    'status' => 'active',
                    'branch_id' => $mainBranchId
                ]
            );

            // Create 3 sample rooms for each type
            for ($num = 1; $num <= 3; $num++) {
                $roomNo = sprintf("%d0%d", $idx + 1, $num);
                Room::firstOrCreate(
                    [
                        'branch_id' => $mainBranchId,
                        'room_number' => $roomNo
                    ],
                    [
                        'room_type_id' => $roomType->id,
                        'floor' => 'Lantai ' . ($idx + 1),
                        'status' => 'available',
                        'image_url' => $r['image'] ?? null
                    ]
                );
            }
        }

        // 10. MCU PACKAGES
        foreach ($data['mcuPackages'] ?? [] as $mcu) {
            $price = 750000;
            if (preg_match('/Rp\s*([\d\.]+)/', $mcu['price'] ?? '', $m)) {
                $price = (float) str_replace('.', '', $m[1]);
            }

            $highlight = $mcu['highlight'] ?? ($mcu['tagline'] ?? '');
            $items = !empty($mcu['items']) ? $mcu['items'] : (!empty($mcu['features']) ? $mcu['features'] : []);
            $itemsText = !empty($items) ? implode("\n- ", $items) : '';
            $description = $highlight . ($itemsText ? "\n- " . $itemsText : '');

            McuPackage::updateOrCreate(
                ['slug' => $mcu['id'] ?? \Illuminate\Support\Str::slug($mcu['name'])],
                [
                    'name' => $mcu['name'],
                    'description' => $description,
                    'price' => $price,
                    'image_url' => $mcu['image'] ?? null,
                    'status' => 'active'
                ]
            );
        }

        // 11. INSURANCE PARTNERS
        foreach ($data['insurancePartners'] ?? [] as $ins) {
            InsurancePartner::firstOrCreate(
                ['name' => $ins['name']],
                [
                    'logo_url' => null,
                    'description' => 'Mitra Asuransi Resmi Naray Hospital',
                    'status' => 'active'
                ]
            );
        }

        // 12. ARTICLE CATEGORIES & ARTICLES
        $artCategory = ArticleCategory::firstOrCreate(
            ['name' => 'Kesehatan Umum'],
            [
                'slug' => 'kesehatan-umum'
            ]
        );

        foreach ($data['healthArticles'] ?? [] as $art) {
            Article::firstOrCreate(
                ['slug' => $art['id'] ?? Str::slug($art['title'])],
                [
                    'title' => $art['title'],
                    'content' => $art['content'] ?? ($art['snippet'] ?? 'Artikel edukasi kesehatan Naray Hospital.'),
                    'thumbnail_url' => $art['image'] ?? null,
                    'category_id' => $artCategory->id,
                    'status' => 'published',
                    'published_at' => now()
                ]
            );
        }

        // 13. MEDIA CATEGORIES & MEDIA
        $mediaCat = MediaCategory::firstOrCreate(
            ['name' => 'Galeri Aktivitas'],
            [
                'slug' => 'galeri-aktivitas'
            ]
        );

        foreach ($data['galleryActivities'] ?? [] as $gal) {
            Media::firstOrCreate(
                ['url' => $gal['image']],
                [
                    'type' => 'image',
                    'title' => $gal['title'] ?? 'Galeri Naray Hospital',
                    'description' => $gal['category'] ?? 'Aktivitas RS',
                    'category_id' => $mediaCat->id,
                    'uploaded_by' => $admin->id,
                    'status' => 'active'
                ]
            );
        }

        $this->command->info("Seeding data Naray Hospital berhasil diselesaikan!");
    }
}
