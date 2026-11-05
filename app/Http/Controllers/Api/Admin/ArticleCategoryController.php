<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ArticleCategory;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ArticleCategoryController extends Controller
{
    public function index(Request $request)
    {
        $query = ArticleCategory::query()
            ->withCount('articles');

        if ($request->filled('search')) {
            $search = $request->search;

            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('slug', 'like', "%{$search}%");
            });
        }

        return response()->json([
            'success' => true,
            'message' => 'Data kategori artikel berhasil diambil',
            'data' => $query->orderBy('name')->paginate(15),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'unique:article_categories,slug'],
        ]);

        $category = ArticleCategory::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Kategori artikel berhasil ditambahkan',
            'data' => $category,
        ], 201);
    }

    public function show($id)
    {
        $category = ArticleCategory::with('articles')->findOrFail($id);

        return response()->json([
            'success' => true,
            'message' => 'Detail kategori artikel berhasil diambil',
            'data' => $category,
        ]);
    }

    public function update(Request $request, $id)
    {
        $category = ArticleCategory::findOrFail($id);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => [
                'required',
                'string',
                'max:255',
                Rule::unique('article_categories', 'slug')->ignore($category->id),
            ],
        ]);

        $category->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Kategori artikel berhasil diperbarui',
            'data' => $category->fresh(),
        ]);
    }

    public function destroy($id)
    {
        $category = ArticleCategory::findOrFail($id);
        $category->delete();

        return response()->json([
            'success' => true,
            'message' => 'Kategori artikel berhasil dihapus',
        ]);
    }
}