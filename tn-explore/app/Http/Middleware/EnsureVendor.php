<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureVendor
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user) {
            return redirect()->route('vendor.login');
        }

        if (!$user->isVendor()) {
            return redirect()->route('vendor.login')->with('status', 'Please sign in with a vendor account.');
        }

        $vendor = $user->vendor;

        // Allow under-review and logout routes
        if ($request->routeIs('vendor.under-review') || $request->routeIs('logout')) {
            return $next($request);
        }

        if (!$vendor || $vendor->status !== 'active' || $vendor->kyc_status !== 'verified') {
            if ($vendor && in_array($vendor->status, ['banned', 'suspended'])) {
                $msg = $vendor->status === 'banned'
                    ? 'Your partner account has been deactivated.'
                    : 'Your partner account is temporarily suspended. Please contact the TN Explore administration.';
                Auth::logout();
                $request->session()->invalidate();
                $request->session()->regenerateToken();
                return redirect()->route('vendor.login')->with('status', $msg);
            }

            return redirect()->route('vendor.under-review');
        }

        return $next($request);
    }
}

