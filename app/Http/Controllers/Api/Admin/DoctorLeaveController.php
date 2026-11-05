<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Doctor;
use App\Models\DoctorLeave;
use Illuminate\Http\Request;
use Carbon\Carbon;

class DoctorLeaveController extends Controller
{
    public function index(Request $request)
    {
        $query = DoctorLeave::with('doctor.specialization');

        if ($request->filled('doctor_id')) {
            $query->where('doctor_id', $request->doctor_id);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter: active_today, upcoming, past
        if ($request->filter === 'active_today') {
            $today = Carbon::today()->toDateString();
            $query->where('status', 'active')
                  ->whereDate('start_date', '<=', $today)
                  ->whereDate('end_date', '>=', $today);
        } elseif ($request->filter === 'upcoming') {
            $today = Carbon::today()->toDateString();
            $query->where('status', 'active')
                  ->whereDate('start_date', '>', $today);
        } elseif ($request->filter === 'past') {
            $today = Carbon::today()->toDateString();
            $query->whereDate('end_date', '<', $today);
        }

        $leaves = $query->orderBy('start_date', 'desc')->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar cuti dokter berhasil diambil',
            'data' => $leaves,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'doctor_id'          => ['required', 'integer', 'exists:doctors,id'],
            'doctor_schedule_id' => ['nullable', 'integer', 'exists:doctor_schedules,id'],
            'start_date'         => ['required', 'date'],
            'end_date'           => ['required', 'date', 'after_or_equal:start_date'],
            'reason'             => ['nullable', 'string', 'max:255'],
            'notes'              => ['nullable', 'string'],
            'status'             => ['nullable', 'in:active,cancelled'],
        ]);

        $validated['status'] = $validated['status'] ?? 'active';

        $leave = DoctorLeave::create($validated);
        $leave->load(['doctor.specialization', 'schedule']);

        return response()->json([
            'success' => true,
            'message' => 'Jadwal cuti dokter berhasil ditambahkan',
            'data'    => $leave,
        ], 201);
    }

    public function show(string $id)
    {
        $leave = DoctorLeave::with('doctor.specialization')->findOrFail($id);

        return response()->json([
            'success' => true,
            'data'    => $leave,
        ]);
    }

    public function update(Request $request, string $id)
    {
        $leave = DoctorLeave::findOrFail($id);

        $validated = $request->validate([
            'doctor_id'  => ['sometimes', 'required', 'integer', 'exists:doctors,id'],
            'start_date' => ['sometimes', 'required', 'date'],
            'end_date'   => ['sometimes', 'required', 'date', 'after_or_equal:start_date'],
            'reason'     => ['nullable', 'string', 'max:255'],
            'notes'      => ['nullable', 'string'],
            'status'     => ['sometimes', 'in:active,cancelled'],
        ]);

        $leave->update($validated);
        $leave->load('doctor.specialization');

        return response()->json([
            'success' => true,
            'message' => 'Jadwal cuti dokter berhasil diperbarui',
            'data'    => $leave,
        ]);
    }

    public function destroy(string $id)
    {
        $leave = DoctorLeave::findOrFail($id);
        $leave->delete();

        return response()->json([
            'success' => true,
            'message' => 'Jadwal cuti dokter berhasil dihapus',
        ]);
    }
}
