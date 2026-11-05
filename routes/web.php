<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// Fallback universal untuk menyajikan berkas storage pada Windows / symlink-free environment
Route::get('/storage/{path}', function ($path) {
    $publicPath = public_path('storage/' . $path);
    if (file_exists($publicPath) && is_file($publicPath)) {
        return response()->file($publicPath);
    }
    $appPublicPath = storage_path('app/public/' . $path);
    if (file_exists($appPublicPath) && is_file($appPublicPath)) {
        return response()->file($appPublicPath);
    }
    abort(404);
})->where('path', '.*');
