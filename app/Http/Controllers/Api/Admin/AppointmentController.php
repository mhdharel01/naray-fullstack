<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Doctor;
use App\Models\DoctorSchedule;
use App\Models\Patient;
use App\Models\Poliklinik;
use App\Models\Branch;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\DB;

class AppointmentController extends Controller
{
    /**
     * Menampilkan daftar appointment.
     */
    public function index(Request $request)
    {
        $query = Appointment::with([
            'patient',
            'doctor.specialization',
            'doctor.branch',
            'poliklinik.branch',
            'branch',
            'schedule',
        ]);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('doctor_id')) {
            $query->where('doctor_id', $request->doctor_id);
        }

        if ($request->filled('poliklinik_id')) {
            $query->where('poliklinik_id', $request->poliklinik_id);
        }

        if ($request->filled('branch_id')) {
            $query->where('branch_id', $request->branch_id);
        }

        if ($request->filled('scheduled_date')) {
            $query->whereDate(
                'scheduled_date',
                $request->scheduled_date
            );
        }

        if ($request->filled('search')) {
            $search = $request->search;

            $query->whereHas('patient', function ($q) use ($search) {
                $q->where('full_name', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        return response()->json([
            'success' => true,
            'message' => 'Data appointment berhasil diambil',
            'data' => $query
                ->latest('scheduled_date')
                ->latest('scheduled_time')
                ->paginate(15),
        ]);
    }

    /**
     * Menampilkan detail appointment.
     */
    public function show($id)
    {
        $appointment = Appointment::with([
            'patient',
            'doctor.specialization',
            'doctor.branch',
            'poliklinik.branch',
            'branch',
            'schedule',
        ])->findOrFail($id);

        return response()->json([
            'success' => true,
            'message' => 'Detail appointment berhasil diambil',
            'data' => $appointment,
        ]);
    }

    /**
     * Membuat appointment baru.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'patient_id' => [
                'required',
                'integer',
                'exists:patients,id',
            ],

            'doctor_id' => [
                'required',
                'integer',
                'exists:doctors,id',
            ],

            'poliklinik_id' => [
                'required',
                'integer',
                'exists:polikliniks,id',
            ],

            'branch_id' => [
                'required',
                'integer',
                'exists:branches,id',
            ],

            'doctor_schedule_id' => [
                'required',
                'integer',
                'exists:doctor_schedules,id',
            ],

            'scheduled_date' => [
                'required',
                'date',
            ],

            'scheduled_time' => [
                'required',
                'date_format:H:i',
            ],

            'status' => [
                'required',
                'in:PENDING,CONFIRMED,REJECTED,CANCELLED,COMPLETED',
            ],

            'notes' => [
                'nullable',
                'string',
            ],
        ]);

        return DB::transaction(function () use ($validated) {

            $doctor = Doctor::lockForUpdate()
                ->findOrFail($validated['doctor_id']);

            $poliklinik = Poliklinik::findOrFail(
                $validated['poliklinik_id']
            );

            $schedule = DoctorSchedule::lockForUpdate()
                ->findOrFail($validated['doctor_schedule_id']);

            /*
             * Appointment baru harus dimulai dari PENDING.
             */
            if ($validated['status'] !== 'PENDING') {
                throw ValidationException::withMessages([
                    'status' => [
                        'Appointment baru harus dimulai dari status PENDING.'
                    ],
                ]);
            }

            /*
             * Dokter harus aktif.
             */
            if ($doctor->status !== 'active') {
                throw ValidationException::withMessages([
                    'doctor_id' => [
                        'Dokter tidak aktif dan tidak dapat menerima appointment.'
                    ],
                ]);
            }

            /*
             * Schedule harus aktif.
             */
            if ($schedule->status !== 'active') {
                throw ValidationException::withMessages([
                    'doctor_schedule_id' => [
                        'Jadwal dokter tidak aktif.'
                    ],
                ]);
            }

            /*
             * Schedule harus milik dokter yang dipilih.
             */
            if ((int) $schedule->doctor_id !== (int) $doctor->id) {
                throw ValidationException::withMessages([
                    'doctor_schedule_id' => [
                        'Jadwal tidak sesuai dengan dokter yang dipilih.'
                    ],
                ]);
            }

            /*
             * Pastikan dokter terhubung dengan poliklinik.
             */
            $doctorHasPoliklinik = $doctor
                ->polikliniks()
                ->where('polikliniks.id', $poliklinik->id)
                ->exists();

            if (!$doctorHasPoliklinik) {
                throw ValidationException::withMessages([
                    'poliklinik_id' => [
                        'Dokter tidak terhubung dengan poliklinik tersebut.'
                    ],
                ]);
            }

            /*
             * Validasi dokter ↔ cabang.
             */
            if (
                $doctor->branch_id !== null &&
                (int) $doctor->branch_id !== (int) $validated['branch_id']
            ) {
                throw ValidationException::withMessages([
                    'branch_id' => [
                        'Cabang appointment tidak sesuai dengan cabang dokter.'
                    ],
                ]);
            }

            /*
             * Validasi poliklinik ↔ cabang.
             */
            if (
                $poliklinik->branch_id !== null &&
                (int) $poliklinik->branch_id !== (int) $validated['branch_id']
            ) {
                throw ValidationException::withMessages([
                    'branch_id' => [
                        'Cabang appointment tidak sesuai dengan cabang poliklinik.'
                    ],
                ]);
            }

            /*
             * Validasi schedule ↔ cabang.
             */
            if (
                $schedule->branch_id !== null &&
                (int) $schedule->branch_id !== (int) $validated['branch_id']
            ) {
                throw ValidationException::withMessages([
                    'branch_id' => [
                        'Cabang appointment tidak sesuai dengan cabang jadwal dokter.'
                    ],
                ]);
            }

            /*
             * Validasi schedule ↔ poliklinik.
             */
            if (
                $schedule->poliklinik_id !== null &&
                (int) $schedule->poliklinik_id !== (int) $validated['poliklinik_id']
            ) {
                throw ValidationException::withMessages([
                    'poliklinik_id' => [
                        'Poliklinik appointment tidak sesuai dengan jadwal dokter.'
                    ],
                ]);
            }

            /*
             * Pastikan hari appointment sesuai dengan jadwal.
             */
            $scheduledDate = \Carbon\Carbon::parse(
                $validated['scheduled_date']
            );

            $dayOfWeek = $scheduledDate->dayOfWeek;

            if ((int) $schedule->day_of_week !== $dayOfWeek) {
                throw ValidationException::withMessages([
                    'scheduled_date' => [
                        'Tanggal appointment tidak sesuai dengan hari jadwal dokter.'
                    ],
                ]);
            }

            /*
             * Pastikan jam appointment berada di dalam jadwal.
             *
             * start_time <= appointment_time < end_time
             */
            $scheduledTime = $validated['scheduled_time'];

            if (
                $scheduledTime < $schedule->start_time ||
                $scheduledTime >= $schedule->end_time
            ) {
                throw ValidationException::withMessages([
                    'scheduled_time' => [
                        'Jam appointment berada di luar jadwal dokter.'
                    ],
                ]);
            }

            /*
             * Cegah double booking dokter pada tanggal + jam yang sama.
             *
             * Hanya appointment CONFIRMED yang memblokir slot.
             */
            $alreadyBooked = Appointment::where(
                'doctor_id',
                $doctor->id
            )
                ->whereDate(
                    'scheduled_date',
                    $validated['scheduled_date']
                )
                ->where(
                    'scheduled_time',
                    $validated['scheduled_time']
                )
                ->where(
                    'status',
                    'CONFIRMED'
                )
                ->exists();

            if ($alreadyBooked) {
                throw ValidationException::withMessages([
                    'scheduled_time' => [
                        'Slot dokter pada tanggal dan jam tersebut sudah dibooking.'
                    ],
                ]);
            }

            $appointment = Appointment::create($validated);

            $appointment->load([
                'patient',
                'doctor.specialization',
                'doctor.branch',
                'poliklinik.branch',
                'branch',
                'schedule',
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Appointment berhasil dibuat',
                'data' => $appointment,
            ], 201);
        });
    }

