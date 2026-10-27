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
            'password' => ['required', 'string'],
        ]);

        $identifier = trim(
            $request->input('username') 
            ?? $request->input('login') 
            ?? $request->input('email') 
            ?? ''
        );

        if (empty($identifier)) {
            return response()->json([
                'success' => false,
                'message' => 'Username atau email wajib diisi.',
                'errors' => [
                    'username' => ['Username atau email wajib diisi.']
                ]
            ], 422);
        }

        // Cari akun admin berdasarkan username, email, atau nama lengkap (case-insensitive)
        $cleanIdentifier = strtolower($identifier);
        $admin = Admin::where('username', $identifier)
            ->orWhereRaw('LOWER(username) = ?', [$cleanIdentifier])
            ->orWhere('email', $identifier)
            ->orWhereRaw('LOWER(email) = ?', [$cleanIdentifier])
            ->orWhere('name', $identifier)
            ->orWhereRaw('LOWER(name) = ?', [$cleanIdentifier])
            ->first();

        // Fallback shortcut jika pengguna mengetik 'admin' atau 'superadmin'
        if (!$admin && in_array(strtolower($identifier), ['admin', 'superadmin'])) {
            $admin = Admin::where('role', Admin::ROLE_SUPER_ADMIN)->first();
        }

        if (!$admin || !Hash::check($request->password, $admin->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Username/email atau kata sandi tidak sesuai.',
                'errors' => [
                    'username' => [
                        'Kredensial yang dimasukkan tidak cocok dengan data admin kami.'
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