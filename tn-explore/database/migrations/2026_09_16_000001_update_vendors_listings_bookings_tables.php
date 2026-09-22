<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('vendors', function (Blueprint $table) {
            if (!Schema::hasColumn('vendors', 'owner_name')) {
                $table->string('owner_name')->nullable()->after('business_name');
            }
            if (!Schema::hasColumn('vendors', 'slug')) {
                $table->string('slug')->nullable()->unique()->after('owner_name');
            }
            if (!Schema::hasColumn('vendors', 'specialties')) {
                $table->json('specialties')->nullable()->after('service_type');
            }
            if (!Schema::hasColumn('vendors', 'kyc_status')) {
                $table->string('kyc_status')->default('incomplete')->after('status');
            }
            if (!Schema::hasColumn('vendors', 'license_url')) {
                $table->text('license_url')->nullable()->after('logo_url');
            }
            if (!Schema::hasColumn('vendors', 'gst_number')) {
                $table->string('gst_number')->nullable()->after('license_url');
            }
            if (!Schema::hasColumn('vendors', 'phone')) {
                $table->string('phone')->nullable()->after('gst_number');
            }
        });

        Schema::table('listings', function (Blueprint $table) {
            if (!Schema::hasColumn('listings', 'images')) {
                $table->json('images')->nullable()->after('image_url');
            }
            if (!Schema::hasColumn('listings', 'status')) {
                $table->string('status')->default('published')->after('is_active');
            }
        });

        Schema::table('bookings', function (Blueprint $table) {
            if (!Schema::hasColumn('bookings', 'travelers')) {
                $table->integer('travelers')->default(1)->after('total_amount');
            }
            if (!Schema::hasColumn('bookings', 'special_requests')) {
                $table->text('special_requests')->nullable()->after('travelers');
            }
            if (!Schema::hasColumn('bookings', 'customer_name')) {
                $table->string('customer_name')->nullable()->after('tourist_id');
            }
            if (!Schema::hasColumn('bookings', 'customer_phone')) {
                $table->string('customer_phone')->nullable()->after('customer_name');
            }
            if (!Schema::hasColumn('bookings', 'customer_email')) {
                $table->string('customer_email')->nullable()->after('customer_phone');
            }
        });
    }

    public function down(): void
    {
        // Safe down for SQLite
    }
};
