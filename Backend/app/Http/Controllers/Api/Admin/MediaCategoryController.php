<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\MediaCategory;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class MediaCategoryController extends Controller
{
    public function index(Request $request)
    {
        $query = MediaCategory::query()
            ->withCount('media');

        if ($request->filled('search')) {
            $search = $request->search;

            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('slug', 'like', "%{$search}%");
            });
        }

        return response()->json([
            'success' => true,
            'message' => 'Data kategori media berhasil diambil',
            'data' => $query
                ->orderBy('name')
                ->paginate(15),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => [
                'required',
                'string',
                'max:255',
                'unique:media_categories,slug',
            ],
            'description' => ['nullable', 'string'],
        ]);

        $category = MediaCategory::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Kategori media berhasil ditambahkan',
            'data' => $category,
        ], 201);
    }

    public function show($id)
    {
        $category = MediaCategory::with('media')
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'message' => 'Detail kategori media berhasil diambil',
            'data' => $category,
        ]);
    }

    public function update(Request $request, $id)
    {
        $category = MediaCategory::findOrFail($id);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => [
                'required',
                'string',
                'max:255',
                Rule::unique('media_categories', 'slug')
                    ->ignore($category->id),
            ],
            'description' => ['nullable', 'string'],
        ]);

        $category->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Kategori media berhasil diperbarui',
            'data' => $category->fresh(),
        ]);
    }

    public function destroy($id)
    {
        $category = MediaCategory::findOrFail($id);

        $category->delete();

        return response()->json([
            'success' => true,
            'message' => 'Kategori media berhasil dihapus',
        ]);
    }
}