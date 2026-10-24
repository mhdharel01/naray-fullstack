<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CenterOfExcellence;
use Illuminate\Http\Request;

class CenterOfExcellenceController extends Controller
{
    public function index(Request $request)
    {
        $query = CenterOfExcellence::where('status', 'active');

        if ($request->filled('search')) {
            $query->where(
                'name',
                'like',
                '%' . $request->search . '%'
            );
        }

        if ($request->filled('branch_id')) {
            $branchId = $request->branch_id;

            $query->where(function ($q) use ($branchId) {
                $q->where('branch_id', $branchId)
                  ->orWhereNull('branch_id');
            });
        }

        $centers = $query
            ->orderBy('name')
            ->paginate($request->get('per_page', 50))
            ->withQueryString();

        return response()->json([
            'success' => true,
            'message' => 'Data center of excellence berhasil diambil',
            'data' => $centers
        ]);
    }
}