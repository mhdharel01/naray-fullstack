<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Service;
use Illuminate\Http\Request;

class ServiceController extends Controller
{
    public function index(Request $request)
    {
        $query = Service::where('status', 'active');

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

        $services = $query
            ->orderBy('name')
            ->paginate(10)
            ->withQueryString();

        return response()->json([
            'success' => true,
            'message' => 'Data layanan berhasil diambil',
            'data' => $services
        ]);
    }
}