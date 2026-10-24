<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('doctor_leaves', function (Blueprint $table) {
            $table->unsignedBigInteger('doctor_schedule_id')->nullable()->after('doctor_id');

            $table->foreign('doctor_schedule_id')
                ->references('id')
                ->on('doctor_schedules')
                ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::table('doctor_leaves', function (Blueprint $table) {
            $table->dropForeign(['doctor_schedule_id']);
            $table->dropColumn('doctor_schedule_id');
        });
    }
};
