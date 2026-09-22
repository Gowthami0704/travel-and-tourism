<?php

use App\Http\Controllers\Admin\AdminAuthController;
use App\Http\Controllers\Admin\AdminBookingController;
use App\Http\Controllers\Admin\AdminDataController;
use App\Http\Controllers\Admin\AdminKycController;
use App\Http\Controllers\Admin\AdminReviewController;
use App\Http\Controllers\Admin\AdminUserController;
use App\Http\Controllers\Admin\AdminVendorController;
use App\Http\Controllers\Admin\AuditController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\FraudController as AdminFraudController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Tourist\AiGuideController;
use App\Http\Controllers\Tourist\BookingController;
use App\Http\Controllers\Tourist\DistrictController;
use App\Http\Controllers\Tourist\ReviewController;
use App\Http\Controllers\Tourist\TouristDashboardController;
use App\Http\Controllers\Tourist\TripBuilderController;
use App\Http\Controllers\Tourist\TripMatesController;
use App\Http\Controllers\Tourist\VendorProfileController;
use App\Http\Controllers\Vendor\BookingController as VendorBookingController;
use App\Http\Controllers\Vendor\DashboardController as VendorDashboardController;
use App\Http\Controllers\Vendor\ListingController as VendorListingController;
use App\Http\Controllers\Vendor\VendorAuthController;
use App\Http\Middleware\EnsureAdmin;
use App\Http\Middleware\EnsureVendor;
use Illuminate\Support\Facades\Route;

// Tourist Public Discovery Routes
Route::get('/', [DistrictController::class, 'index'])->name('home');
Route::get('/district/{id}', [DistrictController::class, 'show'])->name('district.show');
Route::get('/trip-builder', [TripBuilderController::class, 'index'])->name('trip-builder');
Route::get('/budget-calculator', [TripBuilderController::class, 'index'])->name('budget-calculator');
Route::get('/trip-mates', [TripMatesController::class, 'index'])->name('trip-mates');
Route::get('/ai-guide', [AiGuideController::class, 'index'])->name('ai-guide');

// Public In-App Bookings & Reviews
Route::post('/bookings', [BookingController::class, 'store'])->name('bookings.store');
Route::post('/reviews', [ReviewController::class, 'store'])->name('reviews.store');
Route::post('/reviews/{id}/vote', [ReviewController::class, 'vote'])->name('reviews.vote');
Route::post('/reviews/{id}/vendor-reply', [ReviewController::class, 'vendorReply'])->name('reviews.vendorReply');

// Dedicated Vendor Auth Flow
Route::get('/vendor/register', [VendorAuthController::class, 'createRegister'])->name('vendor.register');
Route::post('/vendor/register', [VendorAuthController::class, 'storeRegister'])->name('vendor.register.store');
Route::get('/vendor/login', [VendorAuthController::class, 'createLogin'])->name('vendor.login');
Route::post('/vendor/login', [VendorAuthController::class, 'storeLogin'])->name('vendor.login.store');

// Dedicated Admin Login
Route::get('/admin/login', [AdminAuthController::class, 'createLogin'])->name('admin.login');
Route::post('/admin/login', [AdminAuthController::class, 'storeLogin'])->name('admin.login.store');

// AI Proxy Chat Endpoint
Route::match(['get', 'post'], '/api/ai/chat', [AiGuideController::class, 'chat'])->name('api.ai.chat');
Route::post('/ai/chat', [AiGuideController::class, 'chat'])->name('ai.chat');

