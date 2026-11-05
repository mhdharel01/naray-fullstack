<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Specialization;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class SpecializationController extends Controller
{
    // GET /api/admin/specializations
    public function index(Request $request)
    {
        $query = Specialization::query();

        if ($request->filled('search')) {
            $search = $request->search;

            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('slug', 'like', "%{$search}%");
            });
        }

        $specializations = $query
            ->withCount('doctors')
            ->orderBy('name')
            ->paginate($request->integer('per_page', 10));

        return response()->json([
            'success' => true,
            'message' => 'Data spesialisasi berhasil diambil',
            'data' => $specializations,
        ]);
    }

    // GET /api/admin/specializations/{id}
    public function show($id)
    {
        $specialization = Specialization::with('doctors')->find($id);

        if (!$specialization) {
            return response()->json([
                'success' => false,
                'message' => 'Spesialisasi tidak ditemukan',
                'data' => null,
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Data spesialisasi berhasil diambil',
            'data' => $specialization,
        ]);
    }

    // POST /api/admin/specializations
    public function store(Request $request)
    {
        $name = trim($request->input('name', ''));

        if (empty($name)) {
            return response()->json([
                'success' => false,
                'message' => 'Nama spesialisasi wajib diisi.',
                'errors' => [
                    'name' => ['Nama spesialisasi wajib diisi.']
                ]
            ], 422);
        }

        $baseSlug = \Illuminate\Support\Str::slug($name);
        if (empty($baseSlug)) {
            $baseSlug = 'spesialis-' . time();
        }

        // Cek apakah spesialisasi dengan nama atau slug ini sudah terdaftar sebelumnya (termasuk yang di-soft-delete)
        $existing = Specialization::withTrashed()
            ->where(function ($q) use ($name, $baseSlug) {
                $q->where('name', $name)
                  ->orWhere('slug', $baseSlug);
            })
            ->first();

        if ($existing) {
            if ($existing->trashed()) {
                $existing->restore();
            }
            return response()->json([
                'success' => true,
                'message' => 'Spesialisasi sudah terdaftar di sistem',
                'data' => $existing,
            ], 200);
        }

        // Pastikan slug unik jika slug dasar sudah dipakai oleh data lain
        $slug = $request->filled('slug') ? \Illuminate\Support\Str::slug($request->input('slug')) : $baseSlug;
        $counter = 1;
        while (Specialization::withTrashed()->where('slug', $slug)->exists()) {
            $slug = "{$baseSlug}-{$counter}";
            $counter++;
        }

        $specialization = Specialization::create([
            'name' => $name,
            'slug' => $slug,
            'description' => $request->input('description'),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Spesialisasi baru berhasil ditambahkan',
            'data' => $specialization,
        ], 201);
    }

    // PUT /api/admin/specializations/{id}
    public function update(Request $request, $id)
    {
        $specialization = Specialization::find($id);

        if (!$specialization) {
            return response()->json([
                'success' => false,
                'message' => 'Spesialisasi tidak ditemukan',
                'data' => null,
            ], 404);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => [
                'required',
                'string',
                'max:255',
                Rule::unique('specializations', 'slug')
                    ->ignore($specialization->id),
            ],
            'description' => ['nullable', 'string'],
        ]);

        $specialization->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Spesialisasi berhasil diperbarui',
            'data' => $specialization->fresh(),
        ]);
    }

    // DELETE /api/admin/specializations/{id}
    public function destroy($id)
    {
        $specialization = Specialization::find($id);

        if (!$specialization) {
            return response()->json([
                'success' => false,
                'message' => 'Spesialisasi tidak ditemukan',
                'data' => null,
            ], 404);
        }

        $specialization->delete();

        return response()->json([
            'success' => true,
            'message' => 'Spesialisasi berhasil dihapus',
            'data' => null,
        ]);
    }
}