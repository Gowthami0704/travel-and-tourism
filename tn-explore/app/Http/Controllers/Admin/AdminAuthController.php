<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class AdminAuthController extends Controller
{
    public function createLogin(): Response
    {
        return Inertia::render('Admin/Auth/Login', [
            'status' => session('status'),
        ]);
    }

    public function storeLogin(Request $request): RedirectResponse
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (Auth::check()) {
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }

        if (Auth::attempt($credentials, $request->boolean('remember'))) {
            $user = Auth::user();

            if (!$user->isAdmin()) {
                Auth::logout();
                return back()->withErrors(['email' => 'Unauthorized. This account does not possess administrator privileges.']);
            }

            if ($user->is_banned) {
                Auth::logout();
                return back()->withErrors(['email' => 'Your administrative account is currently suspended.']);
            }

            $request->session()->regenerate();
            AuditLog::log('admin_login', 'user', $user->id, "Admin logged into system portal as " . ($user->admin_role ?: 'super_admin'));

            return redirect()->route('admin.dashboard');
        }

        return back()->withErrors([
            'email' => 'The provided administrator credentials do not match our records.',
        ])->onlyInput('email');
    }
}