    /**
     * Mengubah appointment.
     */
    public function update(Request $request, $id)
    {
        $appointment = Appointment::findOrFail($id);

        $validated = $request->validate([
            'patient_id' => [
                'required',
                'integer',
                'exists:patients,id',
            ],

            'doctor_id' => [
                'required',
                'integer',
                'exists:doctors,id',
            ],

            'poliklinik_id' => [
                'required',
                'integer',
                'exists:polikliniks,id',
            ],

            'branch_id' => [
                'required',
                'integer',
                'exists:branches,id',
            ],

            'doctor_schedule_id' => [
                'required',
                'integer',
                'exists:doctor_schedules,id',
            ],

            'scheduled_date' => [
                'required',
                'date',
            ],

            'scheduled_time' => [
                'required',
                'date_format:H:i',
            ],

            'status' => [
                'required',
                'in:PENDING,CONFIRMED,REJECTED,CANCELLED,COMPLETED',
            ],

            'notes' => [
                'nullable',
                'string',
            ],
        ]);

        return DB::transaction(function () use ($appointment, $validated) {

            $doctor = Doctor::lockForUpdate()
                ->findOrFail($validated['doctor_id']);

            $poliklinik = Poliklinik::findOrFail(
                $validated['poliklinik_id']
            );

            $schedule = DoctorSchedule::lockForUpdate()
                ->findOrFail($validated['doctor_schedule_id']);

            /*
             * Validasi perubahan status.
             */
            $this->validateStatusTransition(
                $appointment->status,
                $validated['status']
            );

            /*
             * Dokter harus aktif.
             */
            if ($doctor->status !== 'active') {
                throw ValidationException::withMessages([
                    'doctor_id' => [
                        'Dokter tidak aktif.'
                    ],
                ]);
            }

            /*
             * Schedule harus aktif.
             */
            if ($schedule->status !== 'active') {
                throw ValidationException::withMessages([
                    'doctor_schedule_id' => [
                        'Jadwal dokter tidak aktif.'
                    ],
                ]);
            }

            /*
             * Schedule harus milik dokter.
             */
            if ((int) $schedule->doctor_id !== (int) $doctor->id) {
                throw ValidationException::withMessages([
                    'doctor_schedule_id' => [
                        'Jadwal tidak sesuai dengan dokter.'
                    ],
                ]);
            }

            /*
             * Dokter ↔ poliklinik.
             */
            $doctorHasPoliklinik = $doctor
                ->polikliniks()
                ->where('polikliniks.id', $poliklinik->id)
                ->exists();

            if (!$doctorHasPoliklinik) {
                throw ValidationException::withMessages([
                    'poliklinik_id' => [
                        'Dokter tidak terhubung dengan poliklinik tersebut.'
                    ],
                ]);
            }

            /*
             * Dokter ↔ cabang.
             */
            if (
                $doctor->branch_id !== null &&
                (int) $doctor->branch_id !== (int) $validated['branch_id']
            ) {
                throw ValidationException::withMessages([
                    'branch_id' => [
                        'Cabang tidak sesuai dengan dokter.'
                    ],
                ]);
            }

            /*
             * Poliklinik ↔ cabang.
             */
            if (
                $poliklinik->branch_id !== null &&
                (int) $poliklinik->branch_id !== (int) $validated['branch_id']
            ) {
                throw ValidationException::withMessages([
                    'branch_id' => [
                        'Cabang tidak sesuai dengan poliklinik.'
                    ],
                ]);
            }

            /*
             * Schedule ↔ cabang.
             */
            if (
                $schedule->branch_id !== null &&
                (int) $schedule->branch_id !== (int) $validated['branch_id']
            ) {
                throw ValidationException::withMessages([
                    'branch_id' => [
                        'Cabang tidak sesuai dengan jadwal dokter.'
                    ],
                ]);
            }

            /*
             * Schedule ↔ poliklinik.
             */
            if (
                $schedule->poliklinik_id !== null &&
                (int) $schedule->poliklinik_id !== (int) $validated['poliklinik_id']
            ) {
                throw ValidationException::withMessages([
                    'poliklinik_id' => [
                        'Poliklinik tidak sesuai dengan jadwal dokter.'
                    ],
                ]);
            }

            /*
             * Validasi hari.
             */
            $scheduledDate = \Carbon\Carbon::parse(
                $validated['scheduled_date']
            );

            $dayOfWeek = $scheduledDate->dayOfWeek;

            if ((int) $schedule->day_of_week !== $dayOfWeek) {
                throw ValidationException::withMessages([
                    'scheduled_date' => [
                        'Tanggal tidak sesuai dengan hari jadwal dokter.'
                    ],
                ]);
            }

            /*
             * Validasi jam.
             */
            $scheduledTime = $validated['scheduled_time'];

            if (
                $scheduledTime < $schedule->start_time ||
                $scheduledTime >= $schedule->end_time
            ) {
                throw ValidationException::withMessages([
                    'scheduled_time' => [
                        'Jam appointment berada di luar jadwal dokter.'
                    ],
                ]);
            }

            /*
             * Jika CONFIRMED, cek double booking.
             */
            if ($validated['status'] === 'CONFIRMED') {

                $alreadyBooked = Appointment::where(
                    'doctor_id',
                    $doctor->id
                )
                    ->whereDate(
                        'scheduled_date',
                        $validated['scheduled_date']
                    )
                    ->where(
                        'scheduled_time',
                        $validated['scheduled_time']
                    )
                    ->where(
                        'status',
                        'CONFIRMED'
                    )
                    ->where(
                        'id',
                        '!=',
                        $appointment->id
                    )
                    ->exists();

                if ($alreadyBooked) {
                    throw ValidationException::withMessages([
                        'scheduled_time' => [
                            'Slot dokter sudah digunakan oleh appointment lain.'
                        ],
                    ]);
                }
            }

            $appointment->update($validated);

            $appointment->load([
                'patient',
                'doctor.specialization',
                'doctor.branch',
                'poliklinik.branch',
                'branch',
                'schedule',
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Appointment berhasil diperbarui',
                'data' => $appointment,
            ]);
        });
    }

