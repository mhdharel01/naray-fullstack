<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Doctor;
use App\Models\Patient;
use App\Models\Article;
use App\Models\Poliklinik;
use App\Models\RoomType;
use App\Models\McuPackage;
use App\Models\Facility;
use App\Models\Media;
use Illuminate\Http\Request;

class InitController extends Controller
{
    /**
     * Mengambil seluruh data awal penting dashboard admin dalam 1 batch request:
     * - Statistik agregat (pasien, janji aktif, dokter, dll)
     * - Daftar janji temu (appointments) terbaru beserta relasi lengkap
     * - Ringkasan jumlah entitas sistem
     */
    public function index(Request $request)
    {
        $today = now()->toDateString();

        // 1. Agregasi Statistik Ringkas
        $totalPatients = Patient::count();
        $todayAppointments = Appointment::whereDate('scheduled_date', $today)->count();
        $activeAppointments = Appointment::whereIn('status', ['pending', 'confirmed', 'PENDING', 'CONFIRMED'])->count();
        $activeDoctors = Doctor::where('status', 'active')->count();
        $totalAppointments = Appointment::count();

        $stats = [
            'total_patients' => $totalPatients,
            'today_appointments' => $todayAppointments,
            'active_appointments' => $activeAppointments,
            'active_doctors' => $activeDoctors,
            'total_appointments' => $totalAppointments,
            'total_articles' => Article::count(),
            'total_polikliniks' => Poliklinik::count(),
            'total_rooms' => RoomType::count(),
            'total_mcu_packages' => McuPackage::count(),
            'total_facilities' => Facility::count(),
            'total_media' => Media::count(),
        ];

        // 2. Daftar Janji Temu dengan Eager Loading
        $appointments = Appointment::with([
            'patient',
            'doctor.specialization',
            'doctor.branch',
            'poliklinik.branch',
            'branch',
            'schedule',
        ])
        ->latest('created_at')
        ->take(100)
        ->get();

        return response()->json([
            'success' => true,
            'message' => 'Data inisialisasi admin berhasil dimuat',
            'data' => [
                'stats' => $stats,
                'appointments' => $appointments,
            ]
        ]);
    }
}
