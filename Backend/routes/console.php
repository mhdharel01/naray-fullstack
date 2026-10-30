<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('simrs:sync-doctors {--force : Paksa refresh cache SIMRS} {--clean-polis : Bersihkan dan hapus poliklinik lama yang tidak ada di SIMRS}', function () {
    $this->info('Memulai sinkronisasi dokter, jadwal, dan poliklinik dari SIMRS Dekago...');
    $force = (bool) $this->option('force');
    $cleanPolis = (bool) $this->option('clean-polis');
    $service = app(\App\Services\SimrsService::class);
    $data = $service->getDoctorSchedules($force);

    if (empty($data) || empty($data['jadwal_dokter'])) {
        $this->error('Gagal mengambil data jadwal dari API SIMRS.');
        return 1;
    }

    $poliResult = $service->syncPolikliniksWithSimrs($data, $cleanPolis);
    $this->info("Sinkronisasi Poliklinik Selesai:");
    $this->line("- Ruangan/Poli di SIMRS: " . ($poliResult['simrs_rooms'] ?? 0));
    $this->line("- Poli Diperbarui/Diselaraskan: " . ($poliResult['updated'] ?? 0));
    $this->line("- Poli Dibuat Baru: " . ($poliResult['created'] ?? 0));
    if ($cleanPolis) {
        $this->line("- Poli Lama Dihapus: " . ($poliResult['deleted'] ?? 0));
    }

    $result = $service->syncDoctorsAndSchedulesWithSimrs($data);
    $this->info("Sinkronisasi Dokter & Jadwal Selesai:");
    $this->line("- Dokter di SIMRS: " . ($result['simrs_doctors'] ?? 0));
    $this->line("- Dokter Di-soft-delete (Keluar): " . ($result['deleted'] ?? 0));
    $this->line("- Dokter Dipulihkan (Kembali): " . ($result['restored'] ?? 0));
    $this->line("- Dokter Dibuat Baru: " . ($result['created'] ?? 0));
    $this->line("- Sesi Jadwal Disinkronkan: " . ($result['synced_schedules'] ?? 0));
    return 0;
})->purpose('Sinkronkan master dokter, jadwal, dan poliklinik dari API SIMRS Dekago');
