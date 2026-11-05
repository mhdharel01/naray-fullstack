<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Room;
use App\Models\RoomBooking;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\DB;

class RoomBookingController extends Controller
{
    public function index(Request $request)
    {
        $query = RoomBooking::with([
            'room.roomType',
            'room.branch',
            'patient',
        ]);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('room_id')) {
            $query->where('room_id', $request->room_id);
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
            'message' => 'Data booking kamar berhasil diambil',
            'data' => $query->latest()->paginate(15),
        ]);
    }

    public function show($id)
    {
        $booking = RoomBooking::with([
            'room.roomType',
            'room.branch',
            'patient',
        ])->findOrFail($id);

        return response()->json([
            'success' => true,
            'message' => 'Detail booking kamar berhasil diambil',
            'data' => $booking,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'room_id' => ['required', 'integer', 'exists:rooms,id'],
            'patient_id' => ['required', 'integer', 'exists:patients,id'],
            'check_in' => ['required', 'date'],
            'check_out' => ['required', 'date', 'after:check_in'],
            'status' => [
                'required',
                'in:PENDING,CONFIRMED,REJECTED,CANCELLED,CHECKED_IN,CHECKED_OUT'
            ],
            'notes' => ['nullable', 'string'],
        ]);

        return DB::transaction(function () use ($validated) {

            $room = Room::lockForUpdate()->findOrFail($validated['room_id']);

            /*
            |--------------------------------------------------------------------------
            | ROOM MAINTENANCE
            |--------------------------------------------------------------------------
            */

            if ($room->status === 'maintenance') {
                throw ValidationException::withMessages([
                    'room_id' => [
                        'Kamar sedang maintenance dan tidak dapat dipesan.'
                    ],
                ]);
            }

            /*
            |--------------------------------------------------------------------------
            | STATUS AWAL
            |--------------------------------------------------------------------------
            */

            if ($validated['status'] !== 'PENDING') {

                throw ValidationException::withMessages([
                    'status' => [
                        'Booking baru harus dimulai dari status PENDING.'
                    ],
                ]);
            }

            $booking = RoomBooking::create($validated);

            $booking->load([
                'room.roomType',
                'room.branch',
                'patient',
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Booking kamar berhasil dibuat',
                'data' => $booking,
            ], 201);
        });
    }

    public function update(Request $request, $id)
    {
        $booking = RoomBooking::findOrFail($id);

        $validated = $request->validate([
            'room_id' => ['required', 'integer', 'exists:rooms,id'],
            'patient_id' => ['required', 'integer', 'exists:patients,id'],
            'check_in' => ['required', 'date'],
            'check_out' => ['required', 'date', 'after:check_in'],
            'status' => [
                'required',
                'in:PENDING,CONFIRMED,REJECTED,CANCELLED,CHECKED_IN,CHECKED_OUT'
            ],
            'notes' => ['nullable', 'string'],
        ]);

        return DB::transaction(function () use ($booking, $validated) {

            /*
            |--------------------------------------------------------------------------
            | LOCK ROOM
            |--------------------------------------------------------------------------
            */

            $room = Room::lockForUpdate()->findOrFail($validated['room_id']);

            /*
            |--------------------------------------------------------------------------
            | VALIDASI STATUS TRANSITION
            |--------------------------------------------------------------------------
            */

            $this->validateStatusTransition(
                $booking->status,
                $validated['status']
            );

            /*
            |--------------------------------------------------------------------------
            | ROOM MAINTENANCE
            |--------------------------------------------------------------------------
            */

            /*
             * Maintenance tidak boleh menghalangi CHECKED_OUT
             * karena pasien yang sedang check-in tetap harus bisa checkout.
             */

            if (
                $room->status === 'maintenance' &&
                $validated['status'] !== 'CHECKED_OUT'
            ) {
                throw ValidationException::withMessages([
                    'room_id' => [
                        'Kamar sedang maintenance.'
                    ],
                ]);
            }

            /*
            |--------------------------------------------------------------------------
            | CEK AVAILABILITY
            |--------------------------------------------------------------------------
            */

            if (
                in_array(
                    $validated['status'],
                    ['CONFIRMED', 'CHECKED_IN']
                )
            ) {

                $this->checkRoomAvailability(
                    $room->id,
                    $validated['check_in'],
                    $validated['check_out'],
                    $booking->id
                );
            }

            /*
            |--------------------------------------------------------------------------
            | UPDATE BOOKING
            |--------------------------------------------------------------------------
            */

            $booking->update($validated);

            /*
            |--------------------------------------------------------------------------
            | SINKRONISASI STATUS ROOM
            |--------------------------------------------------------------------------
            */

            $this->syncRoomStatus(
                $room,
                $validated['status']
            );

            $booking->load([
                'room.roomType',
                'room.branch',
                'patient',
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Booking kamar berhasil diperbarui',
                'data' => $booking,
            ]);
        });
    }

    public function destroy($id)
    {
        $booking = RoomBooking::findOrFail($id);

        DB::transaction(function () use ($booking) {

            $room = Room::lockForUpdate()->findOrFail($booking->room_id);

            $booking->delete();

            /*
            |--------------------------------------------------------------------------
            | SET ROOM AVAILABLE JIKA TIDAK ADA ACTIVE BOOKING
            |--------------------------------------------------------------------------
            */

            if ($room->status !== 'maintenance') {

                $activeBookingExists = RoomBooking::where(
                    'room_id',
                    $room->id
                )
                    ->whereIn('status', [
                        'CHECKED_IN'
                    ])
                    ->exists();

                if (!$activeBookingExists) {
                    $room->update([
                        'status' => 'available'
                    ]);
                }
            }
        });

        return response()->json([
            'success' => true,
            'message' => 'Booking kamar berhasil dihapus',
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | STATUS TRANSITION
    |--------------------------------------------------------------------------
    */

    private function validateStatusTransition(
    $currentStatus,
    $newStatus
) {
    // Normalisasi status agar CONFIRMED dan confirmed dianggap sama
    $currentStatus = strtoupper($currentStatus);
    $newStatus = strtoupper($newStatus);

    $allowedTransitions = [

        'PENDING' => [
            'CONFIRMED',
            'REJECTED',
            'CANCELLED',
        ],

        'CONFIRMED' => [
            'CHECKED_IN',
            'CANCELLED',
        ],

        'CHECKED_IN' => [
            'CHECKED_OUT',
        ],

        'REJECTED' => [],

        'CANCELLED' => [],

        'CHECKED_OUT' => [],
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

    /*
    |--------------------------------------------------------------------------
    | ROOM STATUS SYNCHRONIZATION
    |--------------------------------------------------------------------------
    */

    private function syncRoomStatus(
        Room $room,
        $bookingStatus
    ) {

        /*
        |--------------------------------------------------------------------------
        | JANGAN TIMPA MAINTENANCE
        |--------------------------------------------------------------------------
        */

        if ($room->status === 'maintenance') {
            return;
        }

        /*
        |--------------------------------------------------------------------------
        | CHECKED IN
        |--------------------------------------------------------------------------
        */

        if ($bookingStatus === 'CHECKED_IN') {

            $room->update([
                'status' => 'occupied'
            ]);

            return;
        }

        /*
        |--------------------------------------------------------------------------
        | CHECKED OUT
        |--------------------------------------------------------------------------
        */

        if ($bookingStatus === 'CHECKED_OUT') {

            $activeBookingExists = RoomBooking::where(
                'room_id',
                $room->id
            )
                ->whereIn('status', [
                    'CHECKED_IN'
                ])
                ->exists();

            if (!$activeBookingExists) {

                $room->update([
                    'status' => 'available'
                ]);
            }

            return;
        }

        /*
        |--------------------------------------------------------------------------
        | CANCELLED / REJECTED
        |--------------------------------------------------------------------------
        */

        if (
            in_array(
                $bookingStatus,
                ['CANCELLED', 'REJECTED']
            )
        ) {

            $activeBookingExists = RoomBooking::where(
                'room_id',
                $room->id
            )
                ->whereIn('status', [
                    'CHECKED_IN'
                ])
                ->exists();

            if (!$activeBookingExists) {

                $room->update([
                    'status' => 'available'
                ]);
            }
        }
    }

    /*
    |--------------------------------------------------------------------------
    | ROOM AVAILABILITY
    |--------------------------------------------------------------------------
    */

    private function checkRoomAvailability(
        $roomId,
        $checkIn,
        $checkOut,
        $ignoreBookingId = null
    ) {

        $query = RoomBooking::where(
            'room_id',
            $roomId
        )
            ->whereIn('status', [
                'CONFIRMED',
                'CHECKED_IN'
            ])
            ->where(
                'check_in',
                '<',
                $checkOut
            )
            ->where(
                'check_out',
                '>',
                $checkIn
            );

        if ($ignoreBookingId) {

            $query->where(
                'id',
                '!=',
                $ignoreBookingId
            );
        }

        if ($query->exists()) {

            throw ValidationException::withMessages([
                'room_id' => [
                    'Kamar sudah memiliki booking pada periode tersebut.'
                ],
            ]);
        }
    }
}