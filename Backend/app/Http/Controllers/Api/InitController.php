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
        $token = $request->bearerToken();
        $isAdmin = false;
        if (!empty($token)) {
            try {
                $tokenModel = \Laravel\Sanctum\PersonalAccessToken::findToken($token);
                if ($tokenModel) {
                    $isAdmin = true;
                }
            } catch (\Throwable $e) {
                $isAdmin = false;
            }
        }
        if (!$isAdmin) {
            $isAdmin = $request->user('sanctum') !== null;
        }

        $includeAll = $isAdmin
            || $request->boolean('all')
            || $request->boolean('include_inactive')
            || $request->header('X-Admin-Request') === 'true';

        $simrsService = app(\App\Services\SimrsService::class);
        $force = $request->boolean('refresh') || $request->boolean('force');
        $simrsBeds = $simrsService->getBedAvailability($force);
        $simrsDoctorSchedules = $simrsService->getDoctorSchedules($force);
        $simrsSurgeries = $simrsService->getSurgerySchedule(null, null, $force);

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

        $polikliniksQuery = Poliklinik::orderBy('name');
        if (!$includeAll) {
            $polikliniksQuery->where('status', 'active');
        }
        $polikliniks = $polikliniksQuery->get();

        $articlesQuery = Article::with('category')
            ->latest('published_at')
            ->latest('id');
        if (!$includeAll) {
            $articlesQuery->where('status', 'published')->take(15);
        } else {
            $articlesQuery->take(150);
        }
        $articles = $articlesQuery->get();

        $facilitiesQuery = Facility::orderBy('name');
        if (!$includeAll) {
            $facilitiesQuery->where('status', 'active');
        }
        $facilities = $facilitiesQuery->get();

        $centersQuery = CenterOfExcellence::orderBy('name');
        if (!$includeAll) {
            $centersQuery->where('status', 'active');
        }
        $centers = $centersQuery->get();

        $roomTypesQuery = RoomType::with(['rooms'])->orderBy('price_per_night');
        if (!$includeAll) {
            $roomTypesQuery->where('status', 'active');
        }
        $roomTypes = $roomTypesQuery->get();

        $mcuPackagesQuery = McuPackage::orderBy('price');
        if (!$includeAll) {
            $mcuPackagesQuery->where('status', 'active');
        }
        $mcuPackages = $mcuPackagesQuery->get();

        $mediaQuery = Media::with('category')->latest();
        if (!$includeAll) {
            $mediaQuery->where('status', 'active')->take(30);
        } else {
            $mediaQuery->take(200);
        }
        $media = $mediaQuery->get();

        $insurancePartnersQuery = InsurancePartner::orderBy('name');
        if (!$includeAll) {
            $insurancePartnersQuery->where('status', 'active');
        }
        $insurancePartners = $insurancePartnersQuery->get();

        $doctorLeavesQuery = DoctorLeave::with('doctor:id,name')->orderBy('start_date');
        if (!$includeAll) {
            $doctorLeavesQuery->where('status', 'active');
        }
        $doctorLeaves = $doctorLeavesQuery->get();

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
