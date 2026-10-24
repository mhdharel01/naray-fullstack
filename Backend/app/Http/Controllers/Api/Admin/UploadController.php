<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class UploadController extends Controller
{
    /**
     * Upload dan kompresi gambar secara aman (Anti SQL-Injection, Anti-RCE, Super Ringan WebP)
     */
    public function uploadImage(Request $request)
    {
        // 1. Validasi ketat hanya file gambar yang diizinkan (Tolak SVG, PHP, HTML, script, exe)
        $request->validate([
            'image' => [
                'required',
                'file',
                'image',
                'mimes:jpeg,jpg,png,webp,gif',
                'max:10240', // Maksimal 10MB sebelum kompresi
            ],
            'folder' => [
                'nullable',
                'string',
                'in:doctors,articles,rooms,facilities,centers,media,banners,banner,avatars,leadership,general',
            ],
        ], [
            'image.required' => 'File gambar wajib dipilih.',
            'image.image' => 'File yang diunggah harus berupa file gambar yang valid.',
            'image.mimes' => 'Hanya format gambar JPG, JPEG, PNG, WEBP, dan GIF yang diizinkan.',
            'image.max' => 'Ukuran gambar maksimal 10MB.',
        ]);

        $file = $request->file('image');
        $realPath = $file->getRealPath();

        // 2. Pemeriksaan integritas biner gambar (getimagesize)
        $imageInfo = @getimagesize($realPath);
        if ($imageInfo === false) {
            return response()->json([
                'success' => false,
                'message' => 'File yang diunggah rusak atau bukan format gambar asli yang valid.',
            ], 422);
        }

        $allowedTypes = [IMAGETYPE_JPEG, IMAGETYPE_PNG, IMAGETYPE_WEBP, IMAGETYPE_GIF];
        if (!in_array($imageInfo[2], $allowedTypes)) {
            return response()->json([
                'success' => false,
                'message' => 'Format internal gambar tidak diizinkan untuk alasan keamanan.',
            ], 422);
        }

        $allowedFolders = ['doctors', 'articles', 'rooms', 'facilities', 'centers', 'media', 'banners', 'avatars', 'leadership', 'general'];
        $folder = in_array($request->folder, $allowedFolders, true) ? $request->folder : 'general';
        if ($request->folder === 'banner') {
            $folder = 'banners';
        }

        // Buat nama file acak 40 karakter, tidak menggunakan nama asli dari user
        $safeFilename = Str::random(40) . '.webp';
        $relativeDir = 'uploads/' . $folder;
        $storageDir = storage_path('app/public/' . $relativeDir);
        $publicDir = public_path('storage/' . $relativeDir);

        if (!file_exists($storageDir)) {
            @mkdir($storageDir, 0755, true);
        }
        if (!file_exists($publicDir)) {
            @mkdir($publicDir, 0755, true);
        }

        $targetFullPath = $storageDir . '/' . $safeFilename;
        $publicFullPath = $publicDir . '/' . $safeFilename;

        // 4. Kompresi dan Optimasi Gambar menggunakan PHP GD -> WebP (Super Ringan & Menghapus Metadata Berbahaya)
        $origWidth = $imageInfo[0];
        $origHeight = $imageInfo[1];
        $imageType = $imageInfo[2];

        $sourceImage = null;
        try {
            switch ($imageType) {
                case IMAGETYPE_JPEG:
                    $sourceImage = @imagecreatefromjpeg($realPath);
                    // Atasi rotasi EXIF foto HP jika ada
                    if (function_exists('exif_read_data')) {
                        $exif = @exif_read_data($realPath);
                        if (!empty($exif['Orientation'])) {
                            switch ($exif['Orientation']) {
                                case 8:
                                    $sourceImage = imagerotate($sourceImage, 90, 0);
                                    break;
                                case 3:
                                    $sourceImage = imagerotate($sourceImage, 180, 0);
                                    break;
                                case 6:
                                    $sourceImage = imagerotate($sourceImage, -90, 0);
                                    break;
                            }
                            if ($sourceImage) {
                                $origWidth = imagesx($sourceImage);
                                $origHeight = imagesy($sourceImage);
                            }
                        }
                    }
                    break;
                case IMAGETYPE_PNG:
                    $sourceImage = @imagecreatefrompng($realPath);
                    break;
                case IMAGETYPE_WEBP:
                    $sourceImage = function_exists('imagecreatefromwebp') ? @imagecreatefromwebp($realPath) : null;
                    break;
                case IMAGETYPE_GIF:
                    $sourceImage = @imagecreatefromgif($realPath);
                    break;
            }
        } catch (\Throwable $e) {
            $sourceImage = null;
        }

        $finalWidth = $origWidth;
        $finalHeight = $origHeight;

        if ($sourceImage && function_exists('imagewebp')) {
            // Batasi dimensi maksimum (2048px untuk banner agar jernih di monitor besar, 1600px untuk lainnya)
            $maxDimension = ($folder === 'banners') ? 2048 : 1600;
            if ($origWidth > $maxDimension || $origHeight > $maxDimension) {
                if ($origWidth >= $origHeight) {
                    $finalWidth = $maxDimension;
                    $finalHeight = (int) round(($origHeight / $origWidth) * $maxDimension);
                } else {
                    $finalHeight = $maxDimension;
                    $finalWidth = (int) round(($origWidth / $origHeight) * $maxDimension);
                }
            }

            // Buat canvas baru
            $resizedImage = imagecreatetruecolor($finalWidth, $finalHeight);
            
            // Pertahankan transparansi jika PNG / WebP
            imagealphablending($resizedImage, false);
            imagesavealpha($resizedImage, true);
            $transparent = imagecolorallocatealpha($resizedImage, 255, 255, 255, 127);
            imagefilledrectangle($resizedImage, 0, 0, $finalWidth, $finalHeight, $transparent);
            imagealphablending($resizedImage, true);

            imagecopyresampled(
                $resizedImage,
                $sourceImage,
                0, 0, 0, 0,
                $finalWidth,
                $finalHeight,
                $origWidth,
                $origHeight
            );

            // Simpan sebagai WebP dengan kualitas tinggi (92% untuk banner agar jernih maksimal, 85% untuk lainnya)
            $quality = ($folder === 'banners') ? 92 : 85;
            imagewebp($resizedImage, $targetFullPath, $quality);

            // Bersihkan memori
            imagedestroy($sourceImage);
            imagedestroy($resizedImage);
        } else {
            // Fallback aman jika GD tidak dapat me-render: simpan file secara aman dengan ekstensi aslinya
            $ext = strtolower($file->getClientOriginalExtension());
            $safeExt = in_array($ext, ['jpg', 'jpeg', 'png', 'webp', 'gif'], true) ? $ext : 'jpg';
            $safeFilename = Str::random(40) . '.' . $safeExt;
            $file->storeAs($relativeDir, $safeFilename, 'public');
            $targetFullPath = storage_path('app/public/' . $relativeDir . '/' . $safeFilename);
        }

        if (file_exists($targetFullPath) && isset($publicFullPath)) {
            @copy($targetFullPath, $publicFullPath);
        }

        $fileSize = file_exists($targetFullPath) ? filesize($targetFullPath) : 0;
        $publicUrl = '/storage/' . $relativeDir . '/' . $safeFilename;

        $warning = null;
        if ($folder === 'banners' && $origWidth < 900) {
            $warning = "Perhatian: Resolusi foto ({$origWidth}x{$origHeight} px) tergolong kecil untuk banner layar lebar. Disarankan menggunakan foto minimal 1280x720 px atau 1920x1080 px agar tidak pecah/burik saat melebar di layar.";
        }

        return response()->json([
            'success' => true,
            'message' => 'Gambar berhasil diunggah, diamankan, dan dioptimasi.',
            'data' => [
                'url' => $publicUrl,
                'full_url' => url($publicUrl),
                'filename' => $safeFilename,
                'folder' => $folder,
                'size_bytes' => $fileSize,
                'size_formatted' => $fileSize >= 1048576 
                    ? round($fileSize / 1048576, 2) . ' MB' 
                    : round($fileSize / 1024, 1) . ' KB',
                'dimensions' => "{$finalWidth}x{$finalHeight}",
                'warning' => $warning,
            ],
        ], 201);
    }
}
