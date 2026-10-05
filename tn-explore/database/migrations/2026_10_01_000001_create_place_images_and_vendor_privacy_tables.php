<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Create Place Images Table with Approval Workflow
        if (!Schema::hasTable('place_images')) {
            Schema::create('place_images', function (Blueprint $table) {
                $table->id();
                $table->foreignId('place_id')->constrained('places')->cascadeOnDelete();
                $table->string('url');
                $table->string('source')->default('Tamil Nadu Tourism / Wikimedia Commons');
                $table->string('credit')->nullable();
                $table->string('alt_text')->nullable();
                $table->boolean('is_approved')->default(false);
                $table->timestamps();
            });
        }

        // 2. Enhance Vendor Privacy & Business Photos
        Schema::table('vendors', function (Blueprint $table) {
            if (!Schema::hasColumn('vendors', 'profile_photo_url')) {
                $table->string('profile_photo_url')->nullable()->after('logo_url');
            }
            if (!Schema::hasColumn('vendors', 'business_photos')) {
                $table->json('business_photos')->nullable()->after('profile_photo_url');
            }
            if (!Schema::hasColumn('vendors', 'aadhaar_document_path')) {
                $table->string('aadhaar_document_path')->nullable()->after('license_url');
            }
            if (!Schema::hasColumn('vendors', 'selfie_document_path')) {
                $table->string('selfie_document_path')->nullable()->after('aadhaar_document_path');
            }
            if (!Schema::hasColumn('vendors', 'area')) {
                $table->string('area')->nullable()->after('district_id');
            }
            if (!Schema::hasColumn('vendors', 'address')) {
                $table->text('address')->nullable()->after('area');
            }
            if (!Schema::hasColumn('vendors', 'aadhaar_masked')) {
                $table->string('aadhaar_masked')->nullable()->after('gst_number');
            }
            if (!Schema::hasColumn('vendors', 'pan_masked')) {
                $table->string('pan_masked')->nullable()->after('aadhaar_masked');
            }
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('place_images');
        Schema::table('vendors', function (Blueprint $table) {
            $table->dropColumn([
                'profile_photo_url',
                'business_photos',
                'aadhaar_document_path',
                'selfie_document_path',
                'area',
                'address',
                'aadhaar_masked',
                'pan_masked',
            ]);
        });
    }
};
