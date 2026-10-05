<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;

$user = User::where('email', '23cy22@ksriet.ac.in')->first();
if ($user) {
    echo "=== USER DIAGNOSTIC FOR 23cy22@ksriet.ac.in ===\n";
    echo "ID: " . $user->id . "\n";
    echo "Name: " . $user->name . "\n";
    echo "Email: " . $user->email . "\n";
    echo "Role: " . $user->role . "\n";
    echo "Admin Role: " . ($user->admin_role ?: 'None') . "\n";
    echo "Is Tourist: " . ($user->isTourist() ? 'Yes' : 'No') . "\n";
    echo "Is Vendor: " . ($user->isVendor() ? 'Yes' : 'No') . "\n";
    echo "Is Admin: " . ($user->isAdmin() ? 'Yes' : 'No') . "\n";
    echo "Is Banned: " . ($user->is_banned ? 'Yes' : 'No') . "\n";
} else {
    echo "NOT_FOUND: 23cy22@ksriet.ac.in does not exist in the database yet.\n";
    echo "Listing existing users in database:\n";
    foreach (User::all() as $u) {
        echo " - [ID {$u->id}] {$u->name} <{$u->email}> (Role: {$u->role})\n";
    }
}
