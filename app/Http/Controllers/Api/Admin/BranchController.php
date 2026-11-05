<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class BranchController extends Controller
{
    public function index(Request $request)
    {
        $query = Branch::query()
            ->withCount([
                'doctors',
                'polikliniks',
                'services',
                'facilities',
                'centerOfExcellences',
                'roomTypes',
                'rooms',
            ]);

        if ($request->filled('search')) {
            $search = $request->search;

            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('address', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', strtolower($request->status));
        }

        return response()->json([
            'success' => true,
            'message' => 'Data cabang berhasil diambil',
            'data' => $query->orderBy('name')->paginate(15),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'address' => ['required', 'string'],
            'phone' => ['required', 'string', 'max:50'],
            'email' => ['nullable', 'email', 'max:255'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'status' => ['required', Rule::in(['active', 'inactive'])],
        ]);

        $branch = Branch::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Cabang berhasil ditambahkan',
            'data' => $branch,
        ], 201);
    }

    public function show($id)
    {
        $branch = Branch::with([
            'doctors',
            'polikliniks',
            'services',
            'facilities',
            'centerOfExcellences',
            'roomTypes',
            'rooms',
        ])->findOrFail($id);

        return response()->json([
            'success' => true,
            'message' => 'Detail cabang berhasil diambil',
            'data' => $branch,
        ]);
    }

    public function update(Request $request, $id)
    {
        $branch = Branch::findOrFail($id);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'address' => ['required', 'string'],
            'phone' => ['required', 'string', 'max:50'],
            'email' => ['nullable', 'email', 'max:255'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'status' => ['required', Rule::in(['active', 'inactive'])],
        ]);

        $branch->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Cabang berhasil diperbarui',
            'data' => $branch->fresh(),
        ]);
    }

    public function destroy($id)
    {
        $branch = Branch::findOrFail($id);

        $branch->delete();

        return response()->json([
            'success' => true,
            'message' => 'Cabang berhasil dihapus',
        ]);
    }
}