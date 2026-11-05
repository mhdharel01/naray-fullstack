<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Hindari tabrakan unique slug jika ID 1 sebelumnya bernama 'kesehatan-umum'
        DB::table('article_categories')
            ->where('slug', 'kesehatan-umum')
            ->where('id', '!=', 10)
            ->update(['slug' => 'temp-slug-kesehatan-umum-' . time()]);

        $categories = [
            1 => ['name' => 'Edukasi Kesehatan', 'slug' => 'edukasi-kesehatan'],
            2 => ['name' => 'Penyakit Dalam', 'slug' => 'penyakit-dalam'],
            3 => ['name' => 'Kesehatan Jantung', 'slug' => 'kesehatan-jantung'],
            4 => ['name' => 'Kesehatan Anak', 'slug' => 'kesehatan-anak'],
            5 => ['name' => 'Kesehatan Paru', 'slug' => 'kesehatan-paru'],
            6 => ['name' => 'Bedah & Ortopedi', 'slug' => 'bedah-ortopedi'],
            7 => ['name' => 'Kebidanan & Kandungan', 'slug' => 'kebidanan-kandungan'],
            8 => ['name' => 'Tips Gaya Hidup Sehat', 'slug' => 'tips-gaya-hidup-sehat'],
            9 => ['name' => 'Info Medis & Layanan RS', 'slug' => 'info-medis-layanan-rs'],
            10 => ['name' => 'Kesehatan Umum', 'slug' => 'kesehatan-umum'],
        ];

        foreach ($categories as $id => $cat) {
            $existing = DB::table('article_categories')->where('id', $id)->first();
            if ($existing) {
                DB::table('article_categories')->where('id', $id)->update([
                    'name' => $cat['name'],
                    'slug' => $cat['slug'],
                    'updated_at' => now(),
                ]);
            } else {
                DB::table('article_categories')->insert([
                    'id' => $id,
                    'name' => $cat['name'],
                    'slug' => $cat['slug'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        // 2. Hubungkan artikel bawaan ke kategori spesifiknya secara otomatis jika masih menggunakan kategori default
        try {
            DB::table('articles')->where('title', 'like', '%Diabetes%')->where('category_id', 1)->update(['category_id' => 2]);
            DB::table('articles')->where('title', 'like', '%Jantung%')->where('category_id', 1)->update(['category_id' => 3]);
            DB::table('articles')->where('title', 'like', '%Anak%')->where('category_id', 1)->update(['category_id' => 4]);
            DB::table('articles')->where('title', 'like', '%Pernapasan%')->where('category_id', 1)->update(['category_id' => 5]);
        } catch (\Throwable $e) {
            // Abaikan jika artikel sudah dikustomisasi
        }
    }

    public function down(): void
    {
        // Tetap pertahankan data kategori
    }
};
