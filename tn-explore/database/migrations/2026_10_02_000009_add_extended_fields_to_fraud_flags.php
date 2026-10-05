<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('vendors', function (Blueprint $table) {
            if (!Schema::hasColumn('vendors', 'risk_tier')) {
                $table->string('risk_tier')->default('safe')->after('hard_rule_score');
            }
        });

        Schema::table('fraud_flags', function (Blueprint $table) {
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

    public function down(): void
    {
        Schema::table('fraud_flags', function (Blueprint $table) {
            $table->dropColumn([
                'action_note',
                'action_deadline',
                'actioned_at',
                'actioned_by',
                'hard_rule_hits',
                'isolation_forest_score',
                'model_version',
                'features_snapshot',
            ]);
        });
    }
};
