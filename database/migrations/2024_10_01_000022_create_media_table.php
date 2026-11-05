<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('media', function (Blueprint $table) {
            $table->id();
            $table->enum('type', ['image', 'video'])->index();
            $table->string('url');
            $table->string('title')->nullable();
            $table->text('description')->nullable();
            $table->unsignedBigInteger('category_id')->nullable()->index();
            $table->unsignedBigInteger('uploaded_by')->index();
            $table->enum('status', ['active', 'inactive'])->default('active')->index();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('category_id')
                ->references('id')
                ->on('media_categories')
                ->onDelete('set null');

            $table->foreign('uploaded_by')
                ->references('id')
                ->on('admins')
                ->onDelete('restrict');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('media');
    }
};
