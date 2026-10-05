<?php

use App\Http\Controllers\Admin\AdminAuthController;
use App\Http\Controllers\Admin\AdminBookingController;
use App\Http\Controllers\Admin\AdminCustomTripController;
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
use App\Http\Controllers\Tourist\CustomTripController;
use App\Http\Controllers\Tourist\DistrictController;
use App\Http\Controllers\Tourist\ReviewController;
use App\Http\Controllers\Tourist\TouristDashboardController;
use App\Http\Controllers\Tourist\TripBuilderController;
use App\Http\Controllers\Tourist\TripMatesController;
use App\Http\Controllers\Tourist\VendorProfileController;
use App\Http\Controllers\TripChatController;
use App\Http\Controllers\Vendor\BookingController as VendorBookingController;
use App\Http\Controllers\Vendor\DashboardController as VendorDashboardController;
use App\Http\Controllers\Vendor\ListingController as VendorListingController;
use App\Http\Controllers\Vendor\VendorAuthController;
use App\Http\Controllers\Vendor\VendorProposalController;
use App\Http\Controllers\ResearchController;
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
Route::get('/ai_guide', fn() => redirect('/ai-guide'));
Route::get('/aiguide', fn() => redirect('/ai-guide'));

// Research Paper Comparison Lab & Empirical Benchmarks
Route::get('/research/comparison', [ResearchController::class, 'index'])->name('research.comparison');
Route::get('/research/export-csv', [ResearchController::class, 'exportCsv'])->name('research.exportCsv');

use App\Http\Controllers\Tourist\VehicleController;
use App\Http\Controllers\Tourist\PackageController;
use App\Http\Controllers\Vendor\StudioController as VendorStudioController;
use App\Http\Controllers\Admin\AdminStudioController;

// Public Fleet & Vehicles Discovery
Route::get('/vehicles', [VehicleController::class, 'index'])->name('vehicles.index');
Route::get('/vehicles/{id}', [VehicleController::class, 'show'])->name('vehicles.show');
Route::post('/api/vehicles/{id}/estimate', [VehicleController::class, 'estimate'])->name('vehicles.estimate');

// Public Tour Packages Discovery
Route::get('/packages', [PackageController::class, 'index'])->name('packages.index');
Route::get('/packages/compare', [PackageController::class, 'compare'])->name('packages.compare');
Route::get('/packages/{id}', [PackageController::class, 'show'])->name('packages.show');

// Public In-App Bookings & Reviews
Route::post('/bookings', [BookingController::class, 'store'])->name('bookings.store');
Route::post('/reviews', [ReviewController::class, 'store'])->name('reviews.store');
Route::post('/reviews/{id}/vote', [ReviewController::class, 'vote'])->name('reviews.vote');
Route::post('/reviews/{id}/vendor-reply', [ReviewController::class, 'vendorReply'])->name('reviews.vendorReply');

