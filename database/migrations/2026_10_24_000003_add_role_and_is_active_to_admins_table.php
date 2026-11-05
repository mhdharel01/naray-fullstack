<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('admins', function (Blueprint $table) {
            if (!Schema::hasColumn('admins', 'role')) {
                // Roles: 'super_admin', 'admin' (operasional), 'marketing' (mcu & konten)
                $table->string('role', 30)->default('admin')->after('email');
            }
            if (!Schema::hasColumn('admins', 'is_active')) {
                $table->boolean('is_active')->default(true)->after('password');
            }
            if (!Schema::hasColumn('admins', 'last_login_at')) {
                $table->timestamp('last_login_at')->nullable()->after('is_active');
            }
        });

        // Pastikan admin utama eksisting menjadi super_admin aktif
        DB::table('admins')
            ->where('id', 1)
            ->orWhere('email', 'admin@narayhospital.com')
            ->update([
                'role' => 'super_admin',
                'is_active' => true,
            ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('admins', function (Blueprint $table) {
            if (Schema::hasColumn('admins', 'last_login_at')) {
                $table->dropColumn('last_login_at');
            }
            if (Schema::hasColumn('admins', 'is_active')) {
                $table->dropColumn('is_active');
            }
            if (Schema::hasColumn('admins', 'role')) {
                $table->dropColumn('role');
            }
        });
    }
};
