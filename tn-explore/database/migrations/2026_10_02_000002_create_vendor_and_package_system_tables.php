<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Roles & Assigned Districts on Users
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'assigned_district_ids')) {
                $table->json('assigned_district_ids')->nullable()->after('role');
            }
        });

        // 2. Vendor Districts Pivot Table with status (pending, approved, rejected)
        if (!Schema::hasTable('vendor_districts')) {
            Schema::create('vendor_districts', function (Blueprint $table) {
                $table->id();
                $table->foreignId('vendor_id')->constrained('vendors')->cascadeOnDelete();
                $table->foreignId('district_id')->constrained('districts')->cascadeOnDelete();
                $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
                $table->text('rejection_reason')->nullable();
                $table->timestamp('reviewed_at')->nullable();
                $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
                $table->timestamps();

                $table->unique(['vendor_id', 'district_id']);
            });
        }

        // 3. District Change Requests (with 90-day cooldown enforcement)
        if (!Schema::hasTable('district_change_requests')) {
            Schema::create('district_change_requests', function (Blueprint $table) {
                $table->id();
                $table->foreignId('vendor_id')->constrained('vendors')->cascadeOnDelete();
                $table->foreignId('old_district_id')->constrained('districts')->cascadeOnDelete();
                $table->foreignId('new_district_id')->constrained('districts')->cascadeOnDelete();
                $table->text('reason')->nullable();
                $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
                $table->text('admin_notes')->nullable();
                $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
                $table->timestamp('reviewed_at')->nullable();
                $table->timestamps();
            });
        }

        // 4. Outside-TN Packages & Package Scope on Listings
        Schema::table('listings', function (Blueprint $table) {
            if (!Schema::hasColumn('listings', 'scope')) {
                $table->enum('scope', ['inside_tn', 'outside_tn'])->default('inside_tn')->after('type');
            }
            if (!Schema::hasColumn('listings', 'destination_states')) {
                $table->json('destination_states')->nullable()->after('scope');
            }
            if (!Schema::hasColumn('listings', 'permit_document_path')) {
                $table->string('permit_document_path')->nullable()->after('destination_states');
            }
            if (!Schema::hasColumn('listings', 'approval_status')) {
                $table->enum('approval_status', ['approved', 'pending_approval', 'rejected'])->default('approved')->after('permit_document_path');
            }
            if (!Schema::hasColumn('listings', 'rejection_reason')) {
                $table->text('rejection_reason')->nullable()->after('approval_status');
            }
            if (!Schema::hasColumn('listings', 'cancellation_policy')) {
                $table->text('cancellation_policy')->nullable()->after('rejection_reason');
            }
            if (!Schema::hasColumn('listings', 'emergency_contact')) {
                $table->string('emergency_contact')->nullable()->after('cancellation_policy');
            }
        });

        // 5. Vendor Availability Calendar (prevent double bookings)
        if (!Schema::hasTable('vendor_availabilities')) {
            Schema::create('vendor_availabilities', function (Blueprint $table) {
                $table->id();
                $table->foreignId('vendor_id')->constrained('vendors')->cascadeOnDelete();
                $table->date('date');
                $table->enum('status', ['available', 'booked', 'blocked'])->default('available');
                $table->foreignId('booking_id')->nullable()->constrained('bookings')->nullOnDelete();
                $table->string('notes')->nullable();
                $table->timestamps();

                $table->unique(['vendor_id', 'date']);
            });
        }

        // 6. Multi-Leg Trip Legs Table
        if (!Schema::hasTable('custom_trip_legs')) {
            Schema::create('custom_trip_legs', function (Blueprint $table) {
                $table->id();
                $table->foreignId('custom_trip_id')->constrained('custom_trips')->cascadeOnDelete();
                $table->integer('leg_order')->default(1);
                $table->foreignId('district_id')->constrained('districts')->cascadeOnDelete();
                $table->string('from_location');
                $table->string('to_location');
                $table->date('leg_date');
                $table->time('pickup_time')->nullable();
                $table->foreignId('assigned_vendor_id')->nullable()->constrained('vendors')->nullOnDelete();
                $table->decimal('cost', 10, 2)->nullable();
                $table->enum('status', ['unassigned', 'assigned', 'confirmed', 'completed'])->default('unassigned');
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('custom_trip_legs');
        Schema::dropIfExists('vendor_availabilities');
        Schema::dropIfExists('district_change_requests');
        Schema::dropIfExists('vendor_districts');

        Schema::table('listings', function (Blueprint $table) {
            $table->dropColumn([
                'scope',
                'destination_states',
                'permit_document_path',
                'approval_status',
                'rejection_reason',
                'cancellation_policy',
                'emergency_contact',
            ]);
        });

        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'assigned_district_ids')) {
                $table->dropColumn('assigned_district_ids');
            }
        });
    }
};
