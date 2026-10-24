<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Doctor;
use App\Models\DoctorSchedule;
use App\Models\Poliklinik;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class DoctorScheduleController extends Controller
{
    public function index(Request $request)
    {
        $query = DoctorSchedule::with([
            'doctor',
            'branch',
            'poliklinik',
        ]);

        if ($request->filled('doctor_id')) {
            $query->where('doctor_id', $request->doctor_id);
        }

        if ($request->filled('branch_id')) {
            $query->where('branch_id', $request->branch_id);
        }

        if ($request->filled('poliklinik_id')) {
            $query->where('poliklinik_id', $request->poliklinik_id);
        }

        if ($request->filled('day_of_week')) {
            $query->where('day_of_week', $request->day_of_week);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $schedules = $query
            ->orderBy('day_of_week')
            ->orderBy('start_time')
            ->paginate(15);

        return response()->json([
            'success' => true,
            'message' => 'Data jadwal dokter berhasil diambil',
            'data' => $schedules,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'doctor_id' => [
                'required',
                'integer',
                'exists:doctors,id',
            ],
            'branch_id' => [
                'nullable',
                'integer',
                'exists:branches,id',
            ],
            'poliklinik_id' => [
                'nullable',
                'integer',
                'exists:polikliniks,id',
            ],
            'day_of_week' => [
                'required',
                'integer',
                'between:0,6',
            ],
            'start_time' => [
                'required',
                'date_format:H:i',
            ],
            'end_time' => [
                'required',
                'date_format:H:i',
            ],
            'status' => [
                'required',
                Rule::in(['active', 'inactive']),
            ],
        ]);

        $doctor = Doctor::findOrFail($validated['doctor_id']);

        if ($doctor->status !== 'active') {
            return response()->json([
                'success' => false,
                'message' => 'Dokter tidak aktif sehingga tidak dapat diberi jadwal',
                'data' => null,
            ], 422);
        }

        if ($validated['start_time'] >= $validated['end_time']) {
            return response()->json([
                'success' => false,
                'message' => 'Jam mulai harus lebih awal dari jam selesai',
                'data' => null,
            ], 422);
        }

        $branchId = $validated['branch_id'] ?? null;
        $poliklinikId = $validated['poliklinik_id'] ?? null;

        if (
            $doctor->branch_id !== null &&
            $branchId !== null &&
            (int) $doctor->branch_id !== (int) $branchId
        ) {
            return response()->json([
                'success' => false,
                'message' => 'Cabang jadwal tidak sesuai dengan cabang dokter',
                'data' => null,
            ], 422);
        }

        if ($poliklinikId !== null) {
            $connected = $doctor->polikliniks()
                ->where('polikliniks.id', $poliklinikId)
                ->exists();

            if (!$connected) {
                // Hubungkan dokter dengan poliklinik secara otomatis agar jadwal dapat disimpan tanpa hambatan
                $doctor->polikliniks()->syncWithoutDetaching([$poliklinikId]);
            }

            $poliklinik = Poliklinik::find($poliklinikId);

            if (
                $poliklinik &&
                $poliklinik->branch_id !== null &&
                $branchId !== null &&
                (int) $poliklinik->branch_id !== (int) $branchId
            ) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cabang poliklinik tidak sesuai dengan cabang jadwal',
                    'data' => null,
                ], 422);
            }
        }

        $conflict = $this->hasScheduleConflict(
            $validated['doctor_id'],
            $branchId,
            $poliklinikId,
            $validated['day_of_week'],
            $validated['start_time'],
            $validated['end_time']
        );

        if ($conflict) {
            return response()->json([
                'success' => false,
                'message' => 'Jadwal dokter bentrok dengan jadwal yang sudah ada',
                'data' => null,
            ], 422);
        }

        $schedule = DoctorSchedule::create([
            'doctor_id' => $validated['doctor_id'],
            'branch_id' => $branchId,
            'poliklinik_id' => $poliklinikId,
            'day_of_week' => $validated['day_of_week'],
            'start_time' => $validated['start_time'],
            'end_time' => $validated['end_time'],
            'status' => $validated['status'],
        ]);

        $schedule->load([
            'doctor',
            'branch',
            'poliklinik',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Jadwal dokter berhasil ditambahkan',
            'data' => $schedule,
        ], 201);
    }

    public function show($id)
    {
        $schedule = DoctorSchedule::with([
            'doctor',
            'branch',
            'poliklinik',
        ])->findOrFail($id);

        return response()->json([
            'success' => true,
            'message' => 'Detail jadwal dokter berhasil diambil',
            'data' => $schedule,
        ]);
    }

    public function update(Request $request, $id)
    {
        $schedule = DoctorSchedule::findOrFail($id);

        $validated = $request->validate([
            'doctor_id' => [
                'sometimes',
                'required',
                'integer',
                'exists:doctors,id',
            ],
            'branch_id' => [
                'sometimes',
                'nullable',
                'integer',
                'exists:branches,id',
            ],
            'poliklinik_id' => [
                'sometimes',
                'nullable',
                'integer',
                'exists:polikliniks,id',
            ],
            'day_of_week' => [
                'sometimes',
                'required',
                'integer',
                'between:0,6',
            ],
            'start_time' => [
                'sometimes',
                'required',
                'date_format:H:i',
            ],
            'end_time' => [
                'sometimes',
                'required',
                'date_format:H:i',
            ],
            'status' => [
                'sometimes',
                'required',
                Rule::in(['active', 'inactive']),
            ],
        ]);

        $doctorId = array_key_exists('doctor_id', $validated)
            ? $validated['doctor_id']
            : $schedule->doctor_id;

        $branchId = array_key_exists('branch_id', $validated)
            ? $validated['branch_id']
            : $schedule->branch_id;

        $poliklinikId = array_key_exists('poliklinik_id', $validated)
            ? $validated['poliklinik_id']
            : $schedule->poliklinik_id;

        $dayOfWeek = array_key_exists('day_of_week', $validated)
            ? $validated['day_of_week']
            : $schedule->day_of_week;

        $startTime = array_key_exists('start_time', $validated)
            ? $validated['start_time']
            : substr($schedule->start_time, 0, 5);

        $endTime = array_key_exists('end_time', $validated)
            ? $validated['end_time']
            : substr($schedule->end_time, 0, 5);

        $status = array_key_exists('status', $validated)
            ? $validated['status']
            : $schedule->status;

        $doctor = Doctor::findOrFail($doctorId);

        if ($doctor->status !== 'active' && $status === 'active') {
            return response()->json([
                'success' => false,
                'message' => 'Dokter tidak aktif sehingga jadwal tidak dapat diaktifkan',
                'data' => null,
            ], 422);
        }

        if ($startTime >= $endTime) {
            return response()->json([
                'success' => false,
                'message' => 'Jam mulai harus lebih awal dari jam selesai',
                'data' => null,
            ], 422);
        }

        if (
            $doctor->branch_id !== null &&
            $branchId !== null &&
            (int) $doctor->branch_id !== (int) $branchId
        ) {
            return response()->json([
                'success' => false,
                'message' => 'Cabang jadwal tidak sesuai dengan cabang dokter',
                'data' => null,
            ], 422);
        }

        if ($poliklinikId !== null) {
            $connected = $doctor->polikliniks()
                ->where('polikliniks.id', $poliklinikId)
                ->exists();

            if (!$connected) {
                // Hubungkan dokter dengan poliklinik secara otomatis agar jadwal dapat disimpan tanpa hambatan
                $doctor->polikliniks()->syncWithoutDetaching([$poliklinikId]);
            }

            $poliklinik = Poliklinik::find($poliklinikId);

            if (
                $poliklinik &&
                $poliklinik->branch_id !== null &&
                $branchId !== null &&
                (int) $poliklinik->branch_id !== (int) $branchId
            ) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cabang poliklinik tidak sesuai dengan cabang jadwal',
                    'data' => null,
                ], 422);
            }
        }

        $conflict = $this->hasScheduleConflict(
            $doctorId,
            $branchId,
            $poliklinikId,
            $dayOfWeek,
            $startTime,
            $endTime,
            $schedule->id
        );

        if ($conflict) {
            return response()->json([
                'success' => false,
                'message' => 'Jadwal dokter bentrok dengan jadwal yang sudah ada',
                'data' => null,
            ], 422);
        }

        $schedule->update([
            'doctor_id' => $doctorId,
            'branch_id' => $branchId,
            'poliklinik_id' => $poliklinikId,
            'day_of_week' => $dayOfWeek,
            'start_time' => $startTime,
            'end_time' => $endTime,
            'status' => $status,
        ]);

        $schedule->load([
            'doctor',
            'branch',
            'poliklinik',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Jadwal dokter berhasil diperbarui',
            'data' => $schedule,
        ]);
    }

    public function destroy($id)
    {
        $schedule = DoctorSchedule::findOrFail($id);

        $schedule->delete();

        return response()->json([
            'success' => true,
            'message' => 'Jadwal dokter berhasil dihapus',
            'data' => null,
        ]);
    }

    private function hasScheduleConflict(
        $doctorId,
        $branchId,
        $poliklinikId,
        $dayOfWeek,
        $startTime,
        $endTime,
        $ignoreScheduleId = null
    ) {
        $query = DoctorSchedule::where('doctor_id', $doctorId)
            ->where('day_of_week', $dayOfWeek)
            ->where('status', 'active')
            ->where(function ($q) use ($startTime, $endTime) {
                $q->where('start_time', '<', $endTime)
                    ->where('end_time', '>', $startTime);
            });

        if ($ignoreScheduleId !== null) {
            $query->where('id', '!=', $ignoreScheduleId);
        }

        $query->where(function ($q) use ($branchId) {
            if ($branchId === null) {
                $q->whereNull('branch_id')
                    ->orWhereNotNull('branch_id');
            } else {
                $q->whereNull('branch_id')
                    ->orWhere('branch_id', $branchId);
            }
        });

        $query->where(function ($q) use ($poliklinikId) {
            if ($poliklinikId === null) {
                $q->whereNull('poliklinik_id')
                    ->orWhereNotNull('poliklinik_id');
            } else {
                $q->whereNull('poliklinik_id')
                    ->orWhere('poliklinik_id', $poliklinikId);
            }
        });

        return $query->exists();
    }
}