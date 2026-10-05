<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\District;
use App\Models\Place;
use App\Models\PlaceImage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminPlaceImageController extends Controller
{
    public function index(Request $request): Response
    {
        $query = PlaceImage::with(['place.district'])->orderBy('created_at', 'desc');

        if ($request->filled('status')) {
            if ($request->status === 'approved') {
                $query->where('is_approved', true);
            } elseif ($request->status === 'pending') {
                $query->where('is_approved', false);
            }
        }

        if ($request->filled('district_id')) {
            $query->whereHas('place', function ($q) use ($request) {
                $q->where('district_id', $request->district_id);
            });
        }

        $images = $query->paginate(24)->withQueryString();
        $districts = District::orderBy('name')->get(['id', 'name']);
        $places = Place::orderBy('name')->get(['id', 'name', 'district_id']);

        return Inertia::render('Admin/PlaceImages/Index', [
            'images' => $images,
            'districts' => $districts,
            'places' => $places,
            'filters' => $request->only(['status', 'district_id']),
            'stats' => [
                'total' => PlaceImage::count(),
                'approved' => PlaceImage::where('is_approved', true)->count(),
                'pending' => PlaceImage::where('is_approved', false)->count(),
            ]
        ]);
    }

    public function approve($id): RedirectResponse
    {
        $image = PlaceImage::with('place')->findOrFail($id);
        $image->update(['is_approved' => true]);

        // If place has no main image_url, set it
        if ($image->place && empty($image->place->image_url)) {
            $image->place->update(['image_url' => $image->url]);
        }

        AuditLog::log(
            'admin_approved_place_image',
            'place_image',
            $image->id,
            "Approved genuine photo for place: {$image->place?->name}"
        );

        return back()->with('success', "Image for '{$image->place?->name}' approved successfully.");
    }

    public function reject($id): RedirectResponse
    {
        $image = PlaceImage::with('place')->findOrFail($id);
        $image->update(['is_approved' => false]);

        AuditLog::log(
            'admin_rejected_place_image',
            'place_image',
            $image->id,
            "Rejected photo for place: {$image->place?->name}"
        );

        return back()->with('success', "Image for '{$image->place?->name}' marked as unapproved.");
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'place_id' => 'required|exists:places,id',
            'url' => 'required|url|max:1000',
            'source' => 'required|string|max:255',
            'credit' => 'nullable|string|max:255',
            'alt_text' => 'nullable|string|max:255',
            'auto_approve' => 'boolean',
        ]);

        $place = Place::findOrFail($request->place_id);

        $image = PlaceImage::create([
            'place_id' => $place->id,
            'url' => $request->url,
            'source' => $request->source,
            'credit' => $request->credit,
            'alt_text' => $request->alt_text ?: "Real photo of {$place->name}",
            'is_approved' => $request->boolean('auto_approve', true),
        ]);

        if (empty($place->image_url) && $image->is_approved) {
            $place->update(['image_url' => $image->url]);
        }

        AuditLog::log(
            'admin_uploaded_place_image',
            'place_image',
            $image->id,
            "Admin added approved photo for place {$place->name}"
        );

        return back()->with('success', "Real photo added for {$place->name} successfully.");
    }

    public function destroy($id): RedirectResponse
    {
        $image = PlaceImage::findOrFail($id);
        $image->delete();

        return back()->with('success', 'Image removed successfully.');
    }
}
