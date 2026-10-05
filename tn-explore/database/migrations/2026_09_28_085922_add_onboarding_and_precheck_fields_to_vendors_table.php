<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('vendors', function (Blueprint $table) {
            if (!Schema::hasColumn('vendors', 'business_type')) {
                $table->string('business_type')->default('individual')->after('service_type');
            }
            if (!Schema::hasColumn('vendors', 'operating_years')) {
                $table->integer('operating_years')->default(1)->after('business_type');
            }
            if (!Schema::hasColumn('vendors', 'online_presence_url')) {
                $table->string('online_presence_url')->nullable()->after('operating_years');
            }
            if (!Schema::hasColumn('vendors', 'service_details')) {
                $table->json('service_details')->nullable()->after('online_presence_url');
            }
            if (!Schema::hasColumn('vendors', 'pricing_declaration')) {
                $table->json('pricing_declaration')->nullable()->after('service_details');
            }
            if (!Schema::hasColumn('vendors', 'policies')) {
                $table->json('policies')->nullable()->after('pricing_declaration');
            }
            if (!Schema::hasColumn('vendors', 'references')) {
                $table->json('references')->nullable()->after('policies');
            }
            if (!Schema::hasColumn('vendors', 'declarations_accepted')) {
                $table->boolean('declarations_accepted')->default(false)->after('references');
            }
            if (!Schema::hasColumn('vendors', 'precheck_flags')) {
                $table->json('precheck_flags')->nullable()->after('trust_score');
            }
            if (!Schema::hasColumn('vendors', 'kyc_reviewed_at')) {
                $table->timestamp('kyc_reviewed_at')->nullable()->after('precheck_flags');
            }
            if (!Schema::hasColumn('vendors', 'admin_notes')) {
                $table->text('admin_notes')->nullable()->after('kyc_reviewed_at');
            }
        });
    }

    public function down(): void
    {
        Schema::table('vendors', function (Blueprint $table) {
            $table->dropColumn([
                'business_type',
                'operating_years',
                'online_presence_url',
                'service_details',
                'pricing_declaration',
                'policies',
                'references',
                'declarations_accepted',
                'precheck_flags',
                'kyc_reviewed_at',
                'admin_notes',
            ]);
        });
    }
};
