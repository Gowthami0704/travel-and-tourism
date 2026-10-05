<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('places', function (Blueprint $table) {
            if (!Schema::hasColumn('places', 'short_description')) {
                $table->text('short_description')->nullable()->after('description');
            }
            if (!Schema::hasColumn('places', 'area')) {
                $table->string('area')->nullable()->after('short_description');
            }
            if (!Schema::hasColumn('places', 'best_time')) {
                $table->string('best_time')->nullable()->after('area');
            }
        });
    }

    public function down(): void
    {
        Schema::table('places', function (Blueprint $table) {
            $table->dropColumn(['short_description', 'area', 'best_time']);
        });
    }
};
