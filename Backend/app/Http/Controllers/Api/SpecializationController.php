<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Specialization;

class SpecializationController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->integer('per_page', 50);
        $specializations = Specialization::orderBy('id')
            ->paginate($perPage);

        return response()->json([
            'success' => true,
            'message' => 'Data spesialisasi berhasil diambil',
            'data' => $specializations
        ]);
    }
}
