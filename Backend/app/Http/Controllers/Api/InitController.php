<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Doctor;
use App\Models\Poliklinik;
use App\Models\Article;
use App\Models\Facility;
use App\Models\CenterOfExcellence;
use App\Models\RoomType;
use App\Models\McuPackage;
use App\Models\Media;
use App\Models\DoctorLeave;
use App\Models\InsurancePartner;
use App\Models\HospitalInfo;
use App\Models\Specialization;
use Illuminate\Http\Request;

class InitController extends Controller
{
    /**
     * Mengambil seluruh data awal esensial rumah sakit dalam 1 request batch tunggal
     * Mengurangi overhead HTTP handshake dari 8x menjadi 1x, mempercepat loading dari ~3s menjadi ~200ms
     */
    public function index(Request $request)
    {
        $doctors = Doctor::with([
            'specialization',
            'branch',
            'polikliniks',
            'schedules.poliklinik',
            'schedules.branch',
            'leaves',
        ])
        ->orderBy('name')
        ->get();

        $polikliniks = Poliklinik::where('status', 'active')
            ->orderBy('name')
            ->get();

        $articles = Article::with('category')
            ->where('status', 'published')
            ->latest('published_at')
            ->take(15)
            ->get();

        $facilities = Facility::where('status', 'active')
            ->orderBy('name')
            ->get();

        $centers = CenterOfExcellence::where('status', 'active')
            ->orderBy('name')
            ->get();

        $roomTypes = RoomType::with(['rooms'])
            ->where('status', 'active')
            ->orderBy('price_per_night')
            ->get();

        $mcuPackages = McuPackage::where('status', 'active')
            ->orderBy('price')
            ->get();

        $media = Media::with('category')
            ->where('status', 'active')
            ->latest()
            ->take(30)
            ->get();

        $insurancePartners = InsurancePartner::where('status', 'active')
            ->orderBy('name')
            ->get();

        $doctorLeaves = DoctorLeave::with('doctor:id,name')
            ->where('status', 'active')
            ->orderBy('start_date')
            ->get();

        $simrsService = app(\App\Services\SimrsService::class);
        $force = $request->boolean('refresh') || $request->boolean('force');
        $simrsBeds = $simrsService->getBedAvailability();
        $simrsDoctorSchedules = $simrsService->getDoctorSchedules($force);
        $simrsSurgeries = $simrsService->getSurgerySchedule(null, null, $force);

        // Auto-sync avatar SIMRS ke dokter di DB jika foto di DB masih kosong atau default
        if (!empty($simrsDoctorSchedules['jadwal_dokter'])) {
            foreach ($simrsDoctorSchedules['jadwal_dokter'] as $dayItem) {
                foreach ($dayItem['jadwal'] ?? [] as $j) {
                    $docName = trim($j['dokter']['nama'] ?? '');
                    $avatar = trim($j['dokter']['avatar_url'] ?? '');
                    if (!$docName || empty($avatar)) continue;

                    $existing = $doctors->first(function ($d) use ($docName) {
                        return strtolower(trim($d->name)) === strtolower($docName);
                    });

                    if ($existing && (empty($existing->photo_url) || str_contains($existing->photo_url, 'default'))) {
                        $existing->update(['photo_url' => $avatar]);
                        $existing->photo_url = $avatar;
                    }
                }
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Data inisialisasi aplikasi berhasil dimuat',
            'data' => [
                'doctors' => $doctors,
                'polikliniks' => $polikliniks,
                'articles' => $articles,
                'facilities' => $facilities,
                'centers' => $centers,
                'room_types' => $roomTypes,
                'simrs_beds' => $simrsBeds,
                'simrs_doctor_schedules' => $simrsDoctorSchedules,
                'simrs_surgeries' => $simrsSurgeries,
                'mcu_packages' => $mcuPackages,
                'media' => $media,
                'insurance_partners' => $insurancePartners,
                'doctor_leaves' => $doctorLeaves,
                'specializations' => Specialization::orderBy('name')->get(),
                'hospital_info' => HospitalInfo::first(),
            ]
        ]);
    }
}
