<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\HospitalInfo;

class HospitalInfoController extends Controller
{
    public function index()
    {
        $info = HospitalInfo::first();

        if (!$info) {
            return response()->json([
                'success' => false,
                'message' => 'Informasi rumah sakit belum tersedia',
                'data' => null
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Informasi rumah sakit berhasil diambil',
            'data' => $info
        ]);
    }
}