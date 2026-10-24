<?php

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\RoomType;

echo "Updating room types in database...\n";

// Remove junk test user room if present
RoomType::where('name', 'user')->delete();

$updates = [
    1 => [
        'name' => 'Pistillum Suite (VIP / VVIP)',
        'price_per_night' => 1500000.00,
        'image_url' => '/images/rooms/room-vip.jpg',
        'description' => "- Tempat Tidur Elektrik Ergonomis\n- Smart TV 55 Inch & Wi-Fi Berkecepatan Tinggi\n- Kamar Mandi Pribadi & Water Heater\n- Sofa Bed Keluarga & Kulkas Mini\n- Nurse Call 24 Jam Siaga"
    ],
    2 => [
        'name' => 'Staments 1 – Ruang ICU (Intensive Care Unit)',
        'price_per_night' => 1250000.00,
        'image_url' => '/images/rooms/room-icu.jpg',
        'description' => "- Tempat Tidur ICU Elektrik Multiposisi\n- Bedside Patient Monitor & Defibrillator Siaga\n- Ventilator & Central Oxygen Terintegrasi\n- Syringe Pump & Infusion Pump Digital\n- Pengawasan Dokter Intensivis & Perawat 24 Jam"
    ],
    3 => [
        'name' => 'Green Petals (Kamar Rawat Kelas 1)',
        'price_per_night' => 750000.00,
        'image_url' => '/images/rooms/room-class1.jpg',
        'description' => "- Tempat Tidur Pasien Elektrik\n- Pendingin Ruangan (AC) & Smart TV\n- Kamar Mandi Dalam & Water Heater\n- Kursi Penunggu Pasien Nyaman\n- Nurse Call System 24 Jam"
    ],
    4 => [
        'name' => 'Red Petals (Kamar Rawat Kelas 2)',
        'price_per_night' => 500000.00,
        'image_url' => '/images/rooms/room-class2.jpg',
        'description' => "- 2 Tempat Tidur dengan Tirai Privasi Medis\n- Pendingin Ruangan (AC) Sentral\n- Kamar Mandi Dalam Bersih\n- Meja Makan Pasien & Lemari Pasien\n- Nurse Call System 24 Jam"
    ],
    5 => [
        'name' => 'Seroja (Kamar Rawat Inap Reguler)',
        'price_per_night' => 250000.00,
        'image_url' => '/images/rooms/room-class3.jpg',
        'description' => "- Ranjang Pasien Medis dengan Tirai Penyekat\n- Pendingin Ruangan (AC) & Sirkulasi Udara Baik\n- Kamar Mandi Terawat & Bersih\n- Standar Kelas Rawat Inap Standar (KRIS) BPJS\n- Nurse Call System di Setiap Bed"
    ],
    6 => [
        'name' => 'Ruang Rawat Isolasi Khusus',
        'price_per_night' => 850000.00,
        'image_url' => '/images/rooms/room-isolation.jpg',
        'description' => "- Ruang Bertekanan Negatif dengan HEPA Filter\n- Ruang Antara (Anteroom) Standar PPI Kemenkes\n- Monitor Parameter Medis Pasien Terintegrasi\n- Kamar Mandi Khusus Isolasi\n- Jalur Perawatan Steril & Pengawasan CCTV Medis"
    ]
];

foreach ($updates as $id => $data) {
    $room = RoomType::find($id);
    if ($room) {
        $room->update($data);
        echo "Updated Room ID {$id}: {$data['name']}\n";
    } else {
        RoomType::create(array_merge(['id' => $id], $data));
        echo "Created Room ID {$id}: {$data['name']}\n";
    }
}

echo "Done updating room types!\n";
