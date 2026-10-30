<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('hospital_infos', function (Blueprint $table) {
            if (!Schema::hasColumn('hospital_infos', 'leadership_data')) {
                $table->json('leadership_data')->nullable()->after('description');
            }
            if (!Schema::hasColumn('hospital_infos', 'banner_slides')) {
                $table->json('banner_slides')->nullable()->after('leadership_data');
            }
        });
    }

    public function down(): void
    {
        Schema::table('hospital_infos', function (Blueprint $table) {
            $table->dropColumn(['leadership_data', 'banner_slides']);
        });
    }
};
