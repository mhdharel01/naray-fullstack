<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Patient;
use App\Models\Doctor;
use App\Models\Poliklinik;
use App\Models\DoctorSchedule;
use App\Models\Branch;
use App\Models\Appointment;

class PublicAppointmentController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'patient_name' => 'required|string|max:255',
            'patient_phone' => 'required|string|max:30',
            'scheduled_date' => 'nullable|string',
            'scheduled_time' => 'nullable|string',
        ]);

        // 1. Find or create patient
        $patient = Patient::firstOrCreate(
            ['phone' => $request->patient_phone],
            [
                'full_name' => $request->patient_name,
                'email' => $request->patient_email ?? null
            ]
        );

        // 2. Resolve Doctor
        $doctorId = $request->doctor_id;
        $doctor = null;
        if ($doctorId && is_numeric($doctorId)) {
            $doctor = Doctor::find($doctorId);
        }
        if (!$doctor && $request->doctor_name) {
            $doctor = Doctor::where('name', 'LIKE', '%' . $request->doctor_name . '%')->first();
        }
        if (!$doctor) {
            $doctor = Doctor::first();
        }

        // 3. Resolve Poliklinik
        $poliId = $request->poliklinik_id;
        $poliklinik = null;
        if ($poliId && is_numeric($poliId)) {
            $poliklinik = Poliklinik::find($poliId);
        }
        if (!$poliklinik && $request->poliklinik_name) {
            $poliklinik = Poliklinik::where('name', 'LIKE', '%' . $request->poliklinik_name . '%')->first();
        }
        if (!$poliklinik && $doctor) {
            $poliklinik = $doctor->polikliniks()->first();
        }
        if (!$poliklinik) {
            $poliklinik = Poliklinik::first();
        }

        // 4. Resolve Branch
        $branchId = $doctor?->branch_id ?? Branch::first()?->id ?? 1;

        // 5. Resolve Schedule
        $schedule = DoctorSchedule::where('doctor_id', $doctor?->id)->first();
        $scheduleId = $schedule?->id ?? DoctorSchedule::first()?->id ?? 1;

        // 6. Format Date and Time
        $scheduledDate = $request->scheduled_date ? date('Y-m-d', strtotime($request->scheduled_date)) : now()->addDay()->toDateString();
        $scheduledTime = '09:00:00';
        if ($request->scheduled_time) {
            if (preg_match('/(\d{2}:\d{2})/', $request->scheduled_time, $m)) {
                $scheduledTime = $m[1] . ':00';
            }
        }

        $bookingCode = 'NRY-' . strtoupper(substr(md5(uniqid()), 0, 6));
        $queueNumber = 'A-' . rand(10, 99);

        // 7. Create Appointment
        $appointment = Appointment::create([
            'patient_id' => $patient->id,
            'doctor_id' => $doctor->id,
            'poliklinik_id' => $poliklinik->id,
            'branch_id' => $branchId,
            'doctor_schedule_id' => $scheduleId,
            'scheduled_date' => $scheduledDate,
            'scheduled_time' => $scheduledTime,
            'status' => 'pending',
            'notes' => ($request->notes ? $request->notes . " | " : "") . 
                       "Kode Booking: {$bookingCode} | No Antrean: {$queueNumber} | Penjamin: " . ($request->insurance ?? 'Umum/Pribadi')
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Janji temu berhasil dibuat dan disimpan di database!',
            'data' => [
                'appointment_id' => $appointment->id,
                'booking_code' => $bookingCode,
                'queue_number' => $queueNumber,
                'patient_name' => $patient->full_name,
                'doctor_name' => $doctor->name,
                'poliklinik_name' => $poliklinik->name,
                'scheduled_date' => $scheduledDate,
                'scheduled_time' => $scheduledTime,
                'status' => $appointment->status
            ]
        ], 201);
    }
}
