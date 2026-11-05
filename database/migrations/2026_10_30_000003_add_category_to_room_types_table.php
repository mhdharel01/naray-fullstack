<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (!Schema::hasColumn('room_types', 'category')) {
            Schema::table('room_types', function (Blueprint $table) {
                $table->string('category', 50)->default('rawat_inap')->after('name');
            });
        }

        // Set category for existing rows based on name
        DB::table('room_types')
            ->where('name', 'LIKE', '%ICU%')
            ->orWhere('name', 'LIKE', '%intensif%')
            ->orWhere('name', 'LIKE', '%nicu%')
            ->orWhere('name', 'LIKE', '%picu%')
            ->orWhere('name', 'LIKE', '%hcu%')
            ->update(['category' => 'intensif']);

        DB::table('room_types')
            ->where('name', 'LIKE', '%isolasi%')
            ->update(['category' => 'isolasi']);

        DB::table('room_types')
            ->where('name', 'LIKE', '%igd%')
            ->orWhere('name', 'LIKE', '%emergensi%')
            ->orWhere('name', 'LIKE', '%emargensi%')
            ->orWhere('name', 'LIKE', '%gawat darurat%')
            ->orWhere('name', 'LIKE', '%resusitasi%')
            ->update(['category' => 'emargensi']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn('room_types', 'category')) {
            Schema::table('room_types', function (Blueprint $table) {
                $table->dropColumn('category');
            });
        }
    }
};
