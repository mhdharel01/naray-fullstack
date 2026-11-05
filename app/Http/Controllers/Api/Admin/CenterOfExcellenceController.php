<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\CenterOfExcellence;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;

class CenterOfExcellenceController extends Controller
{
    /**
     * Self-healing: Pastikan kolom tagline selalu ada di tabel database
     */
    private function ensureSchemaUpdated(): void
    {
        try {
            if (!Schema::hasColumn('center_of_excellences', 'tagline')) {
                Schema::table('center_of_excellences', function (Blueprint $table) {
                    $table->string('tagline', 255)->nullable()->after('name');
                });
            }
        } catch (\Throwable $e) {
            // Abaikan bila hak akses DB terbatas
        }
    }

    /**
     * Resolusi fleksibel ID: mendukung numeric ID, string ID ber-prefix (center-1), dan slug
     */
    private function resolveCenter($id)
    {
        $cleanId = is_numeric($id) ? (int)$id : (int)preg_replace('/[^\d]/', '', (string)$id);
        $center = null;

        if (!empty($cleanId)) {
            $center = CenterOfExcellence::find($cleanId);
        }

        if (!$center && is_string($id)) {
            $center = CenterOfExcellence::where('slug', $id)->first();
        }

        return $center;
    }

    public function index(Request $request)
    {
        $this->ensureSchemaUpdated();
        $query = CenterOfExcellence::with('branch');

        if ($request->filled('search')) {
            $search = $request->search;

            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('slug', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('branch_id')) {
            $query->where('branch_id', $request->branch_id);
        }

        $perPage = $request->integer('per_page', 50);

        return response()->json([
            'success' => true,
            'message' => 'Data Center of Excellence berhasil diambil',
            'data' => $query->latest()->paginate($perPage)
        ]);
    }

    public function show($id)
    {
        $this->ensureSchemaUpdated();
        $center = $this->resolveCenter($id);

        if (!$center) {
            return response()->json([
                'success' => false,
                'message' => 'Center of Excellence tidak ditemukan',
                'data' => null
            ], 404);
        }

        $center->load('branch');

        return response()->json([
            'success' => true,
            'message' => 'Detail Center of Excellence berhasil diambil',
            'data' => $center
        ]);
    }

    public function store(Request $request)
    {
        $this->ensureSchemaUpdated();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'tagline' => ['nullable', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'unique:center_of_excellences,slug'],
            'description' => ['nullable', 'string'],
            'image_url' => ['nullable', 'string', 'max:2048'],
            'status' => ['required', Rule::in(['active', 'inactive'])],
            'branch_id' => ['nullable', 'integer', 'exists:branches,id'],
        ]);

        $center = CenterOfExcellence::create($validated);
        $center->load('branch');

        return response()->json([
            'success' => true,
            'message' => 'Center of Excellence berhasil ditambahkan',
            'data' => $center
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $this->ensureSchemaUpdated();

        $center = $this->resolveCenter($id);

        if (!$center) {
            return response()->json([
                'success' => false,
                'message' => 'Center of Excellence tidak ditemukan',
                'data' => null
            ], 404);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'tagline' => ['nullable', 'string', 'max:255'],
            'slug' => [
                'required',
                'string',
                'max:255',
                Rule::unique('center_of_excellences', 'slug')
                    ->ignore($center->id),
            ],
            'description' => ['nullable', 'string'],
            'image_url' => ['nullable', 'string', 'max:2048'],
            'status' => ['required', Rule::in(['active', 'inactive'])],
            'branch_id' => ['nullable', 'integer', 'exists:branches,id'],
        ]);

        $center->update($validated);
        $center->load('branch');

        return response()->json([
            'success' => true,
            'message' => 'Center of Excellence berhasil diperbarui',
            'data' => $center->fresh()->load('branch')
        ]);
    }

    public function destroy($id)
    {
        $center = $this->resolveCenter($id);

        if (!$center) {
            return response()->json([
                'success' => false,
                'message' => 'Center of Excellence tidak ditemukan',
                'data' => null
            ], 404);
        }

        $center->delete();

        return response()->json([
            'success' => true,
            'message' => 'Center of Excellence deleted successfully.',
            'data' => null
        ]);
    }
}
