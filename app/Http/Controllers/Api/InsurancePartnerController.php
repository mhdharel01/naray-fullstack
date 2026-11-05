<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\InsurancePartner;

class InsurancePartnerController extends Controller
{
    public function index()
    {
        $partners = InsurancePartner::where('status', 'active')
            ->orderBy('name')
            ->paginate(50);

        return response()->json([
            'success' => true,
            'message' => 'Data partner asuransi berhasil diambil',
            'data' => $partners
        ]);
    }
}