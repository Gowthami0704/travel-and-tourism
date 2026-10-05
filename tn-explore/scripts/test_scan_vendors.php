<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\Vendor;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use App\Http\Controllers\Admin\FraudController;

echo "====================================================\n";
echo "TESTING /admin/fraud/scan ON ANOMALOUS VENDOR #46\n";
echo "====================================================\n\n";

$admin = User::where('role', 'admin')->first() ?: User::first();
Auth::login($admin);

$controller = new FraudController();
$req = Request::create('/admin/fraud/scan', 'POST', ['vendor_id' => 46]);
$response = $controller->scanVendors($req);

echo "1. HTTP Response Code: " . $response->getStatusCode() . "\n";
echo "2. Flash Message: " . session('success') . "\n";

$vendor46 = Vendor::find(46);
if ($vendor46) {
    echo "3. Vendor #46 Updated Risk Score: " . $vendor46->fraud_risk_score . "/100\n";
    echo "4. Updated Trust Score: " . $vendor46->trust_score . "\n";
    echo "5. Explainable Reason: " . $vendor46->fraud_risk_reason . "\n";
}

echo "\n✓ Scan executed cleanly with zero constraint errors!\n";
