<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('routes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('from_district_id')->constrained('districts')->cascadeOnDelete();
            $table->foreignId('to_district_id')->constrained('districts')->cascadeOnDelete();
            $table->enum('mode', ['Train', 'Bus', 'Cab', 'Bike']);
            $table->integer('duration_mins');
            $table->integer('cost');
            $table->integer('distance_km');
            $table->string('operator')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('routes');
    }
};
