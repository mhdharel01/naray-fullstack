<?php

namespace App\Http\Controllers;

use App\Models\Admin;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AdminAuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $admin = Admin::where('email', $request->email)->first();

        if (!$admin || !Hash::check($request->password, $admin->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid credentials',
                'errors' => [
                    'email' => [
                        'These credentials do not match our records.'
                    ]
                ]
            ], 401);
        }

        // Cek status keaktifan akun
        if (isset($admin->is_active) && !$admin->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Akun Anda dinonaktifkan oleh Administrator. Silakan hubungi Super Admin untuk bantuan.',
                'errors' => [
                    'email' => [
                        'Akun Anda saat ini sedang dinonaktifkan.'
                    ]
                ]
            ], 403);
        }

        // Catat waktu login terakhir
        $admin->last_login_at = now();
        $admin->save();

        $token = $admin->createToken('admin-token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Login successful',
            'data' => [
                'token' => $token,
                'admin' => $admin,
            ]
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logout successful',
            'data' => []
        ]);
    }

    public function me(Request $request)
    {
        return response()->json([
            'success' => true,
            'message' => 'Admin profile retrieved',
            'data' => [
                'admin' => $request->user(),
            ]
        ]);
    }
}