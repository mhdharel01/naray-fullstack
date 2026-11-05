<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\ArticleCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class ArticleController extends Controller
{
    /**
     * Resolusi fleksibel ID kategori atau nama kategori artikel
     */
    private function resolveCategoryId(Request $request, $defaultId = 1)
    {
        if ($request->filled('category_id')) {
            $catId = (int)$request->category_id;
            if (ArticleCategory::where('id', $catId)->exists()) {
                return $catId;
            }
        }

        if ($request->filled('category')) {
            $catName = trim((string)$request->category);
            $foundCat = ArticleCategory::where('name', 'like', $catName)->first();
            if ($foundCat) {
                return $foundCat->id;
            }

            $created = ArticleCategory::create([
                'name' => $catName,
                'slug' => Str::slug($catName) ?: 'cat-' . time(),
            ]);
            return $created->id;
        }

        $fallback = ArticleCategory::where('id', $defaultId)->first() ?: ArticleCategory::first();
        return $fallback ? $fallback->id : 1;
    }

    public function index(Request $request)
    {
        $query = Article::with('category');

        if ($request->filled('search')) {
            $search = $request->search;

            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('slug', 'like', "%{$search}%")
                    ->orWhere('content', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where(
                'status',
                strtolower($request->status)
            );
        }

        if ($request->filled('category_id')) {
            $query->where(
                'category_id',
                $request->category_id
            );
        }

        return response()->json([
            'success' => true,
            'message' => 'Data artikel berhasil diambil',
            'data' => $query->latest()->paginate(15),
        ]);
    }

    public function store(Request $request)
    {
        // Normalisasi status
        if ($request->filled('status')) {
            $rawStatus = strtolower((string)$request->status);
            $cleanStatus = in_array($rawStatus, ['published', 'tayang', 'tayang (published)'], true) ? 'published' : 'draft';
            $request->merge(['status' => $cleanStatus]);
        }

        $resolvedCatId = $this->resolveCategoryId($request, 1);
        $request->merge(['category_id' => $resolvedCatId]);

        $validated = $request->validate([
            'title' => [
                'required',
                'string',
                'max:255',
            ],

            'slug' => [
                'nullable',
                'string',
                'max:200',
                'unique:articles,slug',
            ],

            'content' => [
                'required',
                'string',
            ],

            'thumbnail' => [
                'nullable',
            ],

            'thumbnail_url' => [
                'nullable',
                'string',
                'max:2048',
            ],

            'image_url' => [
                'nullable',
                'string',
                'max:2048',
            ],

            'category_id' => [
                'nullable',
                'integer',
            ],

            'status' => [
                'required',
                Rule::in(['draft', 'published']),
            ],

            'published_at' => [
                'nullable',
                'date',
            ],
        ]);

        $validated['category_id'] = $resolvedCatId;

        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['title']) . '-' . time();
        }

        if ($request->filled('thumbnail_url')) {
            $validated['thumbnail_url'] = $request->thumbnail_url;
        } elseif ($request->filled('image_url')) {
            $validated['thumbnail_url'] = $request->image_url;
        }
        unset($validated['image_url']);

        if (
            $validated['status'] === 'published' &&
            empty($validated['published_at'])
        ) {
            $validated['published_at'] = now();
        }

        // Upload gambar jika tersedia via form-data
        if ($request->hasFile('thumbnail')) {
            $path = $request->file('thumbnail')
                ->store('articles', 'public');

            $validated['thumbnail_url'] = $path;
        }

        unset($validated['thumbnail']);

        $article = Article::create($validated);
        $article->load('category');

        return response()->json([
            'success' => true,
            'message' => 'Artikel berhasil ditambahkan',
            'data' => $article,
        ], 201);
    }

    public function show($id)
    {
        $article = Article::with('category')
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'message' => 'Detail artikel berhasil diambil',
            'data' => $article,
        ]);
    }

    public function update(Request $request, $id)
    {
        $article = Article::findOrFail($id);

        if ($request->filled('status')) {
            $rawStatus = strtolower((string)$request->status);
            $cleanStatus = in_array($rawStatus, ['published', 'tayang', 'tayang (published)'], true) ? 'published' : 'draft';
            $request->merge(['status' => $cleanStatus]);
        }

        $resolvedCatId = $this->resolveCategoryId($request, $article->category_id ?? 1);
        $request->merge(['category_id' => $resolvedCatId]);

        $validated = $request->validate([
            'title' => [
                'required',
                'string',
                'max:255',
            ],

            'slug' => [
                'nullable',
                'string',
                'max:200',
                Rule::unique('articles', 'slug')
                    ->ignore($article->id),
            ],

            'content' => [
                'required',
                'string',
            ],

            'thumbnail' => [
                'nullable',
            ],

            'thumbnail_url' => [
                'nullable',
                'string',
                'max:2048',
            ],

            'image_url' => [
                'nullable',
                'string',
                'max:2048',
            ],

            'category_id' => [
                'nullable',
                'integer',
            ],

            'status' => [
                'required',
                Rule::in(['draft', 'published']),
            ],

            'published_at' => [
                'nullable',
                'date',
            ],
        ]);

        $validated['category_id'] = $resolvedCatId;

        if (empty($validated['slug'])) {
            $validated['slug'] = $article->slug ?? (Str::slug($validated['title']) . '-' . time());
        }

        if ($request->filled('thumbnail_url')) {
            $validated['thumbnail_url'] = $request->thumbnail_url;
        } elseif ($request->filled('image_url')) {
            $validated['thumbnail_url'] = $request->image_url;
        }
        unset($validated['image_url']);

        if (
            $validated['status'] === 'published' &&
            empty($validated['published_at'])
        ) {
            $validated['published_at'] =
                $article->published_at ?? now();
        }

        // Ganti gambar jika ada file baru via multipart
        if ($request->hasFile('thumbnail')) {
            if (
                $article->thumbnail_url &&
                Storage::disk('public')->exists(
                    $article->thumbnail_url
                )
            ) {
                Storage::disk('public')->delete(
                    $article->thumbnail_url
                );
            }

            $path = $request->file('thumbnail')
                ->store('articles', 'public');

            $validated['thumbnail_url'] = $path;
        }

        unset($validated['thumbnail']);

        $article->update($validated);
        $article->load('category');

        return response()->json([
            'success' => true,
            'message' => 'Artikel berhasil diperbarui',
            'data' => $article,
        ]);
    }

    public function destroy($id)
    {
        $article = Article::findOrFail($id);

        if (
            $article->thumbnail_url &&
            Storage::disk('public')->exists(
                $article->thumbnail_url
            )
        ) {
            Storage::disk('public')->delete(
                $article->thumbnail_url
            );
        }

        $article->delete();

        return response()->json([
            'success' => true,
            'message' => 'Artikel berhasil dihapus',
        ]);
    }
}
