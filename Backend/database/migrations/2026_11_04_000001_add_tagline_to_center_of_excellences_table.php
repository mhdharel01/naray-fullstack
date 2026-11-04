<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (!Schema::hasColumn('center_of_excellences', 'tagline')) {
            Schema::table('center_of_excellences', function (Blueprint $table) {
                $table->string('tagline', 255)->nullable()->after('name');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn('center_of_excellences', 'tagline')) {
            Schema::table('center_of_excellences', function (Blueprint $table) {
                $table->dropColumn('tagline');
            });
        }
    }
};

