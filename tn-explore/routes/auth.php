<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\ConfirmablePasswordController;
use App\Http\Controllers\Auth\EmailVerificationNotificationController;
use App\Http\Controllers\Auth\EmailVerificationPromptController;
use App\Http\Controllers\Auth\PasswordController;
use App\Http\Controllers\Auth\PasswordResetCodeController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\Auth\VerifyEmailController;
use Illuminate\Support\Facades\Route;

Route::middleware('guest')->group(function () {
    Route::get('register', [RegisteredUserController::class, 'create'])
        ->name('register');

    Route::post('register', [RegisteredUserController::class, 'store']);

    Route::get('login', [AuthenticatedSessionController::class, 'create'])
        ->name('login');

    Route::post('login', [AuthenticatedSessionController::class, 'store']);

    // 6-Digit Password Reset Verification Flow (Tourists, Vendors, Admins)
    Route::get('forgot-password', [PasswordResetCodeController::class, 'show'])
        ->name('password.request');

    Route::post('forgot-password/send-code', [PasswordResetCodeController::class, 'sendCode'])
        ->name('password.send-code');

    Route::post('forgot-password/verify-code', [PasswordResetCodeController::class, 'verifyCode'])
        ->name('password.verify-code');

    Route::post('forgot-password/reset-password', [PasswordResetCodeController::class, 'resetPassword'])
        ->name('password.reset-password');

    // Backward compatibility aliases
    Route::post('forgot-password', [PasswordResetCodeController::class, 'sendCode'])
        ->name('password.email');

    Route::get('reset-password/{token}', [PasswordResetCodeController::class, 'show'])
        ->name('password.reset');

    Route::post('reset-password', [PasswordResetCodeController::class, 'resetPassword'])
        ->name('password.store');
});

Route::middleware('auth')->group(function () {
    Route::get('verify-email', EmailVerificationPromptController::class)
        ->name('verification.notice');

    Route::get('verify-email/{id}/{hash}', VerifyEmailController::class)
        ->middleware(['signed', 'throttle:6,1'])
        ->name('verification.verify');

    Route::post('email/verification-notification', [EmailVerificationNotificationController::class, 'store'])
        ->middleware('throttle:6,1')
        ->name('verification.send');

    Route::get('confirm-password', [ConfirmablePasswordController::class, 'show'])
        ->name('password.confirm');

    Route::post('confirm-password', [ConfirmablePasswordController::class, 'store']);

    Route::put('password', [PasswordController::class, 'update'])->name('password.update');

    Route::post('logout', [AuthenticatedSessionController::class, 'destroy'])
        ->name('logout');
});
