<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vendors', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('business_name');
            $table->enum('service_type', ['hotel', 'food', 'rental_vehicle', 'tour_package']);
            $table->foreignId('district_id')->constrained()->cascadeOnDelete();
            $table->text('description')->nullable();
            $table->text('logo_url')->nullable();
            $table->enum('status', ['pending', 'active', 'suspended'])->default('pending');
            $table->decimal('trust_score', 4, 3)->default(0.850);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vendors');
    }
};
