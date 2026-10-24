<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\HospitalInfo;
use Illuminate\Http\Request;

class HospitalInfoController extends Controller
{
    public function index()
    {
        $data = HospitalInfo::latest()->get();

        return response()->json([
            'success' => true,
            'message' => 'Data informasi rumah sakit berhasil diambil',
            'data' => $data,
        ]);
    }

    public function store(Request $request)
    {
        if (HospitalInfo::exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Data informasi rumah sakit sudah tersedia. Gunakan PUT untuk memperbaruinya.',
            ], 409);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'address' => ['required', 'string'],
            'phone' => ['required', 'string', 'max:50'],
            'email' => ['nullable', 'email', 'max:255'],
            'emergency_hotline' => ['nullable', 'string', 'max:50'],
            'operating_hours' => ['nullable', 'string'],
            'logo_url' => ['nullable', 'string', 'max:2048'],
            'banner_image_url' => ['nullable', 'string', 'max:2048'],
            'description' => ['nullable', 'string'],
        ]);

        $info = HospitalInfo::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Informasi rumah sakit berhasil ditambahkan',
            'data' => $info,
        ], 201);
    }

    public function show($id)
    {
        $info = HospitalInfo::findOrFail($id);

        return response()->json([
            'success' => true,
            'message' => 'Detail informasi rumah sakit berhasil diambil',
            'data' => $info,
        ]);
    }

    public function update(Request $request, $id)
    {
        $info = HospitalInfo::findOrFail($id);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'address' => ['required', 'string'],
            'phone' => ['required', 'string', 'max:50'],
            'email' => ['nullable', 'email', 'max:255'],
            'emergency_hotline' => ['nullable', 'string', 'max:50'],
            'operating_hours' => ['nullable', 'string'],
            'logo_url' => ['nullable', 'string', 'max:2048'],
            'banner_image_url' => ['nullable', 'string', 'max:2048'],
            'description' => ['nullable', 'string'],
        ]);

        $info->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Informasi rumah sakit berhasil diperbarui',
            'data' => $info->fresh(),
        ]);
    }

    public function destroy($id)
    {
        $info = HospitalInfo::findOrFail($id);

        $info->delete();

        return response()->json([
            'success' => true,
            'message' => 'Informasi rumah sakit berhasil dihapus',
        ]);
    }
}