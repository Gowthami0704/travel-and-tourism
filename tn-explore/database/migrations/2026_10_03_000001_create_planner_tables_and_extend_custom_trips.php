<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Ensure States Table
        if (!Schema::hasTable('states')) {
            Schema::create('states', function (Blueprint $table) {
                $table->id();
                $table->string('name')->unique();
                $table->string('code', 5)->unique();
                $table->boolean('is_active')->default(true);
                $table->timestamps();
            });
        }

        // 2. Extend Places table for Inter-State & Planner capabilities
        Schema::table('places', function (Blueprint $table) {
            if (!Schema::hasColumn('places', 'state_id')) {
                $table->foreignId('state_id')->nullable()->after('id')->constrained('states')->nullOnDelete();
            }
            if (!Schema::hasColumn('places', 'typical_visit_hours')) {
                $table->decimal('typical_visit_hours', 4, 1)->default(2.0)->after('category');
            }
            if (!Schema::hasColumn('places', 'entry_fee')) {
                $table->decimal('entry_fee', 8, 2)->default(0)->after('typical_visit_hours');
            }
            if (!Schema::hasColumn('places', 'opening_days')) {
                $table->string('opening_days')->default('All Days')->after('entry_fee');
            }
            if (!Schema::hasColumn('places', 'best_season')) {
                $table->string('best_season')->default('Oct-Mar')->after('opening_days');
            }
        });

        // 3. Distance Matrix Table (Deterministic Route Calculation)
        if (!Schema::hasTable('distance_matrix')) {
            Schema::create('distance_matrix', function (Blueprint $table) {
                $table->id();
                $table->foreignId('from_place_id')->constrained('places')->cascadeOnDelete();
                $table->foreignId('to_place_id')->constrained('places')->cascadeOnDelete();
                $table->decimal('km', 8, 2);
                $table->integer('minutes')->default(60);
                $table->timestamps();
                $table->unique(['from_place_id', 'to_place_id']);
            });
        }

        // 4. Price Baselines Table (Deterministic Cost Engine)
        if (!Schema::hasTable('price_baselines')) {
            Schema::create('price_baselines', function (Blueprint $table) {
                $table->id();
                $table->foreignId('state_id')->nullable()->constrained('states')->nullOnDelete();
                $table->foreignId('district_id')->nullable()->constrained('districts')->nullOnDelete();
                $table->string('category'); // e.g. transport_sedan_per_km, stay_budget_night, etc.
                $table->string('unit')->default('unit');
                $table->decimal('amount', 10, 2);
                $table->timestamps();
            });
        }

        // 5. Festivals & Seasons Advisories Table
        if (!Schema::hasTable('festivals_seasons')) {
            Schema::create('festivals_seasons', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->foreignId('state_id')->nullable()->constrained('states')->nullOnDelete();
                $table->foreignId('district_id')->nullable()->constrained('districts')->nullOnDelete();
                $table->integer('month_start')->default(1);
                $table->integer('month_end')->default(12);
                $table->string('advisory_type')->default('general'); // crowd_warning, temple_festival, monsoon_alert, etc.
                $table->text('description');
                $table->timestamps();
            });
        }

        // 6. Custom Trip Legs Table (Per-leg vendor dispatch)
        if (!Schema::hasTable('custom_trip_legs')) {
            Schema::create('custom_trip_legs', function (Blueprint $table) {
                $table->id();
                $table->foreignId('custom_trip_id')->constrained('custom_trips')->cascadeOnDelete();
                $table->integer('leg_order')->default(1);
                $table->foreignId('district_id')->nullable()->constrained('districts')->nullOnDelete();
                $table->string('from_location');
                $table->string('to_location');
                $table->date('leg_date')->nullable();
                $table->string('pickup_time')->nullable();
                $table->foreignId('assigned_vendor_id')->nullable()->constrained('vendors')->nullOnDelete();
                $table->decimal('cost', 10, 2)->nullable();
                $table->enum('status', ['pending', 'assigned', 'in_progress', 'completed'])->default('pending');
                $table->timestamps();
            });
        }

        // 7. Extend Custom Trips Table
        Schema::table('custom_trips', function (Blueprint $table) {
            if (!Schema::hasColumn('custom_trips', 'scope')) {
                $table->string('scope')->default('inside_tn')->after('destination_region');
            }
            if (!Schema::hasColumn('custom_trips', 'start_place')) {
                $table->string('start_place')->nullable()->after('scope');
            }
            if (!Schema::hasColumn('custom_trips', 'end_place')) {
                $table->string('end_place')->nullable()->after('start_place');
            }
            if (!Schema::hasColumn('custom_trips', 'route_type')) {
                $table->string('route_type')->default('round')->after('end_place');
            }
            if (!Schema::hasColumn('custom_trips', 'date_mode')) {
                $table->string('date_mode')->default('exact')->after('trip_type');
            }
            if (!Schema::hasColumn('custom_trips', 'flexible_month')) {
                $table->string('flexible_month')->nullable()->after('end_date');
            }
            if (!Schema::hasColumn('custom_trips', 'budget_total')) {
                $table->decimal('budget_total', 10, 2)->nullable()->after('budget_max');
            }
            if (!Schema::hasColumn('custom_trips', 'budget_basis')) {
                $table->string('budget_basis')->default('total')->after('budget_total');
            }
            if (!Schema::hasColumn('custom_trips', 'budget_split')) {
                $table->json('budget_split')->nullable()->after('budget_basis');
            }
            if (!Schema::hasColumn('custom_trips', 'travelers')) {
                $table->json('travelers')->nullable()->after('children_count');
            }
            if (!Schema::hasColumn('custom_trips', 'preferences')) {
                $table->json('preferences')->nullable()->after('required_services');
            }
            if (!Schema::hasColumn('custom_trips', 'transport')) {
                $table->string('transport')->nullable()->after('transport_pref');
            }
            if (!Schema::hasColumn('custom_trips', 'stay_level')) {
                $table->string('stay_level')->nullable()->after('accommodation_pref');
            }
            if (!Schema::hasColumn('custom_trips', 'meals')) {
                $table->string('meals')->nullable()->after('food_pref');
            }
            if (!Schema::hasColumn('custom_trips', 'guide')) {
                $table->boolean('guide')->default(false)->after('meals');
            }
            if (!Schema::hasColumn('custom_trips', 'plan_options')) {
                $table->json('plan_options')->nullable()->after('notes');
            }
            if (!Schema::hasColumn('custom_trips', 'selected_plan')) {
                $table->string('selected_plan')->nullable()->after('plan_options');
            }
        });
    }

    public function down(): void
    {
        Schema::table('custom_trips', function (Blueprint $table) {
            $table->dropColumn([
                'scope',
                'start_place',
                'end_place',
                'route_type',
                'date_mode',
                'flexible_month',
                'budget_total',
                'budget_basis',
                'budget_split',
                'travelers',
                'preferences',
                'transport',
                'stay_level',
                'meals',
                'guide',
                'plan_options',
                'selected_plan',
            ]);
        });
        Schema::dropIfExists('custom_trip_legs');
        Schema::dropIfExists('festivals_seasons');
        Schema::dropIfExists('price_baselines');
        Schema::dropIfExists('distance_matrix');
        Schema::table('places', function (Blueprint $table) {
            $table->dropColumn([
                'state_id',
                'typical_visit_hours',
                'entry_fee',
                'opening_days',
                'best_season',
            ]);
        });
    }
};
