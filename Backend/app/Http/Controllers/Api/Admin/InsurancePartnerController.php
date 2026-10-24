<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\InsurancePartner;
use Illuminate\Http\Request;

class InsurancePartnerController extends Controller
{
    /**
     * Menampilkan semua insurance partner.
     */
    public function index(Request $request)
    {
        $query = InsurancePartner::query();

        // Search berdasarkan nama atau deskripsi
        if ($request->filled('search')) {
            $search = $request->search;

            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Filter berdasarkan status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $insurancePartners = $query
            ->latest()
            ->paginate(10);

        return response()->json($insurancePartners);
    }

    /**
     * Menyimpan insurance partner baru.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'logo_url' => ['nullable', 'string', 'max:2048'],
            'description' => ['nullable', 'string'],
            'status' => ['required', 'in:active,inactive'],
        ]);

        $insurancePartner = InsurancePartner::create($validated);

        return response()->json([
            'message' => 'Insurance partner berhasil ditambahkan.',
            'data' => $insurancePartner,
        ], 201);
    }

    /**
     * Menampilkan satu insurance partner.
     */
    public function show(InsurancePartner $insurancePartner)
    {
        return response()->json([
            'data' => $insurancePartner,
        ]);
    }

    /**
     * Memperbarui insurance partner.
     */
    public function update(Request $request, InsurancePartner $insurancePartner)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'logo_url' => ['nullable', 'string', 'max:2048'],
            'description' => ['nullable', 'string'],
            'status' => ['required', 'in:active,inactive'],
        ]);

        $insurancePartner->update($validated);

        return response()->json([
            'message' => 'Insurance partner berhasil diperbarui.',
            'data' => $insurancePartner->fresh(),
        ]);
    }

    /**
     * Menghapus insurance partner.
     */
    public function destroy(InsurancePartner $insurancePartner)
    {
        $insurancePartner->delete();

        return response()->json([
            'message' => 'Insurance partner berhasil dihapus.',
        ]);
    }
}