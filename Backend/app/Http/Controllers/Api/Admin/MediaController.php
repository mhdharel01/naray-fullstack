<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Media;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class MediaController extends Controller
{
    public function index(Request $request)
    {
        $query = Media::with([
            'category',
            'admin:id,name,email',
        ]);

        if ($request->filled('search')) {
            $search = $request->search;

            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('url', 'like', "%{$search}%");
            });
        }

        if ($request->filled('type')) {
            $query->where('type', strtolower($request->type));
        }

        if ($request->filled('status')) {
            $query->where('status', strtolower($request->status));
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        return response()->json([
            'success' => true,
            'message' => 'Data media berhasil diambil',
            'data' => $query
                ->latest()
                ->paginate(15),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'type' => [
                'required',
                Rule::in(['image', 'video']),
            ],

            'file' => [
                'nullable',
                'file',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:5120',
            ],

            'url' => [
                'nullable',
                'string',
                'max:2048',
                'required_without:file',
            ],

            'title' => [
                'nullable',
                'string',
                'max:255',
            ],

            'description' => [
                'nullable',
                'string',
            ],

            'category_id' => [
                'nullable',
                'integer',
                'exists:media_categories,id',
            ],

            'status' => [
                'required',
                Rule::in(['active', 'inactive']),
            ],
        ]);

        /*
        |--------------------------------------------------------------------------
        | Upload gambar
        |--------------------------------------------------------------------------
        */

        if ($request->hasFile('file')) {
            $path = $request->file('file')->store('media', 'public');

            $validated['url'] = Storage::url($path);
        }

        /*
        |--------------------------------------------------------------------------
        | Video menggunakan URL
        |--------------------------------------------------------------------------
        */

        unset($validated['file']);

        $validated['uploaded_by'] = Auth::id() ?? 1;

        $media = Media::create($validated);

        $media->load([
            'category',
            'admin:id,name,email',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Media berhasil ditambahkan',
            'data' => $media,
        ], 201);
    }

    public function show($id)
    {
        $media = Media::with([
            'category',
            'admin:id,name,email',
        ])->findOrFail($id);

        return response()->json([
            'success' => true,
            'message' => 'Detail media berhasil diambil',
            'data' => $media,
        ]);
    }

    public function update(Request $request, $id)
{
    $media = Media::findOrFail($id);

    $validated = $request->validate([
        'type' => [
            'sometimes',
            Rule::in(['image', 'video']),
        ],

        'file' => [
            'nullable',
            'file',
            'image',
            'mimes:jpg,jpeg,png,webp',
            'max:5120',
        ],

        'url' => [
            'nullable',
            'string',
            'max:2048',
        ],

        'title' => [
            'sometimes',
            'nullable',
            'string',
            'max:255',
        ],

        'description' => [
            'sometimes',
            'nullable',
            'string',
        ],

        'category_id' => [
            'sometimes',
            'nullable',
            'integer',
            'exists:media_categories,id',
        ],

        'status' => [
            'sometimes',
            Rule::in(['active', 'inactive']),
        ],
    ]);

    /*
    |--------------------------------------------------------------------------
    | Jika ada file gambar baru
    |--------------------------------------------------------------------------
    */
    if ($request->hasFile('file')) {

        // Hapus file lama jika merupakan file lokal Laravel
        if (
            $media->url &&
            str_starts_with($media->url, '/storage/')
        ) {
            $oldPath = str_replace('/storage/', '', $media->url);

            if (Storage::disk('public')->exists($oldPath)) {
                Storage::disk('public')->delete($oldPath);
            }
        }

        // Simpan file baru
        $path = $request->file('file')->store('media', 'public');

        // Simpan URL baru
        $validated['url'] = Storage::url($path);

        // Karena ini upload gambar
        $validated['type'] = 'image';
    }

    /*
    |--------------------------------------------------------------------------
    | Jika tidak upload file tetapi type diubah menjadi video
    |--------------------------------------------------------------------------
    */
    if (
        isset($validated['type']) &&
        $validated['type'] === 'video'
    ) {
        if (empty($validated['url'])) {
            return response()->json([
                'success' => false,
                'message' => 'URL video wajib diisi jika type adalah video.',
            ], 422);
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Jika type tidak dikirim, pertahankan type lama
    |--------------------------------------------------------------------------
    */

    $media->update($validated);

    $media->load([
        'category',
        'admin:id,name,email',
    ]);

    return response()->json([
        'success' => true,
        'message' => 'Media berhasil diperbarui',
        'data' => $media,
    ]);
}

    public function destroy($id)
    {
        $media = Media::findOrFail($id);

        /*
        |--------------------------------------------------------------------------
        | Hapus file dari storage jika media merupakan upload lokal
        |--------------------------------------------------------------------------
        */

        if ($media->url && str_starts_with($media->url, '/storage/')) {
            $path = str_replace('/storage/', '', $media->url);

            if (Storage::disk('public')->exists($path)) {
                Storage::disk('public')->delete($path);
            }
        }

        $media->delete();

        return response()->json([
            'success' => true,
            'message' => 'Media berhasil dihapus',
        ]);
    }
}