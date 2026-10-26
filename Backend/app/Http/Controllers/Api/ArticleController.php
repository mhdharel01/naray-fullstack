<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Article;
use Illuminate\Http\Request;

class ArticleController extends Controller
{
    public function index(Request $request)
    {
        $query = Article::with('category')
            ->whereIn('status', ['published', 'PUBLISHED']);

        if ($request->filled('search')) {
            $search = $request->search;

            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('content', 'like', "%{$search}%");
            });
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        $articles = $query->orderByDesc('published_at')->paginate(10);

        return response()->json([
            'success' => true,
            'message' => 'Artikel berhasil diambil',
            'data' => $articles
        ]);
    }

    public function show($id)
    {
        $article = Article::with('category')
            ->whereIn('status', ['published', 'PUBLISHED'])
            ->find($id);

    if (!$article) {
        return response()->json([
            'success' => false,
            'message' => 'Artikel tidak ditemukan',
            'data' => null
        ], 404);
    }

    return response()->json([
        'success' => true,
        'message' => 'Detail artikel berhasil diambil',
        'data' => $article
    ]);
}

}