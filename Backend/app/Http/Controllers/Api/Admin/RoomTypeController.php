<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\RoomType;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class RoomTypeController extends Controller
{
    public function index(Request $request)
    {
        $query = RoomType::with('branch');

        if ($request->filled('search')) {
            $search = $request->search;

            $query->where('name', 'like', "%{$search}%");
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
        if ($request->has('price') && !$request->has('price_per_night')) {
            $request->merge(['price_per_night' => $request->input('price')]);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'capacity' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'price_per_night' => ['nullable', 'string', 'max:255'],
            'image_url' => ['nullable', 'string', 'max:2048'],
            'status' => ['required', Rule::in(['active', 'inactive'])],
            'branch_id' => ['nullable', 'integer', 'exists:branches,id'],
        ]);

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
        $roomType = RoomType::findOrFail($id);

        if ($request->has('price') && !$request->has('price_per_night')) {
            $request->merge(['price_per_night' => $request->input('price')]);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'capacity' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'price_per_night' => ['nullable', 'string', 'max:255'],
            'image_url' => ['nullable', 'string', 'max:2048'],
            'status' => ['required', Rule::in(['active', 'inactive'])],
            'branch_id' => ['nullable', 'integer', 'exists:branches,id'],
        ]);

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
