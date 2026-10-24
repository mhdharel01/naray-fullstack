<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Poliklinik;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class PoliklinikController extends Controller
{
    public function index(Request $request)
    {
        $query = Poliklinik::query()
            ->with('branch')
            ->withCount('doctors');

        if ($request->filled('search')) {
            $search = $request->search;

            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($request->filled('branch_id')) {
            $query->where('branch_id', $request->branch_id);
        }

        if ($request->filled('status')) {
            $query->where('status', strtolower($request->status));
        }

        return response()->json([
            'success' => true,
            'message' => 'Data poliklinik berhasil diambil',
            'data' => $query->orderBy('name')->paginate(15),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'branch_id' => ['nullable', 'integer', 'exists:branches,id'],
            'image_url' => ['nullable', 'string', 'max:2048'],
            'status' => ['required', Rule::in(['active', 'inactive'])],
        ]);

        $poliklinik = Poliklinik::create($validated);

        $poliklinik->load('branch');

        return response()->json([
            'success' => true,
            'message' => 'Poliklinik berhasil ditambahkan',
            'data' => $poliklinik,
        ], 201);
    }

    public function show($id)
    {
        $poliklinik = Poliklinik::with([
            'branch',
            'doctors',
            'schedules',
            'appointments',
        ])->findOrFail($id);

        return response()->json([
            'success' => true,
            'message' => 'Detail poliklinik berhasil diambil',
            'data' => $poliklinik,
        ]);
    }

    public function update(Request $request, $id)
    {
        $poliklinik = Poliklinik::findOrFail($id);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'branch_id' => ['nullable', 'integer', 'exists:branches,id'],
            'image_url' => ['nullable', 'string', 'max:2048'],
            'status' => ['required', Rule::in(['active', 'inactive'])],
        ]);

        $poliklinik->update($validated);

        $poliklinik->load('branch');

        return response()->json([
            'success' => true,
            'message' => 'Poliklinik berhasil diperbarui',
            'data' => $poliklinik->fresh()->load('branch'),
        ]);
    }

    public function destroy($id)
    {
        $poliklinik = Poliklinik::findOrFail($id);

        $poliklinik->delete();

        return response()->json([
            'success' => true,
            'message' => 'Poliklinik berhasil dihapus',
        ]);
    }
}