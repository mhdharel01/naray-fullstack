<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Media;
use App\Models\MediaCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class MediaController extends Controller
{
    /**
     * Cari Media berdasarkan ID numerik atau ID dengan awalan (misal: gal-1, vid-1, media-1)
     */
    protected function findMedia($id)
    {
        if (is_string($id) && preg_match('/^(?:gal|vid|media)-(\d+)$/', $id, $m)) {
            $id = (int)$m[1];
        }
        return Media::findOrFail($id);
    }

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

            'category' => [
                'nullable',
                'string',
                'max:150',
            ],

            'thumbnail_url' => [
                'nullable',
                'string',
                'max:2048',
            ],

            'status' => [
                'required',
                Rule::in(['active', 'inactive']),
            ],
        ], [
            'type.required' => 'Tipe media (foto atau video) wajib dipilih.',
            'type.in' => 'Tipe media harus berupa foto (image) atau video.',
            'url.required_without' => 'Foto atau link video wajib diisi/diunggah.',
            'url.max' => 'URL maksimal 2048 karakter.',
            'status.required' => 'Status tampil wajib dipilih.',
        ]);

        // Upload file jika ada
        if ($request->hasFile('file')) {
            $path = $request->file('file')->store('media', 'public');
            $validated['url'] = Storage::url($path);
        }
        unset($validated['file']);

        // Auto-resolve atau buat kategori baru jika user mengetikkan nama kategori
        if ($request->filled('category') && is_string($request->category)) {
            $catName = trim($request->category);
            if (!empty($catName)) {
                $category = MediaCategory::firstOrCreate(
                    ['name' => $catName],
                    ['slug' => Str::slug($catName)]
                );
                $validated['category_id'] = $category->id;
            }
        }
        unset($validated['category']);

        // Fallback default category_id jika kosong
        if (empty($validated['category_id'])) {
            $firstCat = MediaCategory::first();
            $validated['category_id'] = $firstCat ? $firstCat->id : 1;
        }

        // Fallback judul jika belum diisi
        if (empty($validated['title'])) {
            $validated['title'] = ($validated['type'] === 'video') ? 'Video Dokumentasi' : 'Foto Kegiatan';
        }

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
        $media = $this->findMedia($id);
        $media->load([
            'category',
            'admin:id,name,email',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Detail media berhasil diambil',
            'data' => $media,
        ]);
    }

    public function update(Request $request, $id)
    {
        $media = $this->findMedia($id);

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

            'category' => [
                'sometimes',
                'nullable',
                'string',
                'max:150',
            ],

            'thumbnail_url' => [
                'nullable',
                'string',
                'max:2048',
            ],

            'status' => [
                'sometimes',
                Rule::in(['active', 'inactive']),
            ],
        ], [
            'type.in' => 'Tipe media harus berupa foto (image) atau video.',
            'url.max' => 'URL maksimal 2048 karakter.',
        ]);

        // Jika upload file gambar baru
        if ($request->hasFile('file')) {
            if ($media->url && (str_starts_with($media->url, '/storage/') || str_starts_with($media->url, 'storage/'))) {
                $oldPath = preg_replace('#^/?storage/#', '', $media->url);
                if (Storage::disk('public')->exists($oldPath)) {
                    Storage::disk('public')->delete($oldPath);
                }
            }

            $path = $request->file('file')->store('media', 'public');
            $validated['url'] = Storage::url($path);
            $validated['type'] = 'image';
        }
        unset($validated['file']);

        // Auto-resolve atau buat kategori jika user mengetik nama kategori
        if ($request->filled('category') && is_string($request->category)) {
            $catName = trim($request->category);
            if (!empty($catName)) {
                $category = MediaCategory::firstOrCreate(
                    ['name' => $catName],
                    ['slug' => Str::slug($catName)]
                );
                $validated['category_id'] = $category->id;
            }
        }
        unset($validated['category']);

        // Validasi tipe video
        if (isset($validated['type']) && $validated['type'] === 'video') {
            if (empty($validated['url']) && empty($media->url)) {
                return response()->json([
                    'success' => false,
                    'message' => 'URL video wajib diisi jika tipe adalah video.',
                ], 422);
            }
        }

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
        $media = $this->findMedia($id);

        if ($media->url && (str_starts_with($media->url, '/storage/') || str_starts_with($media->url, 'storage/'))) {
            $path = preg_replace('#^/?storage/#', '', $media->url);
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
