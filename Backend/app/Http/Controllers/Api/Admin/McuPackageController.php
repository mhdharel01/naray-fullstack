<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\McuPackage;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class McuPackageController extends Controller
{
    public function index(Request $request)
    {
        $query = McuPackage::query();

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

        return response()->json(
            $query->latest()->paginate(15)
        );
    }

    public function show($id)
    {
        $package = McuPackage::findOrFail($id);

        return response()->json($package);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:mcu_packages,slug'],
            'description' => ['nullable', 'string'],
            'price' => ['required', 'numeric', 'min:0'],
            'image_url' => ['nullable', 'string', 'max:2048'],
            'status' => ['required', Rule::in(['active', 'inactive'])],
        ]);

        if (empty($validated['slug'])) {
            $validated['slug'] = \Illuminate\Support\Str::slug($validated['name']);
        }

        $package = McuPackage::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Paket MCU berhasil dibuat',
            'data' => $package
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $package = McuPackage::findOrFail($id);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => [
                'nullable',
                'string',
                'max:255',
                Rule::unique('mcu_packages', 'slug')
                    ->ignore($package->id),
            ],
            'description' => ['nullable', 'string'],
            'price' => ['required', 'numeric', 'min:0'],
            'image_url' => ['nullable', 'string', 'max:2048'],
            'status' => ['required', Rule::in(['active', 'inactive'])],
        ]);

        if (empty($validated['slug'])) {
            $validated['slug'] = $package->slug ?? \Illuminate\Support\Str::slug($validated['name']);
        }

        $package->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Paket MCU berhasil diperbarui',
            'data' => $package
        ]);
    }

    public function destroy($id)
    {
        $package = McuPackage::findOrFail($id);

        $package->delete();

        return response()->json([
            'success' => true,
            'message' => 'Paket MCU berhasil dihapus'
        ]);
    }
}