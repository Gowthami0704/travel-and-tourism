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
            if ($request->expectsJson() || $request->is('*/document*')) {
                abort(403, 'Unauthorized access to administrative KYC documents.');
            }
            return redirect()->route('admin.login');
        }

        if (!$user->isAdmin()) {
            if ($request->expectsJson() || $request->is('*/document*')) {
                abort(403, 'Unauthorized. Administrative credentials required to inspect KYC records.');
            }
            return redirect()->route('admin.login')->with('status', 'You are currently signed in with a non-admin account. Please sign in below as an Administrator to access the Admin Control Center.');
        }

        return $next($request);
    }
}
