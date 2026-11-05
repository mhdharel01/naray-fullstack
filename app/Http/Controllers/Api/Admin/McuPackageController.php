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

    protected function findPackage($id)
    {
        $package = null;
        if (is_numeric($id)) {
            $package = McuPackage::find($id);
        }
        if (!$package && is_string($id)) {
            $package = McuPackage::where('slug', $id)->first();
        }
        if (!$package) {
            $package = McuPackage::findOrFail($id);
        }
        return $package;
    }

    public function show($id)
    {
        $package = $this->findPackage($id);

        return response()->json($package);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:mcu_packages,slug'],
            'badge' => ['nullable', 'string', 'max:100'],
            'description' => ['nullable', 'string'],
            'highlight' => ['nullable', 'string'],
            'duration' => ['nullable', 'string', 'max:100'],
            'target' => ['nullable', 'string', 'max:255'],
            'items' => ['nullable'],
            'price' => ['required', 'numeric', 'min:0'],
            'image_url' => ['nullable', 'string', 'max:2048'],
            'status' => ['required', Rule::in(['active', 'inactive'])],
        ]);

        if (empty($validated['slug'])) {
            $validated['slug'] = \Illuminate\Support\Str::slug($validated['name']);
        }

        if (isset($validated['items']) && is_array($validated['items'])) {
            $validated['items'] = json_encode($validated['items'], JSON_UNESCAPED_UNICODE);
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
        $package = $this->findPackage($id);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => [
                'nullable',
                'string',
                'max:255',
                Rule::unique('mcu_packages', 'slug')
                    ->ignore($package->id),
            ],
            'badge' => ['nullable', 'string', 'max:100'],
            'description' => ['nullable', 'string'],
            'highlight' => ['nullable', 'string'],
            'duration' => ['nullable', 'string', 'max:100'],
            'target' => ['nullable', 'string', 'max:255'],
            'items' => ['nullable'],
            'price' => ['required', 'numeric', 'min:0'],
            'image_url' => ['nullable', 'string', 'max:2048'],
            'status' => ['required', Rule::in(['active', 'inactive'])],
        ]);

        if (empty($validated['slug'])) {
            $validated['slug'] = $package->slug ?? \Illuminate\Support\Str::slug($validated['name']);
        }

        if (isset($validated['items']) && is_array($validated['items'])) {
            $validated['items'] = json_encode($validated['items'], JSON_UNESCAPED_UNICODE);
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
        $package = $this->findPackage($id);

        $package->delete();

        return response()->json([
            'success' => true,
            'message' => 'Paket MCU berhasil dihapus'
        ]);
    }
}
