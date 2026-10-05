<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('place_images')) {
            Schema::table('place_images', function (Blueprint $table) {
                if (!Schema::hasColumn('place_images', 'file')) {
                    $table->string('file')->nullable()->after('place_id');
                }
                if (!Schema::hasColumn('place_images', 'source_url')) {
                    $table->string('source_url')->nullable()->after('file');
                }
                if (!Schema::hasColumn('place_images', 'license')) {
                    $table->string('license')->nullable()->default('CC BY-SA 4.0')->after('source_url');
                }
                if (!Schema::hasColumn('place_images', 'approved')) {
                    $table->boolean('approved')->default(true)->after('alt_text');
                }
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('place_images')) {
            Schema::table('place_images', function (Blueprint $table) {
                $table->dropColumn(['file', 'source_url', 'license', 'approved']);
            });
        }
    }
};
