<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Vendor Media & Gallery Assets with Perceptual Hash (pHash)
        Schema::create('vendor_media', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vendor_id')->constrained()->cascadeOnDelete();
            $table->string('mediable_type')->nullable(); // Vehicle, Listing, TripMemory
            $table->unsignedBigInteger('mediable_id')->nullable();
            $table->string('path');
            $table->string('thumb_path')->nullable();
            $table->string('medium_path')->nullable();
            $table->string('alt_text')->nullable();
            $table->string('caption')->nullable();
            $table->date('taken_at')->nullable();
            $table->foreignId('place_id')->nullable()->constrained()->nullOnDelete();
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('approved');
            $table->text('reject_reason')->nullable();
            $table->string('phash', 64)->nullable()->index(); // 64-bit perceptual hash for duplicate detection
            $table->unsignedInteger('width')->nullable();
            $table->unsignedInteger('height')->nullable();
            $table->unsignedBigInteger('file_size_bytes')->nullable();
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->boolean('is_verified_traveller_memory')->default(false);
            $table->foreignId('tourist_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['mediable_type', 'mediable_id']);
        });

        // 2. Vehicles (Fleet for rent)
        Schema::create('vehicles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vendor_id')->constrained()->cascadeOnDelete();
            $table->foreignId('district_id')->nullable()->constrained()->nullOnDelete();
            $table->enum('type', ['hatchback', 'sedan', 'suv', 'tempo_traveller', 'mini_bus', 'bus'])->default('sedan');
            $table->string('make_model');
            $table->unsignedSmallInteger('year')->default(2022);
            $table->unsignedTinyInteger('seats')->default(4);
            $table->unsignedTinyInteger('luggage_bags')->default(2);
            $table->string('fuel_type')->default('diesel'); // petrol, diesel, ev, cng
            $table->boolean('ac')->default(true);
            $table->boolean('with_driver')->default(true);
            $table->json('driver_languages')->nullable(); // ['Tamil', 'English', 'Hindi']
            $table->json('features')->nullable(); // ['gps', 'first_aid', 'child_seat', 'usb_charging', 'carrier']
            $table->text('description')->nullable();
            $table->enum('status', ['draft', 'pending', 'approved', 'rejected', 'offline'])->default('pending');
            $table->text('rejection_reason')->nullable();
            $table->decimal('baseline_approved_price', 10, 2)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 3. Vehicle Rates
        Schema::create('vehicle_rates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vehicle_id')->constrained()->cascadeOnDelete();
            $table->decimal('per_day_inr', 10, 2)->default(2500);
            $table->decimal('per_km_inr', 10, 2)->default(14);
            $table->unsignedSmallInteger('daily_min_km')->default(250);
            $table->decimal('driver_allowance_per_day', 10, 2)->default(500);
            $table->decimal('night_halt_inr', 10, 2)->default(400);
            $table->decimal('extra_km_rate', 10, 2)->default(16);
            $table->decimal('extra_hour_rate', 10, 2)->default(150);
            $table->string('toll_parking_rule')->default('Paid directly by customer at actuals');
            $table->decimal('deposit_inr', 10, 2)->default(0);
            $table->string('cancellation_rule')->default('Free cancellation up to 24 hours before pickup');
            $table->timestamps();
        });

        // 4. Vehicle Blocked Dates (Availability Calendar)
        Schema::create('vehicle_blocked_dates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vehicle_id')->constrained()->cascadeOnDelete();
            $table->date('start_date');
            $table->date('end_date');
            $table->string('reason')->nullable();
            $table->timestamps();
        });

        // 5. Vehicle Private Documents (Admin-only verification)
        Schema::create('vehicle_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vehicle_id')->constrained()->cascadeOnDelete();
            $table->string('registration_number')->nullable(); // Private until booking confirmed
            $table->string('driver_name')->nullable(); // Private until booking confirmed
            $table->string('driver_phone')->nullable(); // Private until booking confirmed
            $table->string('driver_photo_path')->nullable();
            $table->string('rc_document_path')->nullable();
            $table->string('insurance_document_path')->nullable();
            $table->date('insurance_expiry_date')->nullable();
            $table->string('permit_document_path')->nullable();
            $table->date('permit_expiry_date')->nullable();
            $table->date('fitness_expiry_date')->nullable();
            $table->boolean('is_verified')->default(false);
            $table->timestamp('verified_at')->nullable();
            $table->timestamps();
        });

        // 6. Trip Memories (Past trip photos and verified traveler albums)
        Schema::create('trip_memories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vendor_id')->constrained()->cascadeOnDelete();
            $table->foreignId('package_id')->nullable()->constrained('listings')->nullOnDelete();
            $table->foreignId('booking_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('tourist_id')->nullable()->constrained('users')->nullOnDelete();
            $table->date('trip_date')->nullable();
            $table->string('title');
            $table->text('description')->nullable();
            $table->json('place_ids')->nullable();
            $table->boolean('is_traveller_story')->default(false);
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('approved');
            $table->timestamps();
        });

        // 7. Extend listings table with hook, highlights, best_for, faq, pickup_points, baseline_approved_price if not present
        Schema::table('listings', function (Blueprint $table) {
            if (!Schema::hasColumn('listings', 'hook')) {
                $table->string('hook', 200)->nullable();
            }
            if (!Schema::hasColumn('listings', 'highlights')) {
                $table->json('highlights')->nullable();
            }
            if (!Schema::hasColumn('listings', 'best_for')) {
                $table->json('best_for')->nullable();
            }
            if (!Schema::hasColumn('listings', 'faq')) {
                $table->json('faq')->nullable();
            }
            if (!Schema::hasColumn('listings', 'pickup_points')) {
                $table->json('pickup_points')->nullable();
            }
            if (!Schema::hasColumn('listings', 'baseline_approved_price')) {
                $table->decimal('baseline_approved_price', 10, 2)->nullable();
            }
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('trip_memories');
        Schema::dropIfExists('vehicle_documents');
        Schema::dropIfExists('vehicle_blocked_dates');
        Schema::dropIfExists('vehicle_rates');
        Schema::dropIfExists('vehicles');
        Schema::dropIfExists('vendor_media');

        Schema::table('listings', function (Blueprint $table) {
            $table->dropColumn(['hook', 'highlights', 'best_for', 'faq', 'pickup_points', 'baseline_approved_price']);
        });
    }
};
