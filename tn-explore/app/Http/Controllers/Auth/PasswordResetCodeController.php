<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\PasswordResetCode;
use App\Models\User;
use App\Notifications\PasswordChangedNotification;
use App\Notifications\PasswordResetCodeNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class PasswordResetCodeController extends Controller
{
    /**
     * Display the 6-digit code password reset flow.
     */
    public function show(Request $request): Response
    {
        $portal = $request->query('portal', 'tourist');
        if (!in_array($portal, ['tourist', 'vendor', 'admin'])) {
            $portal = 'tourist';
        }

        return Inertia::render('Auth/ForgotPassword', [
            'status' => session('status'),
            'devCode' => session('dev_code'),
            'portal' => $portal,
            'initialEmail' => $request->query('email', ''),
            'isLocal' => app()->environment('local'),
        ]);
    }

    /**
     * Step 1: Send 6-digit verification code to email (Anti-Enumeration).
     */
    public function sendCode(Request $request): JsonResponse|RedirectResponse
    {
        $request->validate([
            'email' => ['required', 'email'],
            'portal' => ['nullable', 'string', 'in:tourist,vendor,admin'],
        ]);

        $email = strtolower(trim($request->email));
        $portal = $request->input('portal', 'tourist');
        $ip = $request->ip();

        // Rate limit per IP and Email (max 5 send requests per 10 minutes)
        $throttleKey = 'send-reset-code:' . Str::transliterate($email . '|' . $ip);
        if (RateLimiter::tooManyAttempts($throttleKey, 5)) {
            $seconds = RateLimiter::availableIn($throttleKey);
            throw ValidationException::withMessages([
                'email' => "Too many verification code requests. Please wait {$seconds} seconds before trying again.",
            ]);
        }
        RateLimiter::hit($throttleKey, 600);

        // Check if there is an existing code with an active 60s cooldown
        $existingCode = PasswordResetCode::where('email', $email)
            ->where('resend_available_at', '>', now())
            ->first();

        if ($existingCode) {
            $remaining = now()->diffInSeconds($existingCode->resend_available_at);
            return response()->json([
                'success' => false,
                'message' => "Please wait {$remaining} seconds before requesting a new code.",
                'resend_wait_seconds' => $remaining,
            ], 429);
        }

        // Generate secure 6-digit code
        $code = sprintf('%06d', random_int(100000, 999999));
        $codeHash = Hash::make($code);
        $expiresAt = now()->addMinutes(10);
        $resendAvailableAt = now()->addSeconds(60);

        // Clean up previous codes for this email
        PasswordResetCode::where('email', $email)->delete();

        // Store new code record
        PasswordResetCode::create([
            'email' => $email,
            'code_hash' => $codeHash,
            'attempts' => 0,
            'expires_at' => $expiresAt,
            'resend_available_at' => $resendAvailableAt,
            'portal' => $portal,
            'ip_address' => $ip,
        ]);

        // Anti-enumeration: Check if user exists before sending actual email,
        // but always return the same generic message to the client.
        $user = User::where('email', $email)->first();
        if ($user) {
            try {
                $user->notify(new PasswordResetCodeNotification($code, 10, $portal));
            } catch (\Throwable $e) {
                Log::error("Failed to deliver reset email to {$email}: " . $e->getMessage());
            }

            if ($user->isAdmin()) {
                AuditLog::log(
                    'admin_password_reset_requested',
                    'user',
                    $user->id,
                    "Admin requested 6-digit password reset code from IP: {$ip}"
                );
            }
        }

        // Always log for local development audit and easy test access
        Log::info("SECURITY_EVENT: 6-Digit Password Reset Code for {$email} ({$portal}): [ {$code} ] (Expires in 10 mins)");

        $genericMessage = "If this email is registered, we have sent a 6-digit verification code to your inbox.";

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => $genericMessage,
                'email' => $email,
                'expires_in_minutes' => 10,
                'resend_wait_seconds' => 60,
                'dev_code' => app()->environment('local') ? $code : null,
            ]);
        }

        return back()->with([
            'status' => $genericMessage,
            'dev_code' => app()->environment('local') ? $code : null,
        ]);
    }

    /**
     * Step 2: Verify the 6-digit code.
     */
    public function verifyCode(Request $request): JsonResponse|RedirectResponse
    {
        $request->validate([
            'email' => ['required', 'email'],
            'code' => ['required', 'string', 'size:6'],
            'portal' => ['nullable', 'string'],
        ]);

        $email = strtolower(trim($request->email));
        $inputCode = trim($request->code);
        $ip = $request->ip();

        // Rate limit verification attempts per IP
        $throttleKey = 'verify-reset-code:' . Str::transliterate($email . '|' . $ip);
        if (RateLimiter::tooManyAttempts($throttleKey, 10)) {
            $seconds = RateLimiter::availableIn($throttleKey);
            throw ValidationException::withMessages([
                'code' => "Too many verification attempts. Please wait {$seconds} seconds.",
            ]);
        }
        RateLimiter::hit($throttleKey, 600);

        $record = PasswordResetCode::where('email', $email)->first();

        if (!$record) {
            throw ValidationException::withMessages([
                'code' => 'No active verification code found for this email. Please request a new code.',
            ]);
        }

        // Check if expired
        if ($record->isExpired()) {
            $record->delete();
            throw ValidationException::withMessages([
                'code' => 'The 6-digit verification code has expired (10-minute limit). Please request a new code.',
            ]);
        }

        // Check attempt count
        if ($record->hasExceededMaxAttempts()) {
            $record->delete();
            throw ValidationException::withMessages([
                'code' => 'Maximum verification attempts exceeded (5). For your security, this code has been revoked. Please request a new code.',
            ]);
        }

        // Verify hashed code
        if (!Hash::check($inputCode, $record->code_hash)) {
            $record->increment('attempts');
            $remaining = 5 - $record->attempts;

            if ($remaining <= 0) {
                $record->delete();
                throw ValidationException::withMessages([
                    'code' => 'Maximum verification attempts exceeded (5). This code has been revoked. Please request a new code.',
                ]);
            }

            throw ValidationException::withMessages([
                'code' => "Invalid verification code. You have {$remaining} attempt(s) remaining.",
            ]);
        }

        // Code matched! Issue short-lived 15-minute reset token
        $resetToken = Str::random(64);
        $record->update([
            'verified_at' => now(),
            'reset_token' => $resetToken,
            'reset_token_expires_at' => now()->addMinutes(15),
            'code_hash' => Hash::make(Str::random(32)), // Invalidate original code to ensure single-use
        ]);

        RateLimiter::clear($throttleKey);

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Verification code confirmed. Please set your new password.',
                'reset_token' => $resetToken,
            ]);
        }

        return back()->with([
            'status' => 'Verification code confirmed. Please set your new password.',
            'reset_token' => $resetToken,
        ]);
    }

    /**
     * Step 3: Set new password and invalidate other sessions.
     */
    public function resetPassword(Request $request): JsonResponse|RedirectResponse
    {
        $request->validate([
            'email' => ['required', 'email'],
            'token' => ['required', 'string'],
            'password' => ['required', 'confirmed', Password::min(8)->letters()->mixedCase()->numbers()],
            'portal' => ['nullable', 'string', 'in:tourist,vendor,admin'],
        ]);

        $email = strtolower(trim($request->email));
        $token = $request->token;
        $ip = $request->ip();

        $record = PasswordResetCode::where('email', $email)
            ->where('reset_token', $token)
            ->first();

        if (!$record || $record->isResetTokenExpired()) {
            if ($record) {
                $record->delete();
            }
            throw ValidationException::withMessages([
                'token' => 'Your password reset authorization has expired (15-minute limit). Please start over.',
            ]);
        }

        $user = User::where('email', $email)->first();

        if ($user) {
            // Update password
            $user->password = Hash::make($request->password);
            $user->setRememberToken(Str::random(60));
            $user->save();

            // Invalidate other sessions
            try {
                DB::table('sessions')->where('user_id', $user->id)->delete();
            } catch (\Throwable $e) {
                Log::warning("Could not clear sessions table for user {$user->id}: " . $e->getMessage());
            }

            // Security audit for Admin role
            if ($user->isAdmin()) {
                AuditLog::log(
                    'admin_password_reset_success',
                    'user',
                    $user->id,
                    "Admin password successfully updated via 6-digit OTP verification from IP: {$ip}"
                );

                // Alert other super admins
                $otherAdmins = User::whereIn('role', ['admin', 'super_admin'])
                    ->where('id', '!=', $user->id)
                    ->get();

                foreach ($otherAdmins as $otherAdmin) {
                    Log::warning("ALERT_SUPER_ADMIN: Admin {$user->email} password was reset at " . now()->toIso8601String() . " from IP {$ip}. Notifying {$otherAdmin->email}");
                }
            }

            // Send confirmation email
            try {
                $user->notify(new PasswordChangedNotification($ip, now()->format('d M Y, h:i A T')));
            } catch (\Throwable $e) {
                Log::error("Failed to send password changed confirmation to {$email}: " . $e->getMessage());
            }
        }

        // Delete used reset record
        $record->delete();

        // Determine destination login portal based on user's actual role
        $targetRoute = 'login';
        $portalLabel = 'Tourist Portal';

        if ($user) {
            if ($user->isAdmin()) {
                $targetRoute = 'admin.login';
                $portalLabel = 'Admin Control Center';
            } elseif ($user->isVendor()) {
                $targetRoute = 'vendor.login';
                $portalLabel = 'Vendor Partner Hub';
            }
        }

        $successMessage = "Your password has been successfully reset! Please sign in below to your {$portalLabel}.";

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => $successMessage,
                'redirect_url' => route($targetRoute),
            ]);
        }

        return redirect()->route($targetRoute)->with('status', $successMessage);
    }
}
