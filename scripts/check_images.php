<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$products = App\Models\Product::all();
foreach ($products as $p) {
    $path = __DIR__ . '/../public/' . $p->image;
    $exists = file_exists($path) ? 'EXISTS' : 'MISSING';
    echo $p->id . " | " . $p->name . " | " . $p->image . " | " . $exists . PHP_EOL;
}
