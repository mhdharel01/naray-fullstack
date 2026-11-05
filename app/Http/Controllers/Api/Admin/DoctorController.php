<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Doctor;
use App\Models\DoctorSchedule;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class DoctorController extends Controller
{
    public function index(Request $request)
    {
        $query = Doctor::with([
            'specialization',
            'branch',
            'polikliniks',
            'schedules.poliklinik',
        ])->withCount('schedules');

        if ($request->filled('search')) {
            $search = $request->search;

            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', strtolower($request->status));
        }

        if ($request->filled('branch_id')) {
            $query->where('branch_id', $request->branch_id);
        }

        if ($request->filled('specialization_id')) {
            $query->where('specialization_id', $request->specialization_id);
        }

        return response()->json([
            'success' => true,
            'message' => 'Data dokter berhasil diambil',
            'data' => $query->orderBy('name')->paginate(15),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'specialization_id' => [
                'required',
                'integer',
                'exists:specializations,id',
            ],
            'branch_id' => [
                'nullable',
                'integer',
                'exists:branches,id',
            ],
            'phone' => ['nullable', 'string', 'max:50'],
            'email' => ['nullable', 'email', 'max:255'],
            'photo_url' => ['nullable', 'string', 'max:2048'],
            'bio' => ['nullable', 'string'],
            'status' => [
                'required',
                Rule::in(['active', 'inactive']),
            ],
            'poliklinik_ids' => ['nullable', 'array'],
            'poliklinik_ids.*' => [
                'integer',
                'distinct',
                'exists:polikliniks,id',
            ],
            'practice_days' => ['nullable', 'array'],
            'practice_days.*' => ['integer', 'between:1,7'],
            'start_time' => ['nullable', 'string'],
            'end_time' => ['nullable', 'string'],
            'poliklinik_id' => ['nullable', 'integer', 'exists:polikliniks,id'],
        ]);

        return DB::transaction(function () use ($validated, $request) {
            $poliklinikIds = $validated['poliklinik_ids'] ?? [];
            $practiceDays = $validated['practice_days'] ?? [];
            $startTime = $validated['start_time'] ?? '09:00';
            $endTime = $validated['end_time'] ?? '14:00';
            $selectedPoliId = $validated['poliklinik_id'] ?? null;

            unset(
                $validated['poliklinik_ids'],
                $validated['practice_days'],
                $validated['start_time'],
                $validated['end_time'],
                $validated['poliklinik_id']
            );

            if ($selectedPoliId && empty($poliklinikIds)) {
                $poliklinikIds = [$selectedPoliId];
            }

            // Jika dokter dan poliklinik sama-sama memiliki cabang
            // maka cabangnya harus sama.
            if (!empty($poliklinikIds) && !empty($validated['branch_id'])) {
                $invalidPoliklinik = \App\Models\Poliklinik::whereIn('id', $poliklinikIds)
                    ->whereNotNull('branch_id')
                    ->where('branch_id', '!=', $validated['branch_id'])
                    ->exists();

                if ($invalidPoliklinik) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Poliklinik tidak sesuai dengan cabang dokter.',
                        'errors' => [
                            'poliklinik_ids' => [
                                'Poliklinik yang dipilih harus berada pada cabang yang sama dengan dokter.',
                            ],
                        ],
                    ], 422);
                }
            }

            $doctor = Doctor::create($validated);

            $doctor->polikliniks()->sync($poliklinikIds);

            // Sync Jadwal Praktik Dokter
            if (!empty($practiceDays)) {
                $targetPoliId = $selectedPoliId ?? ($poliklinikIds[0] ?? 1);
                $cleanStart = strlen($startTime) === 5 ? "{$startTime}:00" : $startTime;
                $cleanEnd = strlen($endTime) === 5 ? "{$endTime}:00" : $endTime;

                foreach ($practiceDays as $day) {
                    DoctorSchedule::create([
                        'doctor_id' => $doctor->id,
                        'branch_id' => $doctor->branch_id ?? 1,
                        'poliklinik_id' => $targetPoliId,
                        'day_of_week' => (int) $day,
                        'start_time' => $cleanStart,
                        'end_time' => $cleanEnd,
                        'status' => 'active',
                    ]);
                }
            }

            $doctor->load([
                'specialization',
                'branch',
                'polikliniks',
                'schedules.poliklinik',
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Dokter berhasil ditambahkan',
                'data' => $doctor,
            ], 201);
        });
    }

    public function show($id)
    {
        $doctor = Doctor::with([
            'specialization',
            'branch',
            'polikliniks',
            'schedules.poliklinik',
        ])->findOrFail($id);

        return response()->json([
            'success' => true,
            'message' => 'Detail dokter berhasil diambil',
            'data' => $doctor,
        ]);
    }

    public function update(Request $request, $id)
    {
        $doctor = Doctor::findOrFail($id);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'specialization_id' => [
                'required',
                'integer',
                'exists:specializations,id',
            ],
            'branch_id' => [
                'nullable',
                'integer',
                'exists:branches,id',
            ],
            'phone' => ['nullable', 'string', 'max:50'],
            'email' => ['nullable', 'email', 'max:255'],
            'photo_url' => ['nullable', 'string', 'max:2048'],
            'bio' => ['nullable', 'string'],
            'status' => [
                'required',
                Rule::in(['active', 'inactive']),
            ],
            'poliklinik_ids' => ['nullable', 'array'],
            'poliklinik_ids.*' => [
                'integer',
                'distinct',
                'exists:polikliniks,id',
            ],
            'practice_days' => ['nullable', 'array'],
            'practice_days.*' => ['integer', 'between:1,7'],
            'start_time' => ['nullable', 'string'],
            'end_time' => ['nullable', 'string'],
            'poliklinik_id' => ['nullable', 'integer', 'exists:polikliniks,id'],
        ]);

        return DB::transaction(function () use ($doctor, $validated, $request) {
            $poliklinikIds = $validated['poliklinik_ids'] ?? [];
            $hasPracticeDays = $request->has('practice_days');
            $practiceDays = $validated['practice_days'] ?? [];
            $startTime = $validated['start_time'] ?? '09:00';
            $endTime = $validated['end_time'] ?? '14:00';
            $selectedPoliId = $validated['poliklinik_id'] ?? null;

            unset(
                $validated['poliklinik_ids'],
                $validated['practice_days'],
                $validated['start_time'],
                $validated['end_time'],
                $validated['poliklinik_id']
            );

            if ($selectedPoliId && empty($poliklinikIds)) {
                $poliklinikIds = [$selectedPoliId];
            }

            if (!empty($poliklinikIds) && !empty($validated['branch_id'])) {
                $invalidPoliklinik = \App\Models\Poliklinik::whereIn('id', $poliklinikIds)
                    ->whereNotNull('branch_id')
                    ->where('branch_id', '!=', $validated['branch_id'])
                    ->exists();

                if ($invalidPoliklinik) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Poliklinik tidak sesuai dengan cabang dokter.',
                        'errors' => [
                            'poliklinik_ids' => [
                                'Poliklinik yang dipilih harus berada pada cabang yang sama dengan dokter.',
                            ],
                        ],
                    ], 422);
                }
            }

            $doctor->update($validated);

            if ($request->has('poliklinik_ids') || $selectedPoliId) {
                $doctor->polikliniks()->sync($poliklinikIds);
            }

            // Sync Jadwal Praktik jika practice_days dikirimkan
            if ($hasPracticeDays) {
                // Hapus jadwal lama dokter
                DoctorSchedule::where('doctor_id', $doctor->id)->delete();

                if (!empty($practiceDays)) {
                    $targetPoliId = $selectedPoliId ?? ($poliklinikIds[0] ?? ($doctor->polikliniks()->first()?->id ?? 1));
                    $cleanStart = strlen($startTime) === 5 ? "{$startTime}:00" : $startTime;
                    $cleanEnd = strlen($endTime) === 5 ? "{$endTime}:00" : $endTime;

                    foreach ($practiceDays as $day) {
                        DoctorSchedule::create([
                            'doctor_id' => $doctor->id,
                            'branch_id' => $doctor->branch_id ?? 1,
                            'poliklinik_id' => $targetPoliId,
                            'day_of_week' => (int) $day,
                            'start_time' => $cleanStart,
                            'end_time' => $cleanEnd,
                            'status' => 'active',
                        ]);
                    }
                }
            }

            $doctor->load([
                'specialization',
                'branch',
                'polikliniks',
                'schedules.poliklinik',
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Dokter berhasil diperbarui',
                'data' => $doctor,
            ]);
        });
    }

    public function destroy($id)
    {
        $doctor = Doctor::findOrFail($id);

        $doctor->delete();

        return response()->json([
            'success' => true,
            'message' => 'Dokter berhasil dihapus',
        ]);
    }
}