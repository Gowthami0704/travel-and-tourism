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
        // 1. Custom Trips submitted by Tourists
        Schema::create('custom_trips', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->enum('destination_region', ['inside_tn', 'kerala', 'outside_tn', 'interstate_circuit'])->default('inside_tn');
            $table->json('destinations')->nullable(); // e.g. ["Munnar", "Alleppey", "Kochi"]
            $table->enum('trip_type', ['family', 'friends', 'strangers_pool', 'solo', 'corporate'])->default('friends');
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->integer('duration_days')->default(3);
            $table->integer('adults_count')->default(2);
            $table->integer('children_count')->default(0);
            $table->decimal('budget_min', 10, 2)->default(5000);
            $table->decimal('budget_max', 10, 2)->default(25000);
            $table->string('currency', 10)->default('INR');
            $table->string('accommodation_pref')->default('3star_hotel');
            $table->string('transport_pref')->default('suv');
            $table->string('food_pref')->default('flexible');
            $table->json('required_services')->nullable(); // e.g. ["guide", "entry_passes", "campfire", "safari_jeep"]
            $table->text('notes')->nullable();
            $table->enum('status', ['pending_verification', 'verified_active', 'bidding_closed', 'booked', 'cancelled', 'rejected'])->default('pending_verification');
            $table->text('admin_notes')->nullable();
            $table->foreignId('verified_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('verified_at')->nullable();
            $table->timestamps();
        });

        // 2. Vendor Custom Proposals / Quotes
        Schema::create('trip_proposals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('custom_trip_id')->constrained('custom_trips')->cascadeOnDelete();
            $table->foreignId('vendor_id')->constrained('vendors')->cascadeOnDelete();
            $table->decimal('quote_price', 10, 2);
            $table->json('inclusions')->nullable(); // e.g. ["AC Cab with Driver", "4-Star Hotel", "Breakfast"]
            $table->json('exclusions')->nullable(); // e.g. ["Entry tickets", "Personal expenses"]
            $table->text('itinerary_summary')->nullable();
            $table->text('vendor_message')->nullable();
            $table->timestamp('valid_until')->nullable();
            $table->enum('status', ['submitted', 'shortlisted', 'accepted', 'declined', 'withdrawn'])->default('submitted');
            $table->timestamps();
        });

        // 3. Trip Chat Channels between Tourist and Vendor
        Schema::create('trip_chats', function (Blueprint $table) {
            $table->id();
            $table->foreignId('custom_trip_id')->constrained('custom_trips')->cascadeOnDelete();
            $table->foreignId('proposal_id')->nullable()->constrained('trip_proposals')->nullOnDelete();
            $table->foreignId('tourist_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('vendor_id')->constrained('vendors')->cascadeOnDelete();
            $table->timestamp('last_message_at')->nullable();
            $table->timestamps();
        });

        // 4. Trip Chat Messages
        Schema::create('trip_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('chat_id')->constrained('trip_chats')->cascadeOnDelete();
            $table->foreignId('sender_id')->constrained('users')->cascadeOnDelete();
            $table->enum('sender_role', ['tourist', 'vendor', 'admin'])->default('tourist');
            $table->text('message');
            $table->string('attachment_url')->nullable();
            $table->json('custom_quote_payload')->nullable(); // Optional revised quote {price: 15000, inclusions: [...]}
            $table->boolean('is_read')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('trip_messages');
        Schema::dropIfExists('trip_chats');
        Schema::dropIfExists('trip_proposals');
        Schema::dropIfExists('custom_trips');
    }
};
