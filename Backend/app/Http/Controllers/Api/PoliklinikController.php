<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Poliklinik;
use Illuminate\Http\Request;

class PoliklinikController extends Controller
{
    public function index(Request $request)
    {
        $query = Poliklinik::with([
            'branch',
            'doctors'
        ])
        ->where('status', 'active');

        if ($request->filled('search')) {
            $search = $request->search;

            $query->where('name', 'like', "%{$search}%");
        }

        if ($request->filled('branch_id')) {
            $branchId = $request->branch_id;

            $query->where(function ($q) use ($branchId) {
                $q->where('branch_id', $branchId)
                  ->orWhereNull('branch_id');
            });
        }

        $perPage = $request->get('per_page', 50);
        $polikliniks = $query
            ->orderBy('name')
            ->paginate($perPage)
            ->withQueryString();

        return response()->json([
            'success' => true,
            'message' => 'Data poliklinik berhasil diambil',
            'data' => $polikliniks
        ]);
    }
}