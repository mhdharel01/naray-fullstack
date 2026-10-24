<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\SimrsService;
use Illuminate\Http\Request;

class SimrsController extends Controller
{
    protected SimrsService $simrsService;

    public function __construct(SimrsService $simrsService)
    {
        $this->simrsService = $simrsService;
    }

    /**
     * Feed Ketersediaan Tempat Tidur Real-time (SIMRS Dekago)
     * GET /api/kamar/persediaan
     */
    public function beds(Request $request)
    {
        $data = $this->simrsService->getBedAvailability();

        return response()->json([
            'status' => 'success',
            'message' => 'Data persediaan kamar berhasil dimuat',
            'data' => $data,
        ]);
    }

    /**
     * Feed Jadwal Operasi Pasien (SIMGOS / SIMRS Dekago)
     * GET /api/ruangan/operasi?from={from}&to={to}
     */
    public function surgeries(Request $request)
    {
        $from = $request->query('from');
        $to = $request->query('to');

        $data = $this->simrsService->getSurgerySchedule($from, $to);

        return response()->json([
            'status' => 'success',
            'message' => 'Data jadwal operasi berhasil dimuat',
            'data' => $data ?? ['jadwal_operasi' => []],
        ]);
    }

    /**
     * Feed Jadwal Dokter Real-time (SIMRS Dekago)
     * GET /api/v1/jadwal-dokter
     */
    public function doctorSchedules(Request $request)
    {
        $data = $this->simrsService->getDoctorSchedules();

        return response()->json([
            'status' => 'success',
            'message' => 'Data jadwal dokter berhasil dimuat',
            'data' => $data ?? ['jadwal_dokter' => []],
        ]);
    }
}

