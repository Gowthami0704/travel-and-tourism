<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminUserController extends Controller
{
    public function index(Request $request): Response
    {
        $query = User::withCount(['bookings', 'reviews']);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        if ($request->filled('role')) {
            $query->where('role', $request->role);
        }

        if ($request->filled('status')) {
            if ($request->status === 'banned') {
                $query->where('is_banned', true);
            } elseif ($request->status === 'active') {
                $query->where('is_banned', false);
            }
        }

        $users = $query->orderBy('created_at', 'desc')->paginate(20)->withQueryString();

        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
            'filters' => $request->only(['search', 'role', 'status']),
            'isSuperAdmin' => auth()->user()->isSuperAdmin(),
        ]);
    }

    public function toggleBan(Request $request, $id): RedirectResponse
    {
        if (!auth()->user()->isSuperAdmin()) {
            abort(403, 'Only Super Admins can ban or unban accounts.');
        }

        $user = User::findOrFail($id);
        if ($user->isAdmin()) {
            return back()->withErrors(['error' => 'Cannot ban an administrative account.']);
        }

        $newBanState = !$user->is_banned;
        $user->update(['is_banned' => $newBanState]);

        AuditLog::log(
            $newBanState ? 'user_banned' : 'user_unbanned',
            'user',
            $user->id,
            "User account " . ($newBanState ? 'banned' : 'unbanned') . " by Super Admin. Reason: " . ($request->reason ?? 'Policy enforcement')
        );

        return back()->with('success', "User '{$user->name}' is now " . ($newBanState ? 'banned' : 'active') . ".");
    }

    public function sendWarning(Request $request, $id): RedirectResponse
    {
        $user = User::findOrFail($id);
        $request->validate([
            'message' => 'required|string|max:1000',
        ]);

        AuditLog::log(
            'user_warning_sent',
            'user',
            $user->id,
            "Sent warning to user: " . $request->message
        );

        return back()->with('success', "Formal warning sent to {$user->name}.");
    }
}
