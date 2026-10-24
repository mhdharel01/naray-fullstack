<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  ...$roles
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Sesi login tidak valid atau telah kedaluwarsa. Silakan masuk kembali.',
            ], 401);
        }

        // Pastikan akun admin aktif
        if (isset($user->is_active) && !$user->is_active) {
            if (method_exists($user, 'currentAccessToken') && $user->currentAccessToken()) {
                $user->currentAccessToken()->delete();
            }
            return response()->json([
                'success' => false,
                'message' => 'Akun Anda dinonaktifkan oleh Administrator.',
            ], 403);
        }

        // Super admin selalu diizinkan mengakses semua modul
        if (method_exists($user, 'isSuperAdmin') && $user->isSuperAdmin()) {
            return $next($request);
        }

        // Jika tidak ada batasan role spesifik, lanjutkan
        if (empty($roles)) {
            return $next($request);
        }

        // Normalisasi list roles yang diperbolehkan
        $allowedRoles = [];
        foreach ($roles as $r) {
            foreach (explode(',', $r) as $part) {
                $trimmed = trim($part);
                if ($trimmed) {
                    $allowedRoles[] = $trimmed;
                }
            }
        }

        $userRole = $user->role ?? 'admin';

        if (!in_array($userRole, $allowedRoles, true)) {
            $roleLabel = method_exists($user, 'getRoleLabelAttribute') ? $user->role_label : $userRole;
            return response()->json([
                'success' => false,
                'message' => "Akses ditolak. Wewenang peran Anda ({$roleLabel}) tidak mencakup tindakan atau halaman ini.",
            ], 403);
        }

        return $next($request);
    }
}
