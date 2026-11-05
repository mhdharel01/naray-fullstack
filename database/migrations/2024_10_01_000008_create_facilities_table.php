<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('facilities', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->enum('type', ['basic', 'advanced'])->default('basic');
            $table->text('description')->nullable();
            $table->string('image_url')->nullable();
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->unsignedBigInteger('branch_id')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('branch_id')
                ->references('id')
                ->on('branches')
                ->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('facilities');
    }
};
