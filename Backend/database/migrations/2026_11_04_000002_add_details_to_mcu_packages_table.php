<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('mcu_packages', function (Blueprint $table) {
            if (!Schema::hasColumn('mcu_packages', 'badge')) {
                $table->string('badge', 100)->nullable()->after('name');
            }
            if (!Schema::hasColumn('mcu_packages', 'duration')) {
                $table->string('duration', 100)->nullable()->after('price');
            }
            if (!Schema::hasColumn('mcu_packages', 'target')) {
                $table->string('target', 255)->nullable()->after('duration');
            }
            if (!Schema::hasColumn('mcu_packages', 'highlight')) {
                $table->text('highlight')->nullable()->after('target');
            }
            if (!Schema::hasColumn('mcu_packages', 'items')) {
                $table->json('items')->nullable()->after('highlight');
            }
        });
    }

    public function down(): void
    {
        Schema::table('mcu_packages', function (Blueprint $table) {
            $dropCols = [];
            foreach (['badge', 'duration', 'target', 'highlight', 'items'] as $col) {
                if (Schema::hasColumn('mcu_packages', $col)) {
                    $dropCols[] = $col;
                }
            }
            if (!empty($dropCols)) {
                $table->dropColumn($dropCols);
            }
        });
    }
};
