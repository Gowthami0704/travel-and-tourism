<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
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
            return redirect()->route('vendor.login')->with('status', 'You are currently signed in with a non-vendor account. Please sign in below as a Vendor (vendor@tnexplore.com) to access the Vendor Portal.');
        }

        return $next($request);
    }
}
