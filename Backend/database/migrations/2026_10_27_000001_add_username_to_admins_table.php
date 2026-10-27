<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('admins', function (Blueprint $table) {
            if (!Schema::hasColumn('admins', 'username')) {
                $table->string('username', 50)->nullable()->unique()->after('name');
            }
        });

        // Backfill username untuk admin yang sudah ada
        $admins = DB::table('admins')->whereNull('username')->orWhere('username', '')->get();

        foreach ($admins as $adm) {
            $username = null;

            if ($adm->email === 'admin@narayhospital.com' || $adm->id === 1) {
                $username = 'admin';
            } elseif ($adm->email === 'operasional@narayhospital.com' || $adm->id === 2) {
                $username = 'operasional';
            } elseif ($adm->email === 'marketing@narayhospital.com' || $adm->id === 3) {
                $username = 'marketing';
            } elseif ($adm->email === 'harel@narayhospital.com' || str_contains(strtolower($adm->name), 'harel')) {
                $username = 'harel';
            } else {
                // Generate dari email prefix atau slug nama
                $base = !empty($adm->email) ? explode('@', $adm->email)[0] : Str::slug($adm->name, '_');
                $base = strtolower(preg_replace('/[^a-zA-Z0-9._-]/', '', $base));
                if (empty($base)) {
                    $base = 'admin' . $adm->id;
                }

                $candidate = $base;
                $counter = 1;
                while (DB::table('admins')->where('username', $candidate)->where('id', '!=', $adm->id)->exists()) {
                    $candidate = $base . $counter;
                    $counter++;
                }
                $username = $candidate;
            }

            // Pastikan unik sebelum update
            if ($username) {
                $candidate = $username;
                $counter = 1;
                while (DB::table('admins')->where('username', $candidate)->where('id', '!=', $adm->id)->exists()) {
                    $candidate = $username . $counter;
                    $counter++;
                }

                DB::table('admins')->where('id', $adm->id)->update([
                    'username' => $candidate,
                ]);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('admins', function (Blueprint $table) {
            if (Schema::hasColumn('admins', 'username')) {
                $table->dropColumn('username');
            }
        });
    }
};
