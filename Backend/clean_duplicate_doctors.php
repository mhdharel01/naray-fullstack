<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Doctor;

// If both Dalimunthe and Dalmunthe exist, standardize to Dalimunthe and delete duplicate
$d11 = Doctor::find(11);
$d24 = Doctor::find(24);
if ($d11 && $d24) {
    // Keep 11, delete 24
    $d24->forceDelete();
    echo "Removed duplicate ID 24 (dr. Sofyan Dalmunthe), keeping ID 11\n";
}

// Asril Tanjung: ID 14 (Sp.N) vs ID 34 (Sp.S). Standardize to ID 14
$d14 = Doctor::find(14);
$d34 = Doctor::find(34);
if ($d14 && $d34) {
    $d34->forceDelete();
    echo "Removed duplicate ID 34 (dr. Asril Tanjung Sp.S), keeping ID 14\n";
}

echo "Clean total doctors: " . Doctor::count() . "\n";
