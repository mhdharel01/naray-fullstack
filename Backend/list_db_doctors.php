<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Doctor;

$doctors = Doctor::with(['specialization', 'schedules', 'leaves'])->get();
echo "Total DB Doctors: " . $doctors->count() . "\n";
foreach ($doctors as $d) {
    echo "- [DB ID: {$d->id}] {$d->name} | Poli: " . ($d->specialization->name ?? '-') . " | Schedules: " . $d->schedules->count() . " | Leaves: " . $d->leaves->count() . "\n";
}
