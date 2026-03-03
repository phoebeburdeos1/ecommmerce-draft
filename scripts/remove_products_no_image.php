<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Product;

$products = Product::whereNull('image')
    ->orWhere('image', '')
    ->get();

$count = $products->count();
if ($count === 0) {
    echo "No products without images found.\n";
    exit(0);
}

foreach ($products as $p) {
    echo "Deleting: {$p->id} | {$p->name} | slug={$p->slug}\n";
    $p->delete();
}

echo "Deleted {$count} products without images.\n";
