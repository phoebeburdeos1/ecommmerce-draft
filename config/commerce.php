<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Storefront seller account
    |--------------------------------------------------------------------------
    |
    | Catalog products created from the admin API are attributed to this user
    | (Urban Store). Override with STORE_SELLER_EMAIL in .env if your seeded
    | storefront account uses a different email.
    |
    */
    'store_seller_email' => env('STORE_SELLER_EMAIL', 'seller@example.com'),
];
