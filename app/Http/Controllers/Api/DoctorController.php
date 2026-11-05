<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Doctor;
use Illuminate\Http\Request;

class DoctorController extends Controller
{
    public function index(Request $request)
    {
        $query = Doctor::with([
            'specialization',
            'branch',
            'polikliniks',
            'schedules.poliklinik',
            'schedules.branch',
        ]);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        /*
        |--------------------------------------------------------------------------
        | SEARCH
        |--------------------------------------------------------------------------
        */

        if ($request->filled('search')) {
            $search = $request->search;

            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhereHas('specialization', function ($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%");
                  });
            });
        }

        /*
        |--------------------------------------------------------------------------
        | FILTER BRANCH
        |--------------------------------------------------------------------------
        */

        if ($request->filled('branch_id')) {
            $branchId = $request->branch_id;

            $query->where(function ($q) use ($branchId) {
                $q->where('branch_id', $branchId)
                  ->orWhereNull('branch_id');
            });
        }

        /*
        |--------------------------------------------------------------------------
        | FILTER SPECIALIZATION
        |--------------------------------------------------------------------------
        */

        if ($request->filled('specialization_id')) {
            $query->where(
                'specialization_id',
                $request->specialization_id
            );
        }

        $perPage = $request->get('per_page', 50);
        $doctors = $query
            ->orderBy('name')
            ->paginate($perPage)
            ->withQueryString();

        return response()->json([
            'success' => true,
            'message' => 'Data dokter berhasil diambil',
            'data' => $doctors
        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | DETAIL DOKTER
    |--------------------------------------------------------------------------
    */

    public function show($id)
    {
        $doctor = Doctor::with([
            'specialization',
            'branch',
            'polikliniks',
            'schedules.branch',
            'schedules.poliklinik'
        ])
        ->where('status', 'active')
        ->find($id);

        if (!$doctor) {
            return response()->json([
                'success' => false,
                'message' => 'Dokter tidak ditemukan',
                'data' => null
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Detail dokter berhasil diambil',
            'data' => $doctor
        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | JADWAL DOKTER
    |--------------------------------------------------------------------------
    */

    public function schedule($id)
    {
        $doctor = Doctor::where('status', 'active')
            ->find($id);

        if (!$doctor) {
            return response()->json([
                'success' => false,
                'message' => 'Dokter tidak ditemukan',
                'data' => null
            ], 404);
        }

        $schedules = $doctor->schedules()
            ->with([
                'branch',
                'poliklinik'
            ])
            ->where('status', 'active')
            ->orderBy('day_of_week')
            ->orderBy('start_time')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Jadwal dokter berhasil diambil',
            'data' => [
                'doctor' => $doctor,
                'schedules' => $schedules
            ]
        ]);
    }
}