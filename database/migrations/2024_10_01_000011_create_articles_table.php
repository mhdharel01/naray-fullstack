<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('articles', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug', 200)->unique();
            $table->text('content');
            $table->string('thumbnail_url')->nullable();
            $table->unsignedBigInteger('category_id')->nullable();
            $table->enum('status', ['draft', 'published'])->default('draft');
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('category_id')
                ->references('id')
                ->on('article_categories')
                ->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('articles');
    }
};
