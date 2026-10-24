<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Article;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class ArticleController extends Controller
{
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
        // Menyesuaikan status menjadi huruf kecil
        if ($request->filled('status')) {
            $request->merge([
                'status' => strtolower($request->status),
            ]);
        }

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
                'exists:article_categories,id',
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

        if (empty($validated['slug'])) {
            $validated['slug'] = \Illuminate\Support\Str::slug($validated['title']) . '-' . time();
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

        // Upload gambar jika tersedia
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
            $request->merge([
                'status' => strtolower($request->status),
            ]);
        }

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
                'exists:article_categories,id',
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

        if (empty($validated['slug'])) {
            $validated['slug'] = $article->slug ?? (\Illuminate\Support\Str::slug($validated['title']) . '-' . time());
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

        // Ganti gambar jika ada file baru
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