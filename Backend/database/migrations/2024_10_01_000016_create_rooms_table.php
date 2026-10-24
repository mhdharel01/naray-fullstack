<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('rooms', function (Blueprint $table) {
            $table->id();
            $table->string('room_number');
            $table->unsignedBigInteger('room_type_id');
            $table->unsignedBigInteger('branch_id');
            $table->string('floor')->nullable();
            $table->enum('status', ['available', 'occupied', 'maintenance'])->default('available');
            $table->string('image_url')->nullable();
            $table->timestamps();
            $table->softDeletes();
            
            $table->unique(['branch_id', 'room_number']);

            $table->foreign('room_type_id')
                ->references('id')
                ->on('room_types')
                ->onDelete('restrict');
                
            $table->foreign('branch_id')
                ->references('id')
                ->on('branches')
                ->onDelete('restrict');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rooms');
    }
};
