<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Media;
use App\Models\MediaCategory;
use Illuminate\Http\Request;

class MediaController extends Controller
{
    public function index(Request $request)
    {
        $query = Media::with([
            'category'
        ])
        ->where('status', 'active');

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        if ($request->filled('category_id')) {
            $query->where(
                'category_id',
                $request->category_id
            );
        }

        $media = $query
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return response()->json([
            'success' => true,
            'message' => 'Media berhasil diambil',
            'data' => $media
        ]);
    }


    public function categories()
    {
        $categories = MediaCategory::orderBy('name')->get();

        return response()->json([
            'success' => true,
            'message' => 'Kategori media berhasil diambil',
            'data' => $categories
        ]);
    }
}