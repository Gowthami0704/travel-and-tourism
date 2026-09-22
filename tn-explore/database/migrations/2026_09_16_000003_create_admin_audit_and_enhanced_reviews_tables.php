<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Audit Logs Table
        if (!Schema::hasTable('audit_logs')) {
            Schema::create('audit_logs', function (Blueprint $table) {
                $table->id();
                $table->foreignId('admin_id')->nullable()->constrained('users')->nullOnDelete();
                $table->string('admin_name');
                $table->string('action');
                $table->string('target_type');
                $table->string('target_id')->nullable();
                $table->text('reason')->nullable();
                $table->string('ip_address')->nullable();
                $table->timestamps();
            });
        }

        // 2. Review Votes Table
        if (!Schema::hasTable('review_votes')) {
            Schema::create('review_votes', function (Blueprint $table) {
                $table->id();
                $table->foreignId('review_id')->constrained()->cascadeOnDelete();
                $table->foreignId('user_id')->constrained()->cascadeOnDelete();
                $table->enum('vote', ['helpful', 'not_helpful'])->default('helpful');
                $table->timestamps();
                $table->unique(['review_id', 'user_id']);
            });
        }

        // 3. Update Users Table
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'admin_role')) {
                $table->string('admin_role')->nullable()->after('role'); // super_admin, moderator
            }
            if (!Schema::hasColumn('users', 'is_banned')) {
                $table->boolean('is_banned')->default(false)->after('admin_role');
            }
        });

        // 4. Update Vendors Table
        Schema::table('vendors', function (Blueprint $table) {
            if (!Schema::hasColumn('vendors', 'fraud_risk_score')) {
                $table->integer('fraud_risk_score')->default(15)->after('trust_score');
            }
            if (!Schema::hasColumn('vendors', 'fraud_risk_reason')) {
                $table->text('fraud_risk_reason')->nullable()->after('fraud_risk_score');
            }
            if (!Schema::hasColumn('vendors', 'kyc_rejected_reason')) {
                $table->text('kyc_rejected_reason')->nullable()->after('kyc_status');
            }
        });

        // 5. Update Reviews Table
        Schema::table('reviews', function (Blueprint $table) {
            if (!Schema::hasColumn('reviews', 'target_type')) {
                $table->string('target_type')->default('vendor')->after('id');
            }
            if (!Schema::hasColumn('reviews', 'target_id')) {
                $table->unsignedBigInteger('target_id')->nullable()->after('target_type');
            }
            if (!Schema::hasColumn('reviews', 'title')) {
                $table->string('title')->nullable()->after('rating');
            }
            if (!Schema::hasColumn('reviews', 'photos')) {
                $table->json('photos')->nullable()->after('comment');
            }
            if (!Schema::hasColumn('reviews', 'tags')) {
                $table->json('tags')->nullable()->after('photos');
            }
            if (!Schema::hasColumn('reviews', 'visit_date')) {
                $table->date('visit_date')->nullable()->after('tags');
            }
            if (!Schema::hasColumn('reviews', 'sentiment')) {
                $table->string('sentiment')->default('positive')->after('visit_date');
            }
            if (!Schema::hasColumn('reviews', 'spam_score')) {
                $table->integer('spam_score')->default(0)->after('sentiment');
            }
            if (!Schema::hasColumn('reviews', 'abuse_score')) {
                $table->integer('abuse_score')->default(0)->after('spam_score');
            }
            if (!Schema::hasColumn('reviews', 'status')) {
                $table->string('status')->default('approved')->after('abuse_score');
            }
            if (!Schema::hasColumn('reviews', 'helpful_count')) {
                $table->integer('helpful_count')->default(0)->after('status');
            }
            if (!Schema::hasColumn('reviews', 'not_helpful_count')) {
                $table->integer('not_helpful_count')->default(0)->after('helpful_count');
            }
            if (!Schema::hasColumn('reviews', 'vendor_reply')) {
                $table->json('vendor_reply')->nullable()->after('not_helpful_count');
            }
        });
    }

    public function down(): void
    {
    }
};
