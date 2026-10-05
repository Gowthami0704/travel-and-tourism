<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. States table
        if (!Schema::hasTable('states')) {
            Schema::create('states', function (Blueprint $table) {
                $table->id();
                $table->string('name')->unique();
                $table->string('code', 5)->unique();
                $table->boolean('is_active')->default(true);
                $table->timestamps();
            });
        }

        // 2. Add state_id to districts
        Schema::table('districts', function (Blueprint $table) {
            if (!Schema::hasColumn('districts', 'state_id')) {
                $table->foreignId('state_id')->nullable()->after('id')->constrained('states')->nullOnDelete();
            }
        });

        // 3. Add state and safety/insurance columns to vendors
        Schema::table('vendors', function (Blueprint $table) {
            if (!Schema::hasColumn('vendors', 'state_id')) {
                $table->foreignId('state_id')->nullable()->after('district_id')->constrained('states')->nullOnDelete();
            }
            if (!Schema::hasColumn('vendors', 'state_name')) {
                $table->string('state_name')->default('Tamil Nadu')->after('state_id');
            }
            if (!Schema::hasColumn('vendors', 'safety_certificate_path')) {
                $table->string('safety_certificate_path')->nullable()->after('license_url');
            }
            if (!Schema::hasColumn('vendors', 'insurance_document_path')) {
                $table->string('insurance_document_path')->nullable()->after('safety_certificate_path');
            }
            if (!Schema::hasColumn('vendors', 'safety_approved')) {
                $table->boolean('safety_approved')->default(false)->after('insurance_document_path');
            }
            if (!Schema::hasColumn('vendors', 'extended_districts_revoked')) {
                $table->boolean('extended_districts_revoked')->default(false)->after('safety_approved');
            }
            if (!Schema::hasColumn('vendors', 'license_expiry_date')) {
                $table->date('license_expiry_date')->nullable()->after('extended_districts_revoked');
            }
        });

        // 4. Add level ('primary', 'extended') to vendor_districts
        Schema::table('vendor_districts', function (Blueprint $table) {
            if (!Schema::hasColumn('vendor_districts', 'level')) {
                $table->enum('level', ['primary', 'extended'])->default('primary')->after('district_id');
            }
        });

        // 5. Rich Package Fields on listings
        Schema::table('listings', function (Blueprint $table) {
            if (!Schema::hasColumn('listings', 'category')) {
                $table->string('category')->default('Heritage and Temples')->after('title');
            }
            if (!Schema::hasColumn('listings', 'start_district_id')) {
                $table->foreignId('start_district_id')->nullable()->after('category')->constrained('districts')->nullOnDelete();
            }
            if (!Schema::hasColumn('listings', 'start_city')) {
                $table->string('start_city')->nullable()->after('start_district_id');
            }
            if (!Schema::hasColumn('listings', 'start_state')) {
                $table->string('start_state')->default('Tamil Nadu')->after('start_city');
            }
            if (!Schema::hasColumn('listings', 'destinations')) {
                $table->json('destinations')->nullable()->after('start_state');
            }
            if (!Schema::hasColumn('listings', 'duration_days')) {
                $table->integer('duration_days')->default(1)->after('destinations');
            }
            if (!Schema::hasColumn('listings', 'duration_nights')) {
                $table->integer('duration_nights')->default(0)->after('duration_days');
            }
            if (!Schema::hasColumn('listings', 'group_size')) {
                $table->integer('group_size')->nullable()->default(15)->after('duration_nights');
            }
            if (!Schema::hasColumn('listings', 'price_per_person')) {
                $table->decimal('price_per_person', 10, 2)->nullable()->after('price');
            }
            if (!Schema::hasColumn('listings', 'child_with_bed_price')) {
                $table->decimal('child_with_bed_price', 10, 2)->nullable()->after('price_per_person');
            }
            if (!Schema::hasColumn('listings', 'child_without_bed_price')) {
                $table->decimal('child_without_bed_price', 10, 2)->nullable()->after('child_with_bed_price');
            }
            if (!Schema::hasColumn('listings', 'accommodation')) {
                $table->string('accommodation')->nullable()->after('child_without_bed_price');
            }
            if (!Schema::hasColumn('listings', 'transport')) {
                $table->string('transport')->nullable()->after('accommodation');
            }
            if (!Schema::hasColumn('listings', 'day_wise_itinerary')) {
                $table->json('day_wise_itinerary')->nullable()->after('transport');
            }
            if (!Schema::hasColumn('listings', 'inclusions')) {
                $table->json('inclusions')->nullable()->after('day_wise_itinerary');
            }
            if (!Schema::hasColumn('listings', 'exclusions')) {
                $table->json('exclusions')->nullable()->after('inclusions');
            }
            if (!Schema::hasColumn('listings', 'need_to_know')) {
                $table->json('need_to_know')->nullable()->after('exclusions');
            }
            if (!Schema::hasColumn('listings', 'payment_terms')) {
                $table->json('payment_terms')->nullable()->after('need_to_know');
            }
            if (!Schema::hasColumn('listings', 'cancellation_slabs')) {
                $table->json('cancellation_slabs')->nullable()->after('payment_terms');
            }
            if (!Schema::hasColumn('listings', 'difficulty')) {
                $table->enum('difficulty', ['easy', 'moderate', 'hard'])->default('easy')->after('cancellation_slabs');
            }
            if (!Schema::hasColumn('listings', 'weather_season_note')) {
                $table->string('weather_season_note')->nullable()->after('difficulty');
            }
            if (!Schema::hasColumn('listings', 'is_adventure')) {
                $table->boolean('is_adventure')->default(false)->after('weather_season_note');
            }
            if (!Schema::hasColumn('listings', 'is_group_departure')) {
                $table->boolean('is_group_departure')->default(false)->after('is_adventure');
            }
        });

        // 6. Group Departures Table
        if (!Schema::hasTable('package_departures')) {
            Schema::create('package_departures', function (Blueprint $table) {
                $table->id();
                $table->foreignId('listing_id')->constrained('listings')->cascadeOnDelete();
                $table->date('departure_date');
                $table->integer('total_seats')->default(20);
                $table->integer('seats_left')->default(20);
                $table->enum('status', ['open', 'sold_out', 'cancelled'])->default('open');
                $table->timestamps();
            });
        }

        // 7. Quick Enquiries Table
        if (!Schema::hasTable('quick_enquiries')) {
            Schema::create('quick_enquiries', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('phone');
                $table->string('city')->nullable();
                $table->foreignId('destination_district_id')->nullable()->constrained('districts')->nullOnDelete();
                $table->date('travel_date')->nullable();
                $table->integer('people_count')->default(2);
                $table->string('trip_type')->default('family');
                $table->enum('status', ['new', 'quoted', 'contacted', 'closed'])->default('new');
                $table->timestamps();
            });
        }

        // 8. Health declaration & Age on Bookings for adventure
        Schema::table('bookings', function (Blueprint $table) {
            if (!Schema::hasColumn('bookings', 'departure_id')) {
                $table->foreignId('departure_id')->nullable()->after('listing_id')->constrained('package_departures')->nullOnDelete();
            }
            if (!Schema::hasColumn('bookings', 'health_declaration_accepted')) {
                $table->boolean('health_declaration_accepted')->default(true)->after('num_people');
            }
            if (!Schema::hasColumn('bookings', 'tourist_age')) {
                $table->integer('tourist_age')->nullable()->after('health_declaration_accepted');
            }
        });
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropColumn(['departure_id', 'health_declaration_accepted', 'tourist_age']);
        });
        Schema::dropIfExists('quick_enquiries');
        Schema::dropIfExists('package_departures');
        Schema::table('listings', function (Blueprint $table) {
            $table->dropColumn([
                'category',
                'start_district_id',
                'start_city',
                'start_state',
                'destinations',
                'duration_days',
                'duration_nights',
                'group_size',
                'price_per_person',
                'child_with_bed_price',
                'child_without_bed_price',
                'accommodation',
                'transport',
                'day_wise_itinerary',
                'inclusions',
                'exclusions',
                'need_to_know',
                'payment_terms',
                'cancellation_slabs',
                'difficulty',
                'weather_season_note',
                'is_adventure',
                'is_group_departure',
            ]);
        });
        Schema::table('vendor_districts', function (Blueprint $table) {
            $table->dropColumn('level');
        });
        Schema::table('vendors', function (Blueprint $table) {
            $table->dropColumn([
                'state_id',
                'state_name',
                'safety_certificate_path',
                'insurance_document_path',
                'safety_approved',
                'extended_districts_revoked',
                'license_expiry_date',
            ]);
        });
        Schema::table('districts', function (Blueprint $table) {
            $table->dropColumn('state_id');
        });
        Schema::dropIfExists('states');
    }
};
