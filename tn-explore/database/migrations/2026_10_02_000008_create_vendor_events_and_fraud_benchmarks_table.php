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
        // 1. Create vendor_events table for tracking behavioral events
        Schema::create('vendor_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vendor_id')->constrained('vendors')->onDelete('cascade');
            $table->string('type'); // login, price_edit, listing_edit, bid, bid_withdraw, cancellation, review_received, contact_pattern_flag
            $table->json('payload')->nullable(); // Strictly flags/metadata, NEVER raw chat message content
            $table->string('device_hash')->nullable();
            $table->string('ip_address')->nullable();
            $table->timestamps();

            $table->index(['vendor_id', 'type', 'created_at']);
        });

        // 2. Add Isolation Forest & Anomaly scan fields to vendors table
        Schema::table('vendors', function (Blueprint $table) {
            if (!Schema::hasColumn('vendors', 'isolation_forest_score')) {
                $table->float('isolation_forest_score')->nullable()->after('trust_score');
            }
            if (!Schema::hasColumn('vendors', 'hard_rule_score')) {
                $table->float('hard_rule_score')->nullable()->after('isolation_forest_score');
            }
            if (!Schema::hasColumn('vendors', 'risk_tier')) {
                $table->string('risk_tier')->default('safe')->after('hard_rule_score'); // high, medium, safe, insufficient_data
            }
            if (!Schema::hasColumn('vendors', 'top_risk_reasons')) {
                $table->json('top_risk_reasons')->nullable()->after('risk_tier');
            }
            if (!Schema::hasColumn('vendors', 'scan_status')) {
                $table->string('scan_status')->default('pending')->after('top_risk_reasons'); // insufficient_data, scanned, flagged
            }
            if (!Schema::hasColumn('vendors', 'last_scanned_at')) {
                $table->timestamp('last_scanned_at')->nullable()->after('scan_status');
            }
        });

        // 3. Add human-in-the-loop audit fields to fraud_flags table
        Schema::table('fraud_flags', function (Blueprint $table) {
            if (!Schema::hasColumn('fraud_flags', 'dismissed_reason')) {
                $table->text('dismissed_reason')->nullable()->after('resolved');
            }
            if (!Schema::hasColumn('fraud_flags', 'admin_action')) {
                $table->string('admin_action')->nullable()->after('dismissed_reason'); // dismissed, warned, info_requested, suspended, resolved
            }
            if (!Schema::hasColumn('fraud_flags', 'action_note')) {
                $table->text('action_note')->nullable()->after('admin_action');
            }
            if (!Schema::hasColumn('fraud_flags', 'action_deadline')) {
                $table->timestamp('action_deadline')->nullable()->after('action_note');
            }
            if (!Schema::hasColumn('fraud_flags', 'actioned_at')) {
                $table->timestamp('actioned_at')->nullable()->after('action_deadline');
            }
            if (!Schema::hasColumn('fraud_flags', 'actioned_by')) {
                $table->foreignId('actioned_by')->nullable()->after('actioned_at');
            }
            if (!Schema::hasColumn('fraud_flags', 'top_reasons')) {
                $table->json('top_reasons')->nullable()->after('actioned_by');
            }
            if (!Schema::hasColumn('fraud_flags', 'peer_comparison')) {
                $table->json('peer_comparison')->nullable()->after('top_reasons');
            }
            if (!Schema::hasColumn('fraud_flags', 'hard_rule_hits')) {
                $table->json('hard_rule_hits')->nullable()->after('peer_comparison');
            }
            if (!Schema::hasColumn('fraud_flags', 'isolation_forest_score')) {
                $table->float('isolation_forest_score')->nullable()->after('hard_rule_hits');
            }
            if (!Schema::hasColumn('fraud_flags', 'model_version')) {
                $table->string('model_version')->nullable()->after('isolation_forest_score');
            }
            if (!Schema::hasColumn('fraud_flags', 'features_snapshot')) {
                $table->json('features_snapshot')->nullable()->after('model_version');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vendor_events');

        Schema::table('vendors', function (Blueprint $table) {
            $table->dropColumn([
                'isolation_forest_score',
                'hard_rule_score',
                'top_risk_reasons',
                'scan_status',
                'last_scanned_at',
            ]);
        });

        Schema::table('fraud_flags', function (Blueprint $table) {
            $table->dropColumn([
                'dismissed_reason',
                'admin_action',
                'top_reasons',
                'peer_comparison',
            ]);
        });
    }
};
