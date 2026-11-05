<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('appointments', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('patient_id');
            $table->unsignedBigInteger('doctor_id');
            $table->unsignedBigInteger('poliklinik_id');
            $table->unsignedBigInteger('branch_id');
            $table->unsignedBigInteger('doctor_schedule_id');
            $table->date('scheduled_date');
            $table->time('scheduled_time');
            $table->enum('status', ['pending', 'confirmed', 'rejected', 'cancelled', 'completed'])->default('pending');
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('patient_id')
                ->references('id')
                ->on('patients')
                ->onDelete('restrict');
                
            $table->foreign('doctor_id')
                ->references('id')
                ->on('doctors')
                ->onDelete('restrict');
                
            $table->foreign('poliklinik_id')
                ->references('id')
                ->on('polikliniks')
                ->onDelete('restrict');
                
            $table->foreign('branch_id')
                ->references('id')
                ->on('branches')
                ->onDelete('restrict');
                
            $table->foreign('doctor_schedule_id')
                ->references('id')
                ->on('doctor_schedules')
                ->onDelete('restrict');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('appointments');
    }
};
