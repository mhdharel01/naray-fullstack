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
        Schema::create('doctor_poliklinik', function (Blueprint $table) {
            $table->unsignedBigInteger('doctor_id');
            $table->unsignedBigInteger('poliklinik_id');
            $table->primary(['doctor_id', 'poliklinik_id']);
            $table->foreign('doctor_id')->references('id')->on('doctors')->onDelete('cascade');
            $table->foreign('poliklinik_id')->references('id')->on('polikliniks')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('doctor_poliklinik');
    }
};
?>
