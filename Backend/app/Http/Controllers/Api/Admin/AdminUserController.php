<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Admin;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class AdminUserController extends Controller
{
    /**
     * Menampilkan daftar semua akun pengguna admin rumah sakit beserta metriknya.
     */
    public function index(Request $request)
    {
        $query = Admin::query();

        // Pencarian nama, username, atau email
        if ($request->filled('search')) {
            $s = trim($request->search);
            $query->where(function ($q) use ($s) {
                $q->where('name', 'like', "%{$s}%")
                  ->orWhere('username', 'like', "%{$s}%")
                  ->orWhere('email', 'like', "%{$s}%");
            });
        }

        // Filter Role
        if ($request->filled('role') && $request->role !== 'all') {
            $query->where('role', $request->role);
        }

        // Filter Status Aktif
        if ($request->filled('status') && $request->status !== 'all') {
            $isActive = $request->status === 'active' || $request->status === '1';
            $query->where('is_active', $isActive);
        }

        $admins = $query->orderByRaw("CASE WHEN role = 'super_admin' THEN 1 WHEN role = 'admin' THEN 2 ELSE 3 END")
                        ->orderBy('id', 'asc')
                        ->get();

        // Hitung statistik pengguna untuk badge dashboard
        $stats = [
            'total' => Admin::count(),
            'super_admin' => Admin::where('role', Admin::ROLE_SUPER_ADMIN)->count(),
            'operasional' => Admin::where('role', Admin::ROLE_ADMIN)->count(),
            'marketing' => Admin::where('role', Admin::ROLE_MARKETING)->count(),
            'active' => Admin::where('is_active', true)->count(),
            'inactive' => Admin::where('is_active', false)->count(),
        ];

        return response()->json([
            'success' => true,
            'message' => 'Daftar pengguna admin berhasil dimuat.',
            'data' => $admins,
            'stats' => $stats,
        ]);
    }

    /**
     * Menambahkan akun pengguna admin baru.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'username' => [
                'required',
                'string',
                'min:3',
                'max:50',
                'regex:/^[a-zA-Z0-9._-]+$/',
                Rule::unique('admins', 'username')->whereNull('deleted_at'),
            ],
            'email' => ['required', 'email', 'max:255', Rule::unique('admins', 'email')->whereNull('deleted_at')],
            'password' => ['required', 'string', 'min:6'],
            'role' => ['required', Rule::in([Admin::ROLE_SUPER_ADMIN, Admin::ROLE_ADMIN, Admin::ROLE_MARKETING])],
            'is_active' => ['nullable', 'boolean'],
        ], [
            'name.required' => 'Nama lengkap pengguna wajib diisi.',
            'username.required' => 'Username / Nama Pengguna wajib diisi.',
            'username.min' => 'Username minimal terdiri dari 3 karakter.',
            'username.max' => 'Username maksimal 50 karakter.',
            'username.regex' => 'Username hanya boleh huruf, angka, titik (.), strip (-), atau underscore (_).',
            'username.unique' => 'Username ini sudah terdaftar untuk admin lain.',
            'email.required' => 'Alamat email pengguna wajib diisi.',
            'email.email' => 'Format alamat email tidak valid.',
            'email.unique' => 'Alamat email ini sudah terdaftar untuk admin lain.',
            'password.required' => 'Kata sandi awal wajib diisi.',
            'password.min' => 'Kata sandi minimal terdiri dari 6 karakter.',
            'role.required' => 'Peran / Hak akses wajib dipilih.',
            'role.in' => 'Peran yang dipilih tidak valid.',
        ]);

        $admin = Admin::create([
            'name' => trim($validated['name']),
            'username' => strtolower(trim($validated['username'])),
            'email' => strtolower(trim($validated['email'])),
            'password' => $validated['password'], // Model otomatis menggunakan cast 'hashed'
            'role' => $validated['role'],
            'is_active' => $request->has('is_active') ? (bool) $request->is_active : true,
        ]);

        return response()->json([
            'success' => true,
            'message' => "Akun admin {$admin->name} ({$admin->role_label}) berhasil dibuat.",
            'data' => $admin,
        ], 201);
    }

    /**
     * Menampilkan detail satu pengguna admin.
     */
    public function show($id)
    {
        $admin = Admin::findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $admin,
        ]);
    }

    /**
     * Memperbarui profil, role, atau kata sandi pengguna admin.
     */
    public function update(Request $request, $id)
    {
        $admin = Admin::findOrFail($id);
        $currentAuthUser = $request->user();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'username' => [
                'required',
                'string',
                'min:3',
                'max:50',
                'regex:/^[a-zA-Z0-9._-]+$/',
                Rule::unique('admins', 'username')->ignore($admin->id)->whereNull('deleted_at'),
            ],
            'email' => ['required', 'email', 'max:255', Rule::unique('admins', 'email')->ignore($admin->id)->whereNull('deleted_at')],
            'password' => ['nullable', 'string', 'min:6'],
            'role' => ['required', Rule::in([Admin::ROLE_SUPER_ADMIN, Admin::ROLE_ADMIN, Admin::ROLE_MARKETING])],
            'is_active' => ['nullable', 'boolean'],
        ], [
            'name.required' => 'Nama lengkap pengguna wajib diisi.',
            'username.required' => 'Username / Nama Pengguna wajib diisi.',
            'username.min' => 'Username minimal terdiri dari 3 karakter.',
            'username.max' => 'Username maksimal 50 karakter.',
            'username.regex' => 'Username hanya boleh huruf, angka, titik (.), strip (-), atau underscore (_).',
            'username.unique' => 'Username ini sudah dipakai admin lain.',
            'email.required' => 'Alamat email pengguna wajib diisi.',
            'email.unique' => 'Alamat email ini sudah dipakai admin lain.',
            'password.min' => 'Kata sandi baru minimal terdiri dari 6 karakter.',
            'role.required' => 'Peran / Hak akses wajib dipilih.',
        ]);

        // Proteksi: Jangan biarkan Super Admin terakhir menurunkan perannya sendiri
        if ($admin->role === Admin::ROLE_SUPER_ADMIN && $validated['role'] !== Admin::ROLE_SUPER_ADMIN) {
            $otherSuperAdmins = Admin::where('role', Admin::ROLE_SUPER_ADMIN)
                ->where('id', '!=', $admin->id)
                ->where('is_active', true)
                ->count();
            if ($otherSuperAdmins === 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Gagal mengubah peran. Sistem harus memiliki minimal satu Super Admin yang aktif.',
                ], 422);
            }
        }

        // Proteksi: Jangan biarkan Super Admin terakhir dinonaktifkan
        $newActiveStatus = $request->has('is_active') ? (bool) $request->is_active : $admin->is_active;
        if ($admin->role === Admin::ROLE_SUPER_ADMIN && !$newActiveStatus) {
            $otherSuperAdmins = Admin::where('role', Admin::ROLE_SUPER_ADMIN)
                ->where('id', '!=', $admin->id)
                ->where('is_active', true)
                ->count();
            if ($otherSuperAdmins === 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Gagal menonaktifkan akun. Sistem harus memiliki minimal satu Super Admin yang aktif.',
                ], 422);
            }
        }

        $admin->name = trim($validated['name']);
        $admin->username = strtolower(trim($validated['username']));
        $admin->email = strtolower(trim($validated['email']));
        $admin->role = $validated['role'];
        $admin->is_active = $newActiveStatus;

        if (!empty($validated['password'])) {
            $admin->password = $validated['password']; // Disimpan via cast 'hashed'
        }

        $admin->save();

        return response()->json([
            'success' => true,
            'message' => "Data pengguna {$admin->name} berhasil diperbarui.",
            'data' => $admin,
        ]);
    }

    /**
     * Menghapus akun pengguna admin.
     */
    public function destroy(Request $request, $id)
    {
        $admin = Admin::findOrFail($id);
        $currentAuthUser = $request->user();

        // Proteksi 1: Tidak boleh menghapus akun yang sedang dipakai login saat ini
        if ($currentAuthUser && $currentAuthUser->id === $admin->id) {
            return response()->json([
                'success' => false,
                'message' => 'Tindakan ditolak. Anda tidak dapat menghapus akun Anda sendiri yang sedang aktif digunakan.',
            ], 422);
        }

        // Proteksi 2: Tidak boleh menghapus Super Admin terakhir
        if ($admin->role === Admin::ROLE_SUPER_ADMIN) {
            $otherSuperAdmins = Admin::where('role', Admin::ROLE_SUPER_ADMIN)
                ->where('id', '!=', $admin->id)
                ->count();
            if ($otherSuperAdmins === 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tindakan ditolak. Anda tidak dapat menghapus Super Admin satu-satunya di sistem.',
                ], 422);
            }
        }

        $adminName = $admin->name;
        $admin->forceDelete();

        return response()->json([
            'success' => true,
            'message' => "Akun admin {$adminName} berhasil dihapus dari sistem.",
        ]);
    }

    /**
     * Sakelar cepat untuk mengaktifkan / menonaktifkan status akun admin.
     */
    public function toggleStatus(Request $request, $id)
    {
        $admin = Admin::findOrFail($id);
        $currentAuthUser = $request->user();

        // Proteksi: Tidak boleh menonaktifkan diri sendiri
        if ($currentAuthUser && $currentAuthUser->id === $admin->id) {
            return response()->json([
                'success' => false,
                'message' => 'Tindakan ditolak. Anda tidak dapat menonaktifkan akun yang sedang Anda gunakan saat ini.',
            ], 422);
        }

        // Proteksi: Tidak boleh menonaktifkan Super Admin terakhir
        if ($admin->role === Admin::ROLE_SUPER_ADMIN && $admin->is_active) {
            $otherSuperAdmins = Admin::where('role', Admin::ROLE_SUPER_ADMIN)
                ->where('id', '!=', $admin->id)
                ->where('is_active', true)
                ->count();
            if ($otherSuperAdmins === 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tindakan ditolak. Sistem harus memiliki minimal satu Super Admin yang aktif.',
                ], 422);
            }
        }

        $admin->is_active = !$admin->is_active;
        $admin->save();

        $statusText = $admin->is_active ? 'diaktifkan kembali' : 'dinonaktifkan';

        return response()->json([
            'success' => true,
            'message' => "Akun {$admin->name} berhasil {$statusText}.",
            'data' => $admin,
        ]);
    }
}
