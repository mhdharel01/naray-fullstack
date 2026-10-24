<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('hospital_infos', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('address');
            $table->string('phone', 30);
            $table->string('email')->nullable();
            $table->string('emergency_hotline', 30);
            $table->string('operating_hours', 255);
            $table->string('logo_url')->nullable();
            $table->string('banner_image_url')->nullable();
            $table->text('description')->nullable();
            $table->timestamps();
            // No softDeletes, no branch_id
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('hospital_infos');
    }
};
?>
