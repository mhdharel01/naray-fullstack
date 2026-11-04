<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('media') && !Schema::hasColumn('media', 'thumbnail_url')) {
            Schema::table('media', function (Blueprint $table) {
                $table->string('thumbnail_url', 2048)->nullable()->after('url');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('media') && Schema::hasColumn('media', 'thumbnail_url')) {
            Schema::table('media', function (Blueprint $table) {
                $table->dropColumn('thumbnail_url');
            });
        }
    }
};
