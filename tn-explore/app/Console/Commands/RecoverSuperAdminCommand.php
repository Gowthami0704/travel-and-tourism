<?php

namespace App\Console\Commands;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class RecoverSuperAdminCommand extends Command
{
    protected $signature = 'admin:recover-super-admin 
                            {email=admin@example.com : Email of the Super Admin account} 
                            {--password= : Optional password (if omitted, a secure random one will be generated)}';

    protected $description = 'Recover or provision the primary Super Administrator account from CLI';

    public function handle(): int
    {
        $email = strtolower(trim($this->argument('email')));
        $password = $this->option('password');

        if (empty($password)) {
            $password = 'AdminPass@' . Str::random(8);
        }

        $admin = User::where('email', $email)->first();

        if ($admin) {
            $admin->password = Hash::make($password);
            $admin->role = 'admin';
            $admin->admin_role = 'super_admin';
            $admin->is_banned = false;
            $admin->save();
            $this->info("Super Admin account [{$email}] was successfully updated.");
        } else {
            $admin = User::create([
                'name' => 'State Super Admin',
                'email' => $email,
                'password' => Hash::make($password),
                'role' => 'admin',
                'admin_role' => 'super_admin',
                'phone' => '+91 94440 00001',
                'is_banned' => false,
            ]);
            $this->info("Super Admin account [{$email}] was successfully created.");
        }

        // Write to audit log
        AuditLog::log(
            'super_admin_recovered_cli',
            'user',
            $admin->id,
            "Super Admin account [{$email}] recovered via artisan CLI command."
        );

        $this->newLine();
        $this->table(
            ['Parameter', 'Value'],
            [
                ['Login Portal URL', url('/admin/login')],
                ['Admin Email', $email],
                ['Admin Password', $password],
                ['Role Level', 'Super Administrator (full access)'],
                ['Timestamp', now()->toDateTimeString()],
            ]
        );

        $this->warn('Keep these credentials safe. Please sign in at ' . url('/admin/login'));
        return 0;
    }
}
