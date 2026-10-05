<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Add KYC correction & resubmission tracking columns to vendors table
        Schema::table('vendors', function (Blueprint $table) {
            if (!Schema::hasColumn('vendors', 'correction_deadline')) {
                $table->timestamp('correction_deadline')->nullable()->after('kyc_reviewed_at');
            }
            if (!Schema::hasColumn('vendors', 'correction_attempts')) {
                $table->integer('correction_attempts')->default(0)->after('correction_deadline');
            }
            if (!Schema::hasColumn('vendors', 'correction_flagged_fields')) {
                $table->json('correction_flagged_fields')->nullable()->after('correction_attempts');
            }
            if (!Schema::hasColumn('vendors', 'last_resubmitted_at')) {
                $table->timestamp('last_resubmitted_at')->nullable()->after('correction_flagged_fields');
            }
            if (!Schema::hasColumn('vendors', 'resubmission_diff')) {
                $table->json('resubmission_diff')->nullable()->after('last_resubmitted_at');
            }
            if (!Schema::hasColumn('vendors', 'phone_verified_at')) {
                $table->timestamp('phone_verified_at')->nullable()->after('phone');
            }
        });

        // 2. Create verification_messages table for audit trail & vendor-admin messaging
        Schema::create('verification_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vendor_id')->constrained('vendors')->onDelete('cascade');
            $table->foreignId('sender_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('sender_role')->default('admin'); // admin, vendor, system
            $table->string('type')->default('request_changes'); // request_changes, resubmission, approval, rejection, system_alert
            $table->json('checklist_items')->nullable();
            $table->text('note')->nullable();
            $table->timestamp('deadline_at')->nullable();
            $table->json('diff')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('verification_messages');

        Schema::table('vendors', function (Blueprint $table) {
            $table->dropColumn([
                'correction_deadline',
                'correction_attempts',
                'correction_flagged_fields',
                'last_resubmitted_at',
                'resubmission_diff',
                'phone_verified_at',
            ]);
        });
    }
};
