<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Role;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get roles
        $customerRole = Role::where('name', 'customer')->first();
        $sellerRole = Role::where('name', 'seller')->first();
        $adminRole = Role::where('name', 'admin')->first();

        // Customer Account
        User::firstOrCreate(
            ['email' => 'customer@example.com'],
            [
                'name' => 'John Doe',
                'email' => 'customer@example.com',
                'password' => bcrypt('password123'),
                'phone' => '+1 (555) 123-4567',
                'address' => '123 Main Street, New York, NY 10001',
                'role_id' => $customerRole->id,
            ]
        );

        // Seller Account
        User::firstOrCreate(
            ['email' => 'seller@example.com'],
            [
                'name' => 'Urban Store',
                'email' => 'seller@example.com',
                'password' => bcrypt('password123'),
                'phone' => '+1 (555) 987-6543',
                'address' => '456 Market Street, San Francisco, CA 94102',
                'role_id' => $sellerRole->id,
            ]
        );

        // Admin Account
        User::firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Admin User',
                'email' => 'admin@example.com',
                'password' => bcrypt('password123'),
                'phone' => '+1 (555) 555-5555',
                'address' => '789 Admin Lane, Los Angeles, CA 90001',
                'role_id' => $adminRole->id,
            ]
        );
    }
}
