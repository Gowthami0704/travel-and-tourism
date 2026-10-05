<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\District;
use App\Models\User;
use App\Models\Vendor;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        $districts = District::orderBy('name')->get(['id', 'name', 'region']);
        return Inertia::render('Auth/Register', [
            'districts' => $districts,
        ]);
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'role' => 'nullable|in:tourist,vendor',
            'phone' => 'nullable|string|max:20',
            'business_name' => 'required_if:role,vendor|nullable|string|max:255',
            'service_type' => 'required_if:role,vendor|nullable|in:hotel,food,rental_vehicle,tour_package',
            'district_id' => 'required_if:role,vendor|nullable|exists:districts,id',
            'description' => 'nullable|string|max:1000',
        ]);

        $role = $request->input('role', 'tourist');

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $role,
            'phone' => $request->phone,
        ]);

        if ($request->role === 'vendor') {
            Vendor::create([
                'user_id' => $user->id,
                'business_name' => $request->business_name ?? ($request->name . "'s Services"),
                'service_type' => $request->service_type ?? 'tour_package',
                'district_id' => $request->district_id ?? District::first()->id,
                'description' => $request->description ?? 'Newly registered local tourism partner.',
                'status' => 'pending', // Awaiting Admin Approval
                'trust_score' => 0.700,
            ]);
        }

        event(new Registered($user));

        Auth::login($user);

        if ($user->isAdmin()) {
            return redirect()->route('admin.dashboard');
        } elseif ($user->isVendor()) {
            return redirect()->route('vendor.dashboard');
        }

        return redirect()->route('dashboard');
    }
}
