<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Room;
use App\Models\RoomType;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class RoomController extends Controller
{
    public function index(Request $request)
    {
        $query = Room::with(['roomType', 'branch', 'facilities']);

        if ($request->filled('search')) {
            $search = $request->search;

            $query->where('room_number', 'like', "%{$search}%");
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('branch_id')) {
            $query->where('branch_id', $request->branch_id);
        }

        if ($request->filled('room_type_id')) {
            $query->where('room_type_id', $request->room_type_id);
        }

        return response()->json(
            $query->latest()->paginate(15)
        );
    }

    public function show($id)
    {
        $room = Room::with([
            'roomType',
            'branch',
            'facilities',
            'bookings'
        ])->findOrFail($id);

        return response()->json($room);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'room_number' => [
                'required',
                'string',
                'max:255',
                'unique:rooms,room_number',
            ],
            'room_type_id' => [
                'required',
                'integer',
                'exists:room_types,id',
            ],
            'branch_id' => [
                'required',
                'integer',
                'exists:branches,id',
            ],
            'floor' => [
                'required',
                'integer',
            ],
            'status' => [
                'required',
                Rule::in(['available', 'occupied', 'maintenance']),
            ],
            'image_url' => [
                'nullable',
                'string',
                'max:2048',
            ],
        ]);

        $roomType = RoomType::findOrFail($validated['room_type_id']);

        if (
            $roomType->branch_id !== null &&
            (int) $roomType->branch_id !== (int) $validated['branch_id']
        ) {
            return response()->json([
                'message' => 'Room type does not belong to the selected branch.'
            ], 422);
        }

        $room = Room::create($validated);

        $room->load([
            'roomType',
            'branch',
            'facilities'
        ]);

        return response()->json($room, 201);
    }

    public function update(Request $request, $id)
    {
        $room = Room::findOrFail($id);

        $validated = $request->validate([
            'room_number' => [
                'required',
                'string',
                'max:255',
                Rule::unique('rooms', 'room_number')
                    ->ignore($room->id),
            ],
            'room_type_id' => [
                'required',
                'integer',
                'exists:room_types,id',
            ],
            'branch_id' => [
                'required',
                'integer',
                'exists:branches,id',
            ],
            'floor' => [
                'required',
                'integer',
            ],
            'status' => [
                'required',
                Rule::in(['available', 'occupied', 'maintenance']),
            ],
            'image_url' => [
                'nullable',
                'string',
                'max:2048',
            ],
        ]);

        $roomType = RoomType::findOrFail($validated['room_type_id']);

        if (
            $roomType->branch_id !== null &&
            (int) $roomType->branch_id !== (int) $validated['branch_id']
        ) {
            return response()->json([
                'message' => 'Room type does not belong to the selected branch.'
            ], 422);
        }

        $room->update($validated);

        $room->load([
            'roomType',
            'branch',
            'facilities'
        ]);

        return response()->json($room);
    }

    public function destroy($id)
    {
        $room = Room::findOrFail($id);

        $room->delete();

        return response()->json([
            'message' => 'Room deleted successfully.'
        ]);
    }

    public function facilities($id)
{
    $room = Room::with('facilities')->findOrFail($id);

    return response()->json([
        'success' => true,
        'message' => 'Data fasilitas kamar berhasil diambil',
        'data' => $room->facilities,
    ]);
}

public function syncFacilities(Request $request, $id)
{
    $room = Room::findOrFail($id);

    $validated = $request->validate([
        'facility_ids' => ['required', 'array'],
        'facility_ids.*' => ['integer', 'distinct', 'exists:facilities,id'],
    ]);

    $room->facilities()->sync($validated['facility_ids']);

    $room->load('facilities');

    return response()->json([
        'success' => true,
        'message' => 'Fasilitas kamar berhasil diperbarui',
        'data' => $room->facilities,
    ]);
}

public function removeFacility($id, $facilityId)
{
    $room = Room::findOrFail($id);

    $room->facilities()->detach($facilityId);

    $room->load('facilities');

    return response()->json([
        'success' => true,
        'message' => 'Fasilitas berhasil dihapus dari kamar',
        'data' => $room->facilities,
    ]);
}
}