<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        if (!Schema::hasColumn('room_types', 'facilities')) {
            Schema::table('room_types', function (Blueprint $table) {
                $table->text('facilities')->nullable()->after('description');
            });
        }

        // Pastikan kolom price_per_night varchar
        try {
            DB::statement("ALTER TABLE room_types MODIFY price_per_night VARCHAR(255) NULL");
        } catch (\Throwable $e) {}

        // Migrasi dan bersihkan data deskripsi & fasilitas lama yang bercampur
        $rooms = DB::table('room_types')->get();
        foreach ($rooms as $room) {
            $rawDesc = $room->description ?: '';
            $lines = preg_split('/[\r\n]+/', $rawDesc);
            $cleanFeatures = [];
            $narrativeLines = [];

            foreach ($lines as $line) {
                $trimmed = trim($line);
                if (empty($trimmed)) continue;

                if (preg_match('/^[-*•]\s*(.*)$/u', $trimmed, $m)) {
                    $item = trim($m[1]);
                    // Jika item mengandung gabungan bullet ' • ', abaikan yang duplikat
                    if (str_contains($item, ' • ')) continue;
                    if (!empty($item) && !in_array(mb_strtolower($item), array_map('mb_strtolower', $cleanFeatures))) {
                        $cleanFeatures[] = $item;
                    }
                } elseif (str_contains($trimmed, ' • ')) {
                    // Pecah gabungan bullet lama jika belum ada item
                    $subItems = explode(' • ', $trimmed);
                    foreach ($subItems as $sub) {
                        $cleanSub = trim($sub);
                        if (!empty($cleanSub) && !in_array(mb_strtolower($cleanSub), array_map('mb_strtolower', $cleanFeatures))) {
                            $cleanFeatures[] = $cleanSub;
                        }
                    }
                } else {
                    $narrativeLines[] = $trimmed;
                }
            }

            $finalDesc = implode("\n", $narrativeLines);
            $finalFacilities = !empty($cleanFeatures) ? json_encode($cleanFeatures, JSON_UNESCAPED_UNICODE) : null;

            DB::table('room_types')
                ->where('id', $room->id)
                ->update([
                    'description' => $finalDesc,
                    'facilities' => $finalFacilities,
                ]);
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('room_types', 'facilities')) {
            Schema::table('room_types', function (Blueprint $table) {
                $table->dropColumn('facilities');
            });
        }
    }
};
