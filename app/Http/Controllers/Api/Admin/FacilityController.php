<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Facility;
use Illuminate\Http\Request;

class FacilityController extends Controller
{
    /**
     * Resolusi fleksibel ID: mendukung numeric ID atau string ID ber-prefix (fac-1)
     */
    private function resolveFacility($id)
    {
        $cleanId = is_numeric($id) ? (int)$id : (int)preg_replace('/[^\d]/', '', (string)$id);
        if (!empty($cleanId)) {
            $found = Facility::find($cleanId);
            if ($found) return $found;
        }
        return Facility::find($id);
    }

    public function index(Request $request)
    {
        $query = Facility::with('branch');

        if ($request->filled('search')) {
            $search = $request->search;

            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('branch_id')) {
            $query->where('branch_id', $request->branch_id);
        }

        $facilities = $query
            ->orderBy('name')
            ->paginate($request->integer('per_page', 10));

        return response()->json([
            'success' => true,
            'message' => 'Data fasilitas berhasil diambil',
            'data' => $facilities,
        ]);
    }

    public function show($id)
    {
        $facility = $this->resolveFacility($id);

        if (!$facility) {
            return response()->json([
                'success' => false,
                'message' => 'Fasilitas tidak ditemukan',
                'data' => null,
            ], 404);
        }

        $facility->load(['branch', 'rooms']);

        return response()->json([
            'success' => true,
            'message' => 'Data fasilitas berhasil diambil',
            'data' => $facility,
        ]);
    }

    public function store(Request $request)
    {
        $rawType = $request->input('type', 'advanced');
        $type = in_array(strtolower((string)$rawType), ['basic', 'standar', 'penunjang'], true) ? 'basic' : 'advanced';
        $request->merge(['type' => $type]);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', 'in:basic,advanced'],
            'description' => ['nullable', 'string'],
            'image_url' => ['nullable', 'string', 'max:2048'],
            'status' => ['required', 'in:active,inactive'],
            'branch_id' => [
                'nullable',
                'integer',
                'exists:branches,id',
            ],
        ]);

        $facility = Facility::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Fasilitas berhasil ditambahkan',
            'data' => $facility->load('branch'),
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $facility = $this->resolveFacility($id);

        if (!$facility) {
            return response()->json([
                'success' => false,
                'message' => 'Fasilitas tidak ditemukan',
                'data' => null,
            ], 404);
        }

        $rawType = $request->input('type', $facility->type ?? 'advanced');
        $type = in_array(strtolower((string)$rawType), ['basic', 'standar', 'penunjang'], true) ? 'basic' : 'advanced';
        $request->merge(['type' => $type]);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', 'in:basic,advanced'],
            'description' => ['nullable', 'string'],
            'image_url' => ['nullable', 'string', 'max:2048'],
            'status' => ['required', 'in:active,inactive'],
            'branch_id' => [
                'nullable',
                'integer',
                'exists:branches,id',
            ],
        ]);

        $facility->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Fasilitas berhasil diperbarui',
            'data' => $facility->fresh()->load('branch'),
        ]);
    }

    public function destroy($id)
    {
        $facility = $this->resolveFacility($id);

        if (!$facility) {
            return response()->json([
                'success' => false,
                'message' => 'Fasilitas tidak ditemukan',
                'data' => null,
            ], 404);
        }

        $facility->delete();

        return response()->json([
            'success' => true,
            'message' => 'Fasilitas berhasil dihapus',
            'data' => null,
        ]);
    }
}
