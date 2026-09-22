<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user) {
            return redirect()->route('admin.login');
        }

        if (!$user->isAdmin()) {
            return redirect()->route('admin.login')->with('status', 'You are currently signed in with a non-admin account. Please sign in below as an Administrator (admin@tnexplore.gov.in) to access the Admin Control Center.');
        }

        return $next($request);
    }
}