// Dedicated Vendor Auth Flow
Route::get('/vendor/register', [VendorAuthController::class, 'createRegister'])->name('vendor.register');
Route::post('/vendor/register', [VendorAuthController::class, 'storeRegister'])->name('vendor.register.store');
Route::post('/vendor/send-phone-otp', [VendorAuthController::class, 'sendPhoneOtp'])->name('vendor.sendPhoneOtp');
Route::post('/vendor/verify-phone-otp', [VendorAuthController::class, 'verifyPhoneOtp'])->name('vendor.verifyPhoneOtp');
Route::post('/vendor/send-email-otp', [VendorAuthController::class, 'sendEmailOtp'])->name('vendor.sendEmailOtp');
Route::post('/vendor/verify-email-otp', [VendorAuthController::class, 'verifyEmailOtp'])->name('vendor.verifyEmailOtp');
Route::get('/vendor/login', [VendorAuthController::class, 'createLogin'])->name('vendor.login');
Route::post('/vendor/login', [VendorAuthController::class, 'storeLogin'])->name('vendor.login.store');
Route::get('/vendor/under-review', [VendorAuthController::class, 'underReview'])->name('vendor.under-review');
Route::post('/vendor/kyc/resubmit', [VendorAuthController::class, 'resubmitKyc'])->name('vendor.kyc.resubmit');
Route::post('/vendor/logout', [VendorAuthController::class, 'logout'])->name('vendor.logout');

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

    // Tourist Custom Multi-Region Trips & Proposals
    Route::get('/custom-trips', [CustomTripController::class, 'index'])->name('custom-trips.index');
    Route::get('/custom-trips/create', [CustomTripController::class, 'create'])->name('custom-trips.create');
    Route::post('/custom-trips', [CustomTripController::class, 'store'])->name('custom-trips.store');
    Route::post('/custom-trips/ai-parse', [CustomTripController::class, 'aiParseTrip'])->name('custom-trips.ai-parse');
    Route::post('/custom-trips/generate-plan', [CustomTripController::class, 'generatePlanPreview'])->name('custom-trips.generate-plan');
    Route::post('/custom-trips/ideas/generate', [CustomTripController::class, 'generateIdeas'])->name('custom-trips.ideas.generate');
    Route::post('/custom-trips/ideas/share', [CustomTripController::class, 'shareIdeas'])->name('custom-trips.ideas.share');
    Route::get('/custom-trips/ideas/shared/{token}', [CustomTripController::class, 'viewSharedIdeas'])->name('custom-trips.ideas.shared');
    Route::post('/custom-trips/ideas/shared/{token}/vote', [CustomTripController::class, 'voteIdea'])->name('custom-trips.ideas.vote');
    Route::get('/custom-trips/{id}', [CustomTripController::class, 'show'])->name('custom-trips.show');
    Route::post('/custom-trips/{id}/accept/{proposalId}', [CustomTripController::class, 'acceptProposal'])->name('custom-trips.accept');
    Route::post('/custom-trips/{id}/dismiss/{proposalId}', [CustomTripController::class, 'dismissProposal'])->name('custom-trips.dismiss');

    // Dev Theme Preview (local environment only)
    Route::get('/dev/theme', function () {
        return Inertia\Inertia::render('Dev/ThemePreview');
    })->name('dev.theme');

    // In-App Tourist-Vendor Real-Time Chat
    Route::get('/trip-chats', [TripChatController::class, 'index'])->name('trip-chats.index');
    Route::get('/trip-chats/{id}', [TripChatController::class, 'show'])->name('trip-chats.show');
    Route::post('/trip-chats/{id}/messages', [TripChatController::class, 'sendMessage'])->name('trip-chats.messages.store');
    Route::post('/trip-chats/{id}/quote', [TripChatController::class, 'sendQuoteMessage'])->name('trip-chats.quote.store');
    Route::post('/trip-chats/{id}/accept-quote/{messageId}', [TripChatController::class, 'acceptInChatQuote'])->name('trip-chats.accept-quote');

    // Profile Settings
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::post('/profile/theme', [ProfileController::class, 'updateTheme'])->name('profile.theme');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // ==========================================
    // STAGE 2: COMPLETE ADMIN CONTROL CENTER
    // ==========================================
    Route::middleware([EnsureAdmin::class])->prefix('admin')->name('admin.')->group(function () {
        Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('dashboard');
        
        // 1. Vendor Management
        Route::get('/vendors', [AdminVendorController::class, 'index'])->name('vendors.index');
        Route::get('/vendors/{id}', [AdminVendorController::class, 'show'])->name('vendors.show');
        Route::get('/vendors/{id}/document', [AdminVendorController::class, 'downloadKycDocument'])->name('vendors.document');
        Route::post('/vendors/{id}/status', [AdminVendorController::class, 'updateStatus'])->name('vendors.updateStatus');
        Route::post('/vendors/{id}/kyc', [AdminVendorController::class, 'updateKyc'])->name('vendors.updateKyc');
        Route::post('/vendors/{id}/warn', [AdminVendorController::class, 'sendWarning'])->name('vendors.warn');
        Route::post('/vendors/{id}/credentials', [AdminVendorController::class, 'updateCredentials'])->name('vendors.updateCredentials');
        Route::post('/vendors/{id}/district/{districtId}/approve-primary', [AdminVendorController::class, 'approvePrimaryDistrict'])->name('vendors.approvePrimaryDistrict');
        Route::post('/vendors/{id}/district/{districtId}/revoke-extended', [AdminVendorController::class, 'revokeExtendedDistrict'])->name('vendors.revokeExtendedDistrict');

        // 2. KYC Verification Queue
        Route::get('/kyc', [AdminKycController::class, 'index'])->name('kyc.index');
        Route::get('/kyc/{id}/document', [AdminVendorController::class, 'downloadKycDocument'])->name('kyc.document');
        Route::post('/kyc/{id}/approve', [AdminKycController::class, 'approve'])->name('kyc.approve');
        Route::post('/kyc/{id}/request-changes', [AdminKycController::class, 'requestChanges'])->name('kyc.requestChanges');
        Route::post('/kyc/{id}/reject', [AdminKycController::class, 'reject'])->name('kyc.reject');

        // 3. User Management
        Route::get('/users', [AdminUserController::class, 'index'])->name('users.index');
        Route::post('/users/{id}/toggle-ban', [AdminUserController::class, 'toggleBan'])->name('users.toggleBan');
        Route::post('/users/{id}/warn', [AdminUserController::class, 'sendWarning'])->name('users.warn');

        // 4. Custom Trip Verification & Moderation Queue
        Route::get('/custom-trips', [AdminCustomTripController::class, 'index'])->name('custom-trips.index');
        Route::post('/custom-trips/{id}/verify', [AdminCustomTripController::class, 'verify'])->name('custom-trips.verify');
        Route::post('/custom-trips/{id}/reject', [AdminCustomTripController::class, 'reject'])->name('custom-trips.reject');
        Route::delete('/custom-trips/{id}', [AdminCustomTripController::class, 'destroy'])->name('custom-trips.destroy');

        // 5. Data Management (tourism_data.json)
        Route::get('/data', [AdminDataController::class, 'index'])->name('data.index');
        Route::post('/data', [AdminDataController::class, 'store'])->name('data.store');
        Route::put('/data/{id}', [AdminDataController::class, 'update'])->name('data.update');
        Route::delete('/data/{id}', [AdminDataController::class, 'destroy'])->name('data.destroy');
        Route::get('/data/export/csv', [AdminDataController::class, 'exportCsv'])->name('data.exportCsv');

        // 6. Booking Oversight
        Route::get('/bookings', [AdminBookingController::class, 'index'])->name('bookings.index');
        Route::post('/bookings/{id}/override', [AdminBookingController::class, 'overrideStatus'])->name('bookings.override');

        // 7. Fraud Detection & Anomaly Scanner
        Route::get('/fraud', [AdminFraudController::class, 'index'])->name('fraud.index');
        Route::get('/fraud-review', [AdminFraudController::class, 'index'])->name('fraud.review');
        Route::post('/fraud/scan', [AdminFraudController::class, 'scanVendors'])->name('fraud.scan');
        Route::post('/fraud/{id}/resolve', [AdminFraudController::class, 'resolve'])->name('fraud.resolve');
        Route::post('/fraud/{id}/dismiss', [AdminFraudController::class, 'dismiss'])->name('fraud.dismiss');
        Route::post('/fraud/{id}/warn', [AdminFraudController::class, 'warn'])->name('fraud.warn');
        Route::post('/fraud/{id}/request-info', [AdminFraudController::class, 'requestInfo'])->name('fraud.requestInfo');
        Route::post('/fraud/{id}/suspend', [AdminFraudController::class, 'suspend'])->name('fraud.suspend');
        Route::post('/fraud/vendor/{vendorId}/override', [AdminFraudController::class, 'overrideScore'])->name('fraud.overrideScore');

        // 8. Review Moderation
        Route::get('/reviews', [AdminReviewController::class, 'index'])->name('reviews.index');
        Route::post('/reviews/{id}/status', [AdminReviewController::class, 'updateStatus'])->name('reviews.updateStatus');
        Route::delete('/reviews/{id}', [AdminReviewController::class, 'destroy'])->name('reviews.destroy');

        // 9. Place Real Photos Approval & Management
        Route::get('/place-images', [\App\Http\Controllers\Admin\AdminPlaceImageController::class, 'index'])->name('place-images.index');
        Route::post('/place-images', [\App\Http\Controllers\Admin\AdminPlaceImageController::class, 'store'])->name('place-images.store');
        Route::post('/place-images/{id}/approve', [\App\Http\Controllers\Admin\AdminPlaceImageController::class, 'approve'])->name('place-images.approve');
        Route::post('/place-images/{id}/reject', [\App\Http\Controllers\Admin\AdminPlaceImageController::class, 'reject'])->name('place-images.reject');
        Route::delete('/place-images/{id}', [\App\Http\Controllers\Admin\AdminPlaceImageController::class, 'destroy'])->name('place-images.destroy');

        // 10. Tour Packages & Outside-TN Permits Review
        Route::get('/packages', [\App\Http\Controllers\Admin\AdminPackageController::class, 'index'])->name('packages.index');
        Route::post('/packages/{id}/approve', [\App\Http\Controllers\Admin\AdminPackageController::class, 'approve'])->name('packages.approve');
        Route::post('/packages/{id}/reject', [\App\Http\Controllers\Admin\AdminPackageController::class, 'reject'])->name('packages.reject');

        // 11. District Change Requests
        Route::get('/district-change-requests', [\App\Http\Controllers\Admin\AdminDistrictChangeController::class, 'index'])->name('district-change-requests.index');
        Route::post('/district-change-requests/{id}/approve', [\App\Http\Controllers\Admin\AdminDistrictChangeController::class, 'approve'])->name('district-change-requests.approve');
        Route::post('/district-change-requests/{id}/reject', [\App\Http\Controllers\Admin\AdminDistrictChangeController::class, 'reject'])->name('district-change-requests.reject');

        // 12. Lab LAN System Health & Operations
        Route::get('/system', [\App\Http\Controllers\Admin\AdminSystemController::class, 'index'])->name('system.index');
        Route::post('/system/backup', [\App\Http\Controllers\Admin\AdminSystemController::class, 'triggerBackup'])->name('system.backup');

        // 12. Audit Log (Super Admin)
        Route::get('/audit', [AuditController::class, 'index'])->name('audit.index');

        // 13. Vendor Studio Media & Fleet Moderation Queue
        Route::get('/studio/media', [AdminStudioController::class, 'mediaQueue'])->name('studio.media');
        Route::post('/studio/media/{id}/status', [AdminStudioController::class, 'updateMediaStatus'])->name('studio.media.status');
        Route::get('/studio/fleet', [AdminStudioController::class, 'fleetReview'])->name('studio.fleet');
        Route::post('/studio/fleet/{id}/verify', [AdminStudioController::class, 'verifyVehicle'])->name('studio.fleet.verify');
    });

    // ==========================================
    // STAGE 3: VENDOR PARTNER PORTAL
    // ==========================================
    Route::middleware([EnsureVendor::class])->prefix('vendor')->name('vendor.')->group(function () {
        Route::get('/dashboard', [VendorDashboardController::class, 'index'])->name('dashboard');
        
        // KYC Upload & District Change Request
        Route::post('/kyc/upload', [VendorAuthController::class, 'uploadKyc'])->name('kyc.upload');
        Route::post('/district-change-request', [\App\Http\Controllers\Vendor\DistrictChangeController::class, 'store'])->name('district-change.store');

        // Vendor Studio CMS (Fleet, Gallery, Memories, Packages)
        Route::get('/studio', [VendorStudioController::class, 'index'])->name('studio.index');
        Route::get('/studio/fleet', [VendorStudioController::class, 'fleet'])->name('studio.fleet');
        Route::post('/studio/fleet', [VendorStudioController::class, 'storeVehicle'])->name('studio.fleet.store');
        Route::put('/studio/fleet/{id}', [VendorStudioController::class, 'updateVehicle'])->name('studio.fleet.update');
        Route::delete('/studio/fleet/{id}', [VendorStudioController::class, 'destroyVehicle'])->name('studio.fleet.destroy');
        Route::post('/studio/fleet/{id}/block-dates', [VendorStudioController::class, 'blockDates'])->name('studio.fleet.blockDates');

        Route::get('/studio/gallery', [VendorStudioController::class, 'gallery'])->name('studio.gallery');
        Route::post('/studio/gallery', [VendorStudioController::class, 'uploadMedia'])->name('studio.gallery.upload');
        Route::delete('/studio/gallery/{id}', [VendorStudioController::class, 'deleteMedia'])->name('studio.gallery.delete');

        Route::get('/studio/memories', [VendorStudioController::class, 'memories'])->name('studio.memories');
        Route::post('/studio/memories', [VendorStudioController::class, 'storeMemory'])->name('studio.memories.store');
        Route::post('/studio/packages/{id}/duplicate', [VendorStudioController::class, 'duplicatePackage'])->name('studio.packages.duplicate');

        // Custom Trip Marketplace Opportunities & Bidding
        Route::get('/opportunities', [VendorProposalController::class, 'opportunities'])->name('opportunities.index');
        Route::post('/proposals', [VendorProposalController::class, 'storeProposal'])->name('proposals.store');
        Route::post('/proposals/{id}/withdraw', [VendorProposalController::class, 'withdrawProposal'])->name('proposals.withdraw');

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
    ->where('slug', '^(?!dashboard|listings|bookings|kyc|login|register|opportunities).*$')
    ->name('vendor.profile');

Route::post('/vendor/{slug}/report', [VendorProfileController::class, 'report'])
    ->where('slug', '^(?!dashboard|listings|bookings|kyc|login|register|opportunities).*$')
    ->name('vendor.report');

require __DIR__.'/auth.php';
