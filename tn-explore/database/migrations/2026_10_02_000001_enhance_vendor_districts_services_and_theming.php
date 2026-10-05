<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Enhance Users table with theme preference
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'theme_preference')) {
                $table->string('theme_preference')->default('system')->after('phone');
            }
        });

        // 2. Enhance Vendors table with districts (max 2), approved_districts, services, documents & rejection reason
        Schema::table('vendors', function (Blueprint $table) {
            if (!Schema::hasColumn('vendors', 'district_ids')) {
                $table->json('district_ids')->nullable()->after('district_id');
            }
            if (!Schema::hasColumn('vendors', 'approved_district_ids')) {
                $table->json('approved_district_ids')->nullable()->after('district_ids');
            }
            if (!Schema::hasColumn('vendors', 'services')) {
                $table->json('services')->nullable()->after('service_type');
            }
            if (!Schema::hasColumn('vendors', 'tourism_license_path')) {
                $table->string('tourism_license_path')->nullable()->after('license_url');
            }
            if (!Schema::hasColumn('vendors', 'gstin_document_path')) {
                $table->string('gstin_document_path')->nullable()->after('aadhaar_document_path');
            }
            if (!Schema::hasColumn('vendors', 'kyc_rejected_reason')) {
                $table->text('kyc_rejected_reason')->nullable()->after('kyc_reviewed_at');
            }
        });

        // 3. Enhance Listings table for structured Package tours
        Schema::table('listings', function (Blueprint $table) {
            if (!Schema::hasColumn('listings', 'district_id')) {
                $table->foreignId('district_id')->nullable()->after('vendor_id')->constrained('districts')->nullOnDelete();
            }
            if (!Schema::hasColumn('listings', 'days')) {
                $table->integer('days')->nullable()->after('price');
            }
            if (!Schema::hasColumn('listings', 'itinerary')) {
                $table->json('itinerary')->nullable()->after('days');
            }
            if (!Schema::hasColumn('listings', 'inclusions')) {
                $table->json('inclusions')->nullable()->after('itinerary');
            }
            if (!Schema::hasColumn('listings', 'exclusions')) {
                $table->json('exclusions')->nullable()->after('inclusions');
            }
            if (!Schema::hasColumn('listings', 'group_size')) {
                $table->integer('group_size')->nullable()->after('exclusions');
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'theme_preference')) {
                $table->dropColumn('theme_preference');
            }
        });

        Schema::table('vendors', function (Blueprint $table) {
            $table->dropColumn([
                'district_ids',
                'approved_district_ids',
                'services',
                'tourism_license_path',
                'gstin_document_path',
                'kyc_rejected_reason',
            ]);
        });

        Schema::table('listings', function (Blueprint $table) {
            $table->dropForeign(['district_id']);
            $table->dropColumn([
                'district_id',
                'days',
                'itinerary',
                'inclusions',
                'exclusions',
                'group_size',
            ]);
        });
    }
};
