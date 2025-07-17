<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class SuperadminSeeder extends Seeder
{
    public function run(): void
    {
        $superadminRoleId = DB::table('roles')->where('name', 'superadmin')->value('id');
        User::updateOrCreate(
            ['email' => 'superadmin@example.com'],
            [
                'name' => 'Superadmin User',
                'password' => Hash::make('password'),
                'role_id' => $superadminRoleId,
            ]
        );
    }
}