// Authenticated Routes
Route::middleware(['auth'])->group(function () {
    // Tourist Hub
    Route::get('/dashboard', [TouristDashboardController::class, 'index'])->name('dashboard');

    // Profile Settings
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // ==========================================
    // STAGE 2: COMPLETE ADMIN CONTROL CENTER
    // ==========================================
    Route::middleware([EnsureAdmin::class])->prefix('admin')->name('admin.')->group(function () {
        Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('dashboard');
        
        // 1. Vendor Management
        Route::get('/vendors', [AdminVendorController::class, 'index'])->name('vendors.index');
        Route::get('/vendors/{id}', [AdminVendorController::class, 'show'])->name('vendors.show');
        Route::post('/vendors/{id}/status', [AdminVendorController::class, 'updateStatus'])->name('vendors.updateStatus');
        Route::post('/vendors/{id}/kyc', [AdminVendorController::class, 'updateKyc'])->name('vendors.updateKyc');
        Route::post('/vendors/{id}/warn', [AdminVendorController::class, 'sendWarning'])->name('vendors.warn');

        // 2. KYC Verification Queue
        Route::get('/kyc', [AdminKycController::class, 'index'])->name('kyc.index');
        Route::post('/kyc/{id}/approve', [AdminKycController::class, 'approve'])->name('kyc.approve');
        Route::post('/kyc/{id}/reject', [AdminKycController::class, 'reject'])->name('kyc.reject');

        // 3. User Management
        Route::get('/users', [AdminUserController::class, 'index'])->name('users.index');
        Route::post('/users/{id}/toggle-ban', [AdminUserController::class, 'toggleBan'])->name('users.toggleBan');
        Route::post('/users/{id}/warn', [AdminUserController::class, 'sendWarning'])->name('users.warn');

        // 4. Data Management (tourism_data.json)
        Route::get('/data', [AdminDataController::class, 'index'])->name('data.index');
        Route::post('/data', [AdminDataController::class, 'store'])->name('data.store');
        Route::put('/data/{id}', [AdminDataController::class, 'update'])->name('data.update');
        Route::delete('/data/{id}', [AdminDataController::class, 'destroy'])->name('data.destroy');
        Route::get('/data/export/csv', [AdminDataController::class, 'exportCsv'])->name('data.exportCsv');

        // 5. Booking Oversight
        Route::get('/bookings', [AdminBookingController::class, 'index'])->name('bookings.index');
        Route::post('/bookings/{id}/override', [AdminBookingController::class, 'overrideStatus'])->name('bookings.override');

        // 6. Fraud Detection & Anomaly Scanner
        Route::get('/fraud', [AdminFraudController::class, 'index'])->name('fraud.index');
        Route::get('/fraud-review', [AdminFraudController::class, 'index'])->name('fraud.review');
        Route::post('/fraud/scan', [AdminFraudController::class, 'scanVendors'])->name('fraud.scan');
        Route::post('/fraud/{id}/resolve', [AdminFraudController::class, 'resolve'])->name('fraud.resolve');
        Route::post('/fraud/vendor/{vendorId}/override', [AdminFraudController::class, 'overrideScore'])->name('fraud.overrideScore');

        // 7. Review Moderation
        Route::get('/reviews', [AdminReviewController::class, 'index'])->name('reviews.index');
        Route::post('/reviews/{id}/status', [AdminReviewController::class, 'updateStatus'])->name('reviews.updateStatus');
        Route::delete('/reviews/{id}', [AdminReviewController::class, 'destroy'])->name('reviews.destroy');

        // 8. Audit Log (Super Admin)
        Route::get('/audit', [AuditController::class, 'index'])->name('audit.index');
    });

    // ==========================================
    // STAGE 3: VENDOR PARTNER PORTAL
    // ==========================================
    Route::middleware([EnsureVendor::class])->prefix('vendor')->name('vendor.')->group(function () {
        Route::get('/dashboard', [VendorDashboardController::class, 'index'])->name('dashboard');
        
        // KYC Upload
        Route::post('/kyc/upload', [VendorAuthController::class, 'uploadKyc'])->name('kyc.upload');

        // Listing CRUD
        Route::get('/listings', [VendorListingController::class, 'index'])->name('listings.index');
        Route::post('/listings', [VendorListingController::class, 'store'])->name('listings.store');
        Route::put('/listings/{id}', [VendorListingController::class, 'update'])->name('listings.update');
        Route::post('/listings/{id}/toggle-status', [VendorListingController::class, 'toggleStatus'])->name('listings.toggleStatus');
        Route::delete('/listings/{id}', [VendorListingController::class, 'destroy'])->name('listings.destroy');

        // Bookings Management
        Route::get('/bookings', [VendorBookingController::class, 'index'])->name('bookings.index');
        Route::post('/bookings/{id}/status', [VendorBookingController::class, 'updateStatus'])->name('bookings.updateStatus');
    });
});

// Public Vendor Profile Page (/vendor/:slug) - placed after static vendor portal routes
Route::get('/vendor/{slug}', [VendorProfileController::class, 'show'])
    ->where('slug', '^(?!dashboard|listings|bookings|kyc|login|register).*$')
    ->name('vendor.profile');

require __DIR__.'/auth.php';