    /**
     * Menghapus appointment secara soft delete.
     */
    public function destroy($id)
    {
        $appointment = Appointment::findOrFail($id);

        $appointment->delete();

        return response()->json([
            'success' => true,
            'message' => 'Appointment berhasil dihapus',
        ]);
    }

    /**
     * Validasi perpindahan status appointment.
     */
    private function validateStatusTransition(
        $currentStatus,
        $newStatus
    ) {
        $currentStatus = strtoupper($currentStatus);
        $newStatus = strtoupper($newStatus);

        $allowedTransitions = [
            'PENDING' => [
                'CONFIRMED',
                'REJECTED',
                'CANCELLED',
            ],

            'CONFIRMED' => [
                'COMPLETED',
                'CANCELLED',
            ],

            'REJECTED' => [],

            'CANCELLED' => [],

            'COMPLETED' => [],
        ];

        if (
            !isset($allowedTransitions[$currentStatus]) ||
            !in_array(
                $newStatus,
                $allowedTransitions[$currentStatus]
            )
        ) {
            throw ValidationException::withMessages([
                'status' => [
                    "Status {$currentStatus} tidak dapat diubah menjadi {$newStatus}."
                ],
            ]);
        }
    }

    /**
     * Memperbarui status appointment secara cepat (konfirmasi, pembatalan, selesai).
     */
    public function updateStatus(Request $request, $id)
    {
        $appointment = Appointment::findOrFail($id);

        $validated = $request->validate([
            'status' => [
                'required',
                'string',
                'in:PENDING,CONFIRMED,REJECTED,CANCELLED,COMPLETED,pending,confirmed,rejected,cancelled,completed',
            ],
        ]);

        $newStatus = strtoupper($validated['status']);
        $this->validateStatusTransition($appointment->status, $newStatus);

        $appointment->update([
            'status' => strtolower($newStatus),
        ]);

        $appointment->load([
            'patient',
            'doctor.specialization',
            'doctor.branch',
            'poliklinik.branch',
            'branch',
            'schedule',
        ]);

        return response()->json([
            'success' => true,
            'message' => "Status appointment berhasil diubah menjadi {$newStatus}",
            'data' => $appointment,
        ]);
    }

    /**
     * Ringkasan statistik untuk dashboard admin.
     */
    public function dashboardStats()
    {
        $today = now()->toDateString();
        $totalPatients = Patient::count();
        $todayAppointments = Appointment::whereDate('scheduled_date', $today)->count();
        $activeAppointments = Appointment::whereIn('status', ['pending', 'confirmed', 'PENDING', 'CONFIRMED'])->count();
        $activeDoctors = Doctor::where('status', 'active')->count();

        return response()->json([
            'success' => true,
            'message' => 'Statistik dashboard berhasil diambil',
            'data' => [
                'total_patients' => $totalPatients,
                'today_appointments' => $todayAppointments,
                'active_appointments' => $activeAppointments,
                'active_doctors' => $activeDoctors,
            ],
        ]);
    }
}