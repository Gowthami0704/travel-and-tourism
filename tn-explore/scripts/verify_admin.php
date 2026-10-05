<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Hash;

$admin = User::where('email', 'admin@tnexplore.gov.in')->first();
if (!$admin) {
    $admin = User::create([
        'name' => 'TN Tourism Admin',
        'email' => 'admin@tnexplore.gov.in',
        'password' => Hash::make('password'),
        'role' => 'admin',
        'admin_role' => 'super_admin',
        'phone' => '+91 94440 12345',
    ]);
    echo "Created admin user.\n";
} else {
    $admin->password = Hash::make('password');
    $admin->role = 'admin';
    $admin->admin_role = 'super_admin';
    $admin->save();
    echo "Updated admin user password to 'password' and role to 'admin'.\n";
}

$moderator = User::where('email', 'moderator@tnexplore.gov.in')->first();
if (!$moderator) {
    $moderator = User::create([
        'name' => 'Government Moderator',
        'email' => 'moderator@tnexplore.gov.in',
        'password' => Hash::make('password'),
        'role' => 'admin',
        'admin_role' => 'moderator',
        'phone' => '+91 94440 54321',
    ]);
    echo "Created moderator user.\n";
} else {
    $moderator->password = Hash::make('password');
    $moderator->role = 'admin';
    $moderator->admin_role = 'moderator';
    $moderator->save();
    echo "Updated moderator user password to 'password'.\n";
}

echo "Admin ID: " . $admin->id . " | Role: " . $admin->role . " | isAdmin(): " . ($admin->isAdmin() ? 'YES' : 'NO') . "\n";
