<?php

namespace Database\Seeders;

use App\Models\District;
use App\Models\Route;
use Illuminate\Database\Seeder;

class RouteSeeder extends Seeder
{
    public function run(): void
    {
        $districts = District::all()->keyBy('name');

        $routesData = [
            // Chennai <-> Madurai
            ['from' => 'Chennai', 'to' => 'Madurai', 'mode' => 'Train', 'duration_mins' => 345, 'cost' => 450, 'distance_km' => 495, 'operator' => 'Vande Bharat Express (20665)', 'notes' => 'Fastest option, comfortable AC chair car with meal service.'],
            ['from' => 'Chennai', 'to' => 'Madurai', 'mode' => 'Train', 'duration_mins' => 480, 'cost' => 290, 'distance_km' => 495, 'operator' => 'Pandian Express (12637)', 'notes' => 'Reliable overnight sleeper and AC coaches.'],
            ['from' => 'Chennai', 'to' => 'Madurai', 'mode' => 'Bus', 'duration_mins' => 480, 'cost' => 550, 'distance_km' => 460, 'operator' => 'SETC Ultra Deluxe AC Sleeper', 'notes' => 'Departs Kilambakkam KCBT; night departure recommended.'],
            ['from' => 'Chennai', 'to' => 'Madurai', 'mode' => 'Cab', 'duration_mins' => 420, 'cost' => 6500, 'distance_km' => 460, 'operator' => 'Outstation Sedan / SUV', 'notes' => 'Direct via NH38 / NH45 express highway.'],

            // Chennai <-> Coimbatore
            ['from' => 'Chennai', 'to' => 'Coimbatore', 'mode' => 'Train', 'duration_mins' => 350, 'cost' => 520, 'distance_km' => 495, 'operator' => 'Coimbatore Vande Bharat (20643)', 'notes' => 'Direct morning express, top comfort.'],
            ['from' => 'Chennai', 'to' => 'Coimbatore', 'mode' => 'Bus', 'duration_mins' => 510, 'cost' => 600, 'distance_km' => 510, 'operator' => 'TNSTC AC Airavat Sleeper', 'notes' => 'Departs regularly from Chennai.'],
            ['from' => 'Chennai', 'to' => 'Coimbatore', 'mode' => 'Cab', 'duration_mins' => 480, 'cost' => 7200, 'distance_km' => 510, 'operator' => 'Private Express Cab', 'notes' => 'Via NH48 & NH544 expressway.'],

            // Coimbatore <-> Nilgiris (Ooty)
            ['from' => 'Coimbatore', 'to' => 'Nilgiris', 'mode' => 'Bus', 'duration_mins' => 180, 'cost' => 95, 'distance_km' => 86, 'operator' => 'TNSTC Hill Bus Service', 'notes' => 'Frequent departures from Gandhipuram bus stand via Mettupalayam.'],
            ['from' => 'Coimbatore', 'to' => 'Nilgiris', 'mode' => 'Cab', 'duration_mins' => 150, 'cost' => 2400, 'distance_km' => 86, 'operator' => 'Hill Safe Cabs & SUVs', 'notes' => 'Scenic drive through Kallar ghat road and hairpin bends.'],
            ['from' => 'Coimbatore', 'to' => 'Nilgiris', 'mode' => 'Train', 'duration_mins' => 290, 'cost' => 250, 'distance_km' => 46, 'operator' => 'Nilgiri Heritage Toy Train (Mettupalayam)', 'notes' => 'UNESCO World Heritage steam cog railway.'],
            ['from' => 'Coimbatore', 'to' => 'Nilgiris', 'mode' => 'Bike', 'duration_mins' => 170, 'cost' => 350, 'distance_km' => 86, 'operator' => 'Rental Cruiser / Royal Enfield', 'notes' => 'Exciting 36 hairpin bend route for seasoned bikers.'],

            // Madurai <-> Ramanathapuram (Rameswaram)
            ['from' => 'Madurai', 'to' => 'Ramanathapuram', 'mode' => 'Train', 'duration_mins' => 120, 'cost' => 85, 'distance_km' => 115, 'operator' => 'Rameswaram Express', 'notes' => 'Connects directly through Ramanathapuram and Mandapam.'],
            ['from' => 'Madurai', 'to' => 'Ramanathapuram', 'mode' => 'Bus', 'duration_mins' => 140, 'cost' => 120, 'distance_km' => 115, 'operator' => 'TNSTC Direct Ultra Deluxe', 'notes' => 'Every 15 mins from Mattuthavani Bus Stand.'],
            ['from' => 'Madurai', 'to' => 'Ramanathapuram', 'mode' => 'Cab', 'duration_mins' => 110, 'cost' => 2200, 'distance_km' => 115, 'operator' => 'Temple Express Cabs', 'notes' => 'Direct four-lane highway NH87.'],

            // Madurai <-> Dindigul (Kodaikanal)
            ['from' => 'Madurai', 'to' => 'Dindigul', 'mode' => 'Train', 'duration_mins' => 45, 'cost' => 60, 'distance_km' => 62, 'operator' => 'Intercity Superfast Express', 'notes' => 'Frequent shuttle train connection.'],
            ['from' => 'Madurai', 'to' => 'Dindigul', 'mode' => 'Bus', 'duration_mins' => 60, 'cost' => 65, 'distance_km' => 62, 'operator' => 'TNSTC Express', 'notes' => 'Runs every 10 mins.'],
            ['from' => 'Madurai', 'to' => 'Dindigul', 'mode' => 'Cab', 'duration_mins' => 50, 'cost' => 1100, 'distance_km' => 62, 'operator' => 'Highway Taxi', 'notes' => 'Smooth ride on NH44.'],

            // Chennai <-> Thanjavur
            ['from' => 'Chennai', 'to' => 'Thanjavur', 'mode' => 'Train', 'duration_mins' => 360, 'cost' => 240, 'distance_km' => 350, 'operator' => 'Uzhavan Express (16865)', 'notes' => 'Direct overnight train, arrives early morning for Big Temple visit.'],
            ['from' => 'Chennai', 'to' => 'Thanjavur', 'mode' => 'Bus', 'duration_mins' => 400, 'cost' => 380, 'distance_km' => 340, 'operator' => 'SETC Classic Non-AC / AC', 'notes' => 'Route via Kumbakonam / Vikravandi.'],
            ['from' => 'Chennai', 'to' => 'Thanjavur', 'mode' => 'Cab', 'duration_mins' => 330, 'cost' => 4800, 'distance_km' => 340, 'operator' => 'Heritage Chola Highway Cab', 'notes' => 'Comfortable scenic route.'],

            // Madurai <-> Kanyakumari
            ['from' => 'Madurai', 'to' => 'Kanyakumari', 'mode' => 'Train', 'duration_mins' => 210, 'cost' => 165, 'distance_km' => 240, 'operator' => 'Kanyakumari Superfast Express', 'notes' => 'Direct rail connection via Tirunelveli.'],
            ['from' => 'Madurai', 'to' => 'Kanyakumari', 'mode' => 'Bus', 'duration_mins' => 270, 'cost' => 260, 'distance_km' => 245, 'operator' => 'TNSTC AC Semi-Sleeper', 'notes' => 'Runs via NH44 southern corridor.'],
            ['from' => 'Madurai', 'to' => 'Kanyakumari', 'mode' => 'Cab', 'duration_mins' => 220, 'cost' => 3500, 'distance_km' => 245, 'operator' => 'Cape Comorin Tourist Cabs', 'notes' => 'Fast 4-lane highway with scenic windmill vistas.'],

            // Tiruchirappalli <-> Thanjavur
            ['from' => 'Tiruchirappalli', 'to' => 'Thanjavur', 'mode' => 'Bus', 'duration_mins' => 50, 'cost' => 45, 'distance_km' => 55, 'operator' => 'TNSTC Point-to-Point Shuttle', 'notes' => 'Buses depart every 5 minutes from Central Bus Stand.'],
            ['from' => 'Tiruchirappalli', 'to' => 'Thanjavur', 'mode' => 'Train', 'duration_mins' => 45, 'cost' => 40, 'distance_km' => 50, 'operator' => 'Cholan / Mysore Express', 'notes' => 'Fast rail connection.'],
            ['from' => 'Tiruchirappalli', 'to' => 'Thanjavur', 'mode' => 'Cab', 'duration_mins' => 40, 'cost' => 950, 'distance_km' => 55, 'operator' => 'Delta City Taxi', 'notes' => 'NH83 smooth multilane road.'],

            // Tirunelveli <-> Tenkasi (Courtallam)
            ['from' => 'Tirunelveli', 'to' => 'Tenkasi', 'mode' => 'Bus', 'duration_mins' => 60, 'cost' => 50, 'distance_km' => 53, 'operator' => 'Nellai-Tenkasi Non-stop Bus', 'notes' => 'Runs continuously through the day.'],
            ['from' => 'Tirunelveli', 'to' => 'Tenkasi', 'mode' => 'Train', 'duration_mins' => 55, 'cost' => 35, 'distance_km' => 50, 'operator' => 'Sengottai Passenger & Express', 'notes' => 'Picturesque scenic rail route.'],
            ['from' => 'Tirunelveli', 'to' => 'Tenkasi', 'mode' => 'Cab', 'duration_mins' => 45, 'cost' => 900, 'distance_km' => 53, 'operator' => 'Courtallam Falls Taxi', 'notes' => 'Direct route to Courtallam main falls.'],
        ];

        foreach ($routesData as $r) {
            $from = $districts->get($r['from']);
            $to = $districts->get($r['to']);

            if ($from && $to) {
                // Seed bidirectional routes
                Route::updateOrCreate(
                    [
                        'from_district_id' => $from->id,
                        'to_district_id' => $to->id,
                        'mode' => $r['mode'],
                        'operator' => $r['operator'],
                    ],
                    [
                        'duration_mins' => $r['duration_mins'],
                        'cost' => $r['cost'],
                        'distance_km' => $r['distance_km'],
                        'notes' => $r['notes'],
                    ]
                );

                Route::updateOrCreate(
                    [
                        'from_district_id' => $to->id,
                        'to_district_id' => $from->id,
                        'mode' => $r['mode'],
                        'operator' => $r['operator'],
                    ],
                    [
                        'duration_mins' => $r['duration_mins'],
                        'cost' => $r['cost'],
                        'distance_km' => $r['distance_km'],
                        'notes' => $r['notes'],
                    ]
                );
            }
        }
    }
}
