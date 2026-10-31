<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\RoomType;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Schema\Blueprint;

class RoomTypeController extends Controller
{
    /**
     * Self-healing: Pastikan struktur tabel room_types mendukung category & string price range
     */
    private function ensureSchemaUpdated(): void
    {
        try {
            if (!Schema::hasColumn('room_types', 'category')) {
                Schema::table('room_types', function (Blueprint $table) {
                    $table->string('category', 50)->default('rawat_inap')->after('name');
                });
            }
            if (!Schema::hasColumn('room_types', 'facilities')) {
                Schema::table('room_types', function (Blueprint $table) {
                    $table->text('facilities')->nullable()->after('description');
                });
            }
            // Pastikan kolom price_per_night berupa VARCHAR(255) agar bisa menampung rentang teks
            DB::statement("ALTER TABLE room_types MODIFY price_per_night VARCHAR(255) NULL");
            // Bersihkan desimal .00 dari migrasi lama jika ada
            DB::statement("UPDATE room_types SET price_per_night = REPLACE(price_per_night, '.00', '') WHERE price_per_night LIKE '%.00'");
        } catch (\Throwable $e) {
            // Aman diabaikan bila permission DB terbatas
        }
    }

    public function index(Request $request)
    {
        $this->ensureSchemaUpdated();
        $query = RoomType::with('branch');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where('name', 'like', "%{$search}%");
        }

        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('branch_id')) {
            $query->where('branch_id', $request->branch_id);
        }

        return response()->json(
            $query->latest()->paginate(15)
        );
    }

    public function show($id)
    {
        $roomType = RoomType::with('branch', 'rooms')
            ->findOrFail($id);

        return response()->json($roomType);
    }

    public function store(Request $request)
    {
        $this->ensureSchemaUpdated();
        if ($request->has('price') && !$request->filled('price_per_night')) {
            $request->merge(['price_per_night' => $request->input('price')]);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'category' => ['nullable', 'string', 'max:50'],
            'capacity' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'facilities' => ['nullable'],
            'price_per_night' => ['nullable', 'string', 'max:255'],
            'image_url' => ['nullable', 'string', 'max:2048'],
            'status' => ['required', Rule::in(['active', 'inactive'])],
            'branch_id' => ['nullable', 'integer', 'exists:branches,id'],
        ]);

        if (array_key_exists('facilities', $validated) && is_string($validated['facilities']) && !empty($validated['facilities'])) {
            $validated['facilities'] = array_values(array_filter(array_map('trim', explode("\n", $validated['facilities']))));
        }

        if (empty($validated['price_per_night']) || $validated['price_per_night'] === 'Hubungi Admisi' || $validated['price_per_night'] === '0') {
            $validated['price_per_night'] = null;
        }

        if (empty($validated['category'])) {
            $validated['category'] = 'rawat_inap';
        }

        $roomType = RoomType::create($validated);

        $roomType->load('branch');

        return response()->json([
            'success' => true,
            'message' => 'Tipe kamar berhasil ditambahkan',
            'data' => $roomType
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $this->ensureSchemaUpdated();
        $roomType = RoomType::findOrFail($id);

        if ($request->has('price') && !$request->filled('price_per_night')) {
            $request->merge(['price_per_night' => $request->input('price')]);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'category' => ['nullable', 'string', 'max:50'],
            'capacity' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'facilities' => ['nullable'],
            'price_per_night' => ['nullable', 'string', 'max:255'],
            'image_url' => ['nullable', 'string', 'max:2048'],
            'status' => ['required', Rule::in(['active', 'inactive'])],
            'branch_id' => ['nullable', 'integer', 'exists:branches,id'],
        ]);

        if (array_key_exists('facilities', $validated) && is_string($validated['facilities']) && !empty($validated['facilities'])) {
            $validated['facilities'] = array_values(array_filter(array_map('trim', explode("\n", $validated['facilities']))));
        }

        if (empty($validated['price_per_night']) || $validated['price_per_night'] === 'Hubungi Admisi' || $validated['price_per_night'] === '0') {
            $validated['price_per_night'] = null;
        }

        if (empty($validated['category'])) {
            $validated['category'] = $roomType->category ?: 'rawat_inap';
        }

        $roomType->update($validated);

        $roomType->load('branch');

        return response()->json([
            'success' => true,
            'message' => 'Tipe kamar berhasil diperbarui',
            'data' => $roomType
        ]);
    }

    public function destroy($id)
    {
        $roomType = RoomType::findOrFail($id);

        $roomType->delete();

        return response()->json([
            'success' => true,
            'message' => 'Tipe kamar berhasil dihapus'
        ]);
    }
}
