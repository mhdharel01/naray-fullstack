<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Patient;
use Illuminate\Http\Request;

class PatientController extends Controller
{
    public function index(Request $request)
    {
        $query = Patient::query();

        if ($request->filled('search')) {
            $search = $request->search;

            $query->where(function ($q) use ($search) {
                $q->where('full_name', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        return response()->json([
            'success' => true,
            'message' => 'Data pasien berhasil diambil',
            'data' => $query->latest()->paginate(15),
        ]);
    }

    public function show($id)
    {
        $patient = Patient::with([
            'appointments',
            'roomBookings.room.roomType',
        ])->findOrFail($id);

        return response()->json([
            'success' => true,
            'message' => 'Detail pasien berhasil diambil',
            'data' => $patient,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'full_name' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:30'],
            'email' => ['nullable', 'email', 'max:255'],
        ]);

        $patient = Patient::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Pasien berhasil dibuat',
            'data' => $patient,
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $patient = Patient::findOrFail($id);

        $validated = $request->validate([
            'full_name' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:30'],
            'email' => ['nullable', 'email', 'max:255'],
        ]);

        $patient->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Data pasien berhasil diperbarui',
            'data' => $patient,
        ]);
    }

    public function destroy($id)
    {
        $patient = Patient::findOrFail($id);

        $patient->delete();

        return response()->json([
            'success' => true,
            'message' => 'Pasien berhasil dihapus',
        ]);
    }
}