<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\McuPackage;
use Illuminate\Http\Request;

class McuPackageController extends Controller
{
    public function index(Request $request)
    {
        $query = McuPackage::where('status', 'active');

        if ($request->filled('search')) {
            $query->where(
                'name',
                'like',
                '%' . $request->search . '%'
            );
        }

        $packages = $query
            ->orderBy('name')
            ->paginate(10)
            ->withQueryString();

        return response()->json([
            'success' => true,
            'message' => 'Data paket MCU berhasil diambil',
            'data' => $packages
        ]);
    }
}