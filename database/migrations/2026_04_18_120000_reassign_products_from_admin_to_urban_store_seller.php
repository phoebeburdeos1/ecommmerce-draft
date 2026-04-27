<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Products created via the admin API used seller_id = admin user.
     * Reassign those rows to the Urban Store account (STORE_SELLER_EMAIL / seller@example.com).
     */
    public function up(): void
    {
        $storeEmail = env('STORE_SELLER_EMAIL', 'seller@example.com');
        $storeId = DB::table('users')->where('email', $storeEmail)->value('id');
        if (!$storeId) {
            return;
        }

        $adminId = DB::table('users')->where('email', 'admin@example.com')->value('id');
        if ($adminId && (int) $adminId !== (int) $storeId) {
            DB::table('products')->where('seller_id', $adminId)->update(['seller_id' => $storeId]);
        }
    }

    public function down(): void
    {
        //
    }
};
