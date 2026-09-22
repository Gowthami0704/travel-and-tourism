<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\District;
use App\Models\FoodDish;
use App\Models\Place;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AdminDataController extends Controller
{
    private string $jsonPath;
    private string $deletedBackupPath;

    public function __construct()
    {
        $this->jsonPath = base_path('data/tourism_data.json');
        $this->deletedBackupPath = base_path('data/deleted_records.json');
    }

    public function index(Request $request): Response
    {
        $query = Place::with('district');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where('name', 'like', "%{$search}%")
                  ->orWhere('category', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
        }

        if ($request->filled('district_id')) {
            $query->where('district_id', $request->district_id);
        }

        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        $places = $query->orderBy('name')->paginate(25)->withQueryString();
        $districts = District::select('id', 'name')->orderBy('name')->get();
        $categories = Place::select('category')->distinct()->pluck('category')->filter()->values();

        return Inertia::render('Admin/Data/Index', [
            'places' => $places,
            'districts' => $districts,
            'categories' => $categories,
            'filters' => $request->only(['search', 'district_id', 'category']),
            'totalCount' => Place::count(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'district_id' => 'required|exists:districts,id',
            'category' => 'required|string|max:100',
            'description' => 'required|string|max:2500',
            'image_url' => 'nullable|string',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'is_hidden_gem' => 'nullable|boolean',
        ]);

        $place = Place::create([
            'name' => $request->name,
            'district_id' => $request->district_id,
            'category' => $request->category,
            'description' => $request->description,
            'image_url' => $request->image_url ?? 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600',
            'latitude' => $request->latitude ?? 10.0,
            'longitude' => $request->longitude ?? 78.0,
            'is_hidden_gem' => $request->boolean('is_hidden_gem', false),
        ]);

        $this->syncToJson();
        AuditLog::log('place_created', 'place', $place->id, "Created tourist destination: {$place->name}");

        return back()->with('success', "Destination '{$place->name}' added to state dataset and synced!");
    }

    public function update(Request $request, $id): RedirectResponse
    {
        $place = Place::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'required|string|max:100',
            'description' => 'required|string|max:2500',
            'image_url' => 'nullable|string',
            'is_hidden_gem' => 'nullable|boolean',
        ]);

        $place->update($request->only(['name', 'category', 'description', 'image_url', 'latitude', 'longitude', 'is_hidden_gem']));
        $this->syncToJson();

        AuditLog::log('place_updated', 'place', $place->id, "Updated tourist destination: {$place->name}");

        return back()->with('success', "Record '{$place->name}' updated successfully.");
    }

    public function destroy($id): RedirectResponse
    {
        $place = Place::findOrFail($id);
        $deletedRecord = $place->toArray();

        // Soft backup to deleted_records.json
        $this->backupDeletedRecord($deletedRecord);

        $place->delete();
        $this->syncToJson();

        AuditLog::log('place_deleted', 'place', $id, "Deleted place '{$deletedRecord['name']}' (saved to deleted_records.json for recovery)");

        return back()->with('success', "Destination record removed and archived safely.");
    }

    public function exportCsv(): StreamedResponse
    {
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="tn_tourism_data_' . date('Y_m_d_His') . '.csv"',
        ];

        return response()->stream(function () {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['ID', 'District', 'Name', 'Category', 'Description', 'Latitude', 'Longitude', 'Is Hidden Gem', 'Image URL']);

            Place::with('district')->chunk(200, function ($places) use ($handle) {
                foreach ($places as $p) {
                    fputcsv($handle, [
                        $p->id,
                        $p->district?->name ?? '',
                        $p->name,
                        $p->category,
                        $p->description,
                        $p->latitude,
                        $p->longitude,
                        $p->is_hidden_gem ? 'Yes' : 'No',
                        $p->image_url,
                    ]);
                }
            });

            fclose($handle);
        }, 200, $headers);
    }

    private function syncToJson(): void
    {
        try {
            $places = Place::with('district:id,name,region')->get()->map(function ($p) {
                return [
                    'id' => $p->id,
                    'district' => $p->district?->name ?? 'Tamil Nadu',
                    'name' => $p->name,
                    'category' => $p->category,
                    'description' => $p->description,
                    'image_url' => $p->image_url,
                    'coordinates' => ['lat' => $p->latitude, 'lng' => $p->longitude],
                    'is_hidden_gem' => (bool)$p->is_hidden_gem,
                ];
            });

            File::put($this->jsonPath, json_encode($places, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        } catch (\Exception $e) {
            // Log silently
        }
    }

    private function backupDeletedRecord(array $record): void
    {
        try {
            $existing = [];
            if (File::exists($this->deletedBackupPath)) {
                $existing = json_decode(File::get($this->deletedBackupPath), true) ?? [];
            }
            $record['deleted_at'] = date('Y-m-d H:i:s');
            $record['deleted_by'] = auth()->user()?->name ?? 'Admin';
            $existing[] = $record;
            File::put($this->deletedBackupPath, json_encode($existing, JSON_PRETTY_PRINT));
        } catch (\Exception $e) {
        }
    }
}
