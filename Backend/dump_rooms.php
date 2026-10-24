<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(\Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

foreach (\App\Models\RoomType::all() as $r) {
    echo "ID: {$r->id}\n";
    echo "Name: {$r->name}\n";
    echo "Price: {$r->price_per_night}\n";
    echo "Image: {$r->image_url}\n";
    echo "Description:\n{$r->description}\n";
    echo "----------------------------------------\n";
}
