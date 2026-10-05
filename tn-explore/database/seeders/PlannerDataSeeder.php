<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\State;
use App\Models\District;
use App\Models\Place;
use App\Models\DistanceMatrix;
use App\Models\PriceBaseline;
use App\Models\FestivalSeason;

class PlannerDataSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Seed States
        $statesData = [
            ['name' => 'Tamil Nadu', 'code' => 'TN', 'is_active' => true],
            ['name' => 'Kerala', 'code' => 'KL', 'is_active' => true],
            ['name' => 'Karnataka', 'code' => 'KA', 'is_active' => true],
            ['name' => 'Puducherry', 'code' => 'PY', 'is_active' => true],
            ['name' => 'Andhra Pradesh', 'code' => 'AP', 'is_active' => true],
            ['name' => 'Telangana', 'code' => 'TS', 'is_active' => true],
        ];

        $states = [];
        foreach ($statesData as $s) {
            $states[$s['code']] = State::updateOrCreate(['code' => $s['code']], $s);
        }

        // Link all existing districts to Tamil Nadu if not linked
        $tnState = $states['TN'];
        District::whereNull('state_id')->update(['state_id' => $tnState->id]);

        // 2. Ensure TN places have planner metadata & state_id
        Place::whereNull('state_id')->update([
            'state_id' => $tnState->id,
            'typical_visit_hours' => 2.5,
            'entry_fee' => 50.0,
            'opening_days' => 'All Days',
            'best_season' => 'Oct - Mar'
        ]);

        // 3. Seed Outside-TN Places
        $outsidePlaces = [
            // Kerala
            [
                'name' => 'Munnar Tea Gardens & Mattupetty Dam',
                'state_code' => 'KL',
                'category' => 'hill_station',
                'typical_visit_hours' => 3.5,
                'entry_fee' => 100.0,
                'opening_days' => 'All Days',
                'best_season' => 'Sep - May',
                'description' => 'Rolling green tea plantations, misty mountain peaks, and serene lake boating in Western Ghats.',
                'latitude' => 10.0889,
                'longitude' => 77.0595,
            ],
            [
                'name' => 'Alleppey Backwaters & Houseboat Cruise',
                'state_code' => 'KL',
                'category' => 'nature',
                'typical_visit_hours' => 4.0,
                'entry_fee' => 250.0,
                'opening_days' => 'All Days',
                'best_season' => 'Oct - Mar',
                'description' => 'World-famous tranquil backwater canals, palm-fringed lagoons, and traditional Kerala houseboats.',
                'latitude' => 9.4981,
                'longitude' => 76.3388,
            ],
            [
                'name' => 'Wayanad Chembra Peak & Edakkal Caves',
                'state_code' => 'KL',
                'category' => 'nature',
                'typical_visit_hours' => 3.0,
                'entry_fee' => 80.0,
                'opening_days' => 'Tue - Sun',
                'best_season' => 'Oct - May',
                'description' => 'Prehistoric rock etchings, heart-shaped lake, spice plantations, and cloud-draped mountain hiking.',
                'latitude' => 11.6854,
                'longitude' => 76.1320,
            ],
            [
                'name' => 'Fort Kochi & Chinese Fishing Nets',
                'state_code' => 'KL',
                'category' => 'heritage',
                'typical_visit_hours' => 2.5,
                'entry_fee' => 30.0,
                'opening_days' => 'All Days',
                'best_season' => 'Oct - Apr',
                'description' => 'Colonial Portuguese and Dutch architecture, historic spice trading port, and seaside promenade.',
                'latitude' => 9.9656,
                'longitude' => 76.2421,
            ],
            [
                'name' => 'Varkala Cliff & Papanasam Beach',
                'state_code' => 'KL',
                'category' => 'beach',
                'typical_visit_hours' => 2.5,
                'entry_fee' => 0.0,
                'opening_days' => 'All Days',
                'best_season' => 'Nov - Mar',
                'description' => 'Majestic red laterite cliffs bordering the Arabian Sea, sunset viewpoints, and cafes.',
                'latitude' => 8.7379,
                'longitude' => 76.7163,
            ],

            // Karnataka
            [
                'name' => 'Mysore Palace & Chamundi Hill',
                'state_code' => 'KA',
                'category' => 'heritage',
                'typical_visit_hours' => 3.0,
                'entry_fee' => 120.0,
                'opening_days' => 'All Days',
                'best_season' => 'Sep - Mar',
                'description' => 'Magnificent Indo-Saracenic royal palace illuminated by 100,000 light bulbs and panoramic hill shrine.',
                'latitude' => 12.3051,
                'longitude' => 76.6551,
            ],
            [
                'name' => 'Coorg Abbey Falls & Coffee Plantations',
                'state_code' => 'KA',
                'category' => 'hill_station',
                'typical_visit_hours' => 3.0,
                'entry_fee' => 50.0,
                'opening_days' => 'All Days',
                'best_season' => 'Oct - Apr',
                'description' => 'The Scotland of India with aromatic coffee estates, rushing cascading waterfalls, and misty trails.',
                'latitude' => 12.4244,
                'longitude' => 75.7382,
            ],
            [
                'name' => 'Hampi Virupaksha Temple & Ruins',
                'state_code' => 'KA',
                'category' => 'heritage',
                'typical_visit_hours' => 4.0,
                'entry_fee' => 150.0,
                'opening_days' => 'All Days',
                'best_season' => 'Nov - Feb',
                'description' => 'UNESCO World Heritage Vijayanagara empire ruins, monolithic stone chariot, and Tungabhadra river boulder hills.',
                'latitude' => 15.3350,
                'longitude' => 76.4600,
            ],
            [
                'name' => 'Chikmagalur Mullayanagiri Peak & Coffee Hills',
                'state_code' => 'KA',
                'category' => 'nature',
                'typical_visit_hours' => 3.0,
                'entry_fee' => 20.0,
                'opening_days' => 'All Days',
                'best_season' => 'Sep - Apr',
                'description' => 'Highest peak in Karnataka, birthplace of Indian coffee, scenic winding mountain roads.',
                'latitude' => 13.3910,
                'longitude' => 75.7214,
            ],

            // Puducherry
            [
                'name' => 'Promenade Beach & French Quarter (White Town)',
                'state_code' => 'PY',
                'category' => 'heritage',
                'typical_visit_hours' => 2.5,
                'entry_fee' => 0.0,
                'opening_days' => 'All Days',
                'best_season' => 'Oct - Mar',
                'description' => 'Pastel French colonial villas, cobblestone seaside promenade, and chic French bakeries.',
                'latitude' => 11.9340,
                'longitude' => 79.8306,
            ],
            [
                'name' => 'Auroville Matrimandir & Golden Globe',
                'state_code' => 'PY',
                'category' => 'heritage',
                'typical_visit_hours' => 2.0,
                'entry_fee' => 0.0,
                'opening_days' => 'Mon - Sat',
                'best_season' => 'Oct - Mar',
                'description' => 'Universal township dedicated to peace, featuring the stunning golden meditation sphere.',
                'latitude' => 12.0070,
                'longitude' => 79.8106,
            ],

            // Andhra Pradesh
            [
                'name' => 'Tirupati Sri Venkateswara Swamy Temple',
                'state_code' => 'AP',
                'category' => 'temple',
                'typical_visit_hours' => 4.0,
                'entry_fee' => 300.0,
                'opening_days' => 'All Days',
                'best_season' => 'Sep - Mar',
                'description' => 'Ancient sacred hill shrine of Lord Balaji atop Tirumala hills, one of the most revered pilgrimage hubs in India.',
                'latitude' => 13.6833,
                'longitude' => 79.3472,
            ],
            [
                'name' => 'Srikalahasti Vayu Lingam Temple',
                'state_code' => 'AP',
                'category' => 'temple',
                'typical_visit_hours' => 2.0,
                'entry_fee' => 100.0,
                'opening_days' => 'All Days',
                'best_season' => 'Oct - Mar',
                'description' => 'One of the Pancha Bhoota Sthalams representing Air (Vayu), famed for Rahu-Ketu pariharam ceremonies.',
                'latitude' => 13.7500,
                'longitude' => 79.7000,
            ],

            // Telangana
            [
                'name' => 'Hyderabad Charminar & Golconda Fort',
                'state_code' => 'TS',
                'category' => 'heritage',
                'typical_visit_hours' => 3.5,
                'entry_fee' => 80.0,
                'opening_days' => 'All Days',
                'best_season' => 'Oct - Mar',
                'description' => 'Iconic 16th-century four-minaret monument, diamond fortress acoustics, and authentic Hyderabadi cuisine.',
                'latitude' => 17.3616,
                'longitude' => 78.4747,
            ]
        ];

        foreach ($outsidePlaces as $p) {
            $stateObj = $states[$p['state_code']];
            Place::updateOrCreate(
                ['name' => $p['name']],
                [
                    'state_id' => $stateObj->id,
                    'category' => $p['category'],
                    'typical_visit_hours' => $p['typical_visit_hours'],
                    'entry_fee' => $p['entry_fee'],
                    'opening_days' => $p['opening_days'],
                    'best_season' => $p['best_season'],
                    'description' => $p['description'],
                    'latitude' => $p['latitude'],
                    'longitude' => $p['longitude'],
                    'is_hidden_gem' => false,
                ]
            );
        }

        // 4. Seed Price Baselines (Honest Baseline Cost Engine)
        $baselines = [
            // Transport rates per km
            ['category' => 'transport_sedan_per_km', 'unit' => 'km', 'amount' => 14.00],
            ['category' => 'transport_suv_per_km', 'unit' => 'km', 'amount' => 19.00],
            ['category' => 'transport_tempo_per_km', 'unit' => 'km', 'amount' => 26.00],
            ['category' => 'driver_bata_per_day', 'unit' => 'day', 'amount' => 500.00],
            
            // Accommodation per room/night
            ['category' => 'stay_budget_night', 'unit' => 'room_night', 'amount' => 1200.00],
            ['category' => 'stay_balanced_night', 'unit' => 'room_night', 'amount' => 2800.00],
            ['category' => 'stay_comfort_night', 'unit' => 'room_night', 'amount' => 5500.00],

            // Food per person/day
            ['category' => 'meal_veg_per_person', 'unit' => 'person_day', 'amount' => 450.00],
            ['category' => 'meal_nonveg_per_person', 'unit' => 'person_day', 'amount' => 750.00],

            // Guided assistance
            ['category' => 'guide_per_day', 'unit' => 'day', 'amount' => 1500.00],
            
            // Buffer percentage
            ['category' => 'contingency_buffer', 'unit' => 'percent', 'amount' => 10.00],
        ];

        foreach ($baselines as $b) {
            PriceBaseline::updateOrCreate(
                ['category' => $b['category']],
                $b
            );
        }

        // 5. Seed Festivals & Seasons Advisories
        $festivals = [
            [
                'name' => 'Pongal Harvest Festival & Jallikattu',
                'state_id' => $tnState->id,
                'month_start' => 1,
                'month_end' => 1,
                'advisory_type' => 'crowd_warning',
                'description' => 'Peak state-wide festival across Madurai, Alanganallur, and rural TN. Expect high traffic, festive village fairs, and temple crowds.'
            ],
            [
                'name' => 'Chithirai Thiruvizha (Madurai)',
                'state_id' => $tnState->id,
                'month_start' => 4,
                'month_end' => 5,
                'advisory_type' => 'temple_festival',
                'description' => 'Grand coronation and celestial wedding at Meenakshi Temple. Over 1 million devotees assemble; book hotels well in advance.'
            ],
            [
                'name' => 'Southwest Monsoon Alert (Western Ghats & Kerala)',
                'state_id' => $states['KL']->id,
                'month_start' => 6,
                'month_end' => 8,
                'advisory_type' => 'monsoon_alert',
                'description' => 'Heavy rainfall in Munnar, Wayanad, and Valparai. Gorgeous lush waterfalls, but check hill route road advisories for occasional mudslides.'
            ],
            [
                'name' => 'Mysore Dasara Jumbo Savari',
                'state_id' => $states['KA']->id,
                'month_start' => 9,
                'month_end' => 10,
                'advisory_type' => 'peak_season',
                'description' => 'Royal elephant procession and dazzling Mysore Palace illuminations. Supreme cultural spectacle with peak hotel bookings.'
            ],
            [
                'name' => 'Tirupati Brahmotsavam Annual Utsavam',
                'state_id' => $states['AP']->id,
                'month_start' => 9,
                'month_end' => 10,
                'advisory_type' => 'crowd_warning',
                'description' => 'Nine-day celestial festival in Tirumala. Special Darshan passes required; advance TTD booking strictly recommended.'
            ],
            [
                'name' => 'Northeast Monsoon & Coastal Advisory (TN & Puducherry)',
                'state_id' => $tnState->id,
                'month_start' => 10,
                'month_end' => 11,
                'advisory_type' => 'monsoon_alert',
                'description' => 'Coastal rains across Chennai, Mahabalipuram, and Pondicherry. Carry umbrella and rainwear for beach excursions.'
            ],
            [
                'name' => 'Winter Cool Peak Tourist Season',
                'state_id' => $tnState->id,
                'month_start' => 12,
                'month_end' => 2,
                'advisory_type' => 'cool_weather',
                'description' => 'Pleasant, cool weather across all heritage temples, wildlife sanctuaries, and beaches. Perfect season for comprehensive road trips.'
            ]
        ];

        foreach ($festivals as $f) {
            FestivalSeason::updateOrCreate(
                ['name' => $f['name']],
                $f
            );
        }
    }
}
