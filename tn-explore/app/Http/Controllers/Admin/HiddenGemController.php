<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\District;
use App\Models\Place;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class HiddenGemController extends Controller
{
    public function index(): Response
    {
        $places = Place::with('district:id,name,region')
            ->orderBy('is_hidden_gem', 'desc')
            ->orderBy('name')
            ->paginate(30);

        $districts = District::orderBy('name')->get(['id', 'name', 'region']);

        return Inertia::render('Admin/HiddenGemManager', [
            'places' => $places,
            'districts' => $districts,
        ]);
    }

    public function toggleGem($id): RedirectResponse
    {
        $place = Place::findOrFail($id);
        $place->update([
            'is_hidden_gem' => !$place->is_hidden_gem,
        ]);

        $status = $place->is_hidden_gem ? 'promoted to Hidden Gem 💎' : 'set to Regular Place 🏛️';
        return back()->with('success', "'{$place->name}' has been {$status}.");
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'district_id' => 'required|exists:districts,id',
            'name' => 'required|string|max:255',
            'category' => 'required|in:temple,beach,heritage,hill_station,park,nature,museum,food,hidden_gem',
            'description' => 'required|string',
            'image_url' => 'nullable|url',
            'is_hidden_gem' => 'boolean',
        ]);

        $place = Place::create([
            'district_id' => $request->district_id,
            'name' => $request->name,
            'category' => $request->category,
            'description' => $request->description,
            'image_url' => $request->image_url,
            'is_hidden_gem' => $request->input('is_hidden_gem', false),
        ]);

        return back()->with('success', "New place '{$place->name}' added successfully.");
    }
}
