<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Room;
use App\Models\RoomType;
use Illuminate\Http\Request;

class RoomController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | ROOM TYPES
    |--------------------------------------------------------------------------
    */

    public function roomTypes(Request $request)
    {
        $query = RoomType::with('branch')
            ->where('status', 'active');

        if ($request->filled('branch_id')) {
            $branchId = $request->branch_id;

            $query->where(function ($q) use ($branchId) {
                $q->where('branch_id', $branchId)
                  ->orWhereNull('branch_id');
            });
        }

        $roomTypes = $query
            ->orderBy('name')
            ->paginate(10)
            ->withQueryString();

        return response()->json([
            'success' => true,
            'message' => 'Data tipe kamar berhasil diambil',
            'data' => $roomTypes
        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | ROOMS
    |--------------------------------------------------------------------------
    */

    public function index(Request $request)
    {
        $query = Room::with([
            'roomType',
            'branch',
            'facilities'
        ]);

        if ($request->filled('branch_id')) {
            $query->where(
                'branch_id',
                $request->branch_id
            );
        }

        if ($request->filled('room_type_id')) {
            $query->where(
                'room_type_id',
                $request->room_type_id
            );
        }

        if ($request->filled('status')) {
            $query->where(
                'status',
                $request->status
            );
        }

        $rooms = $query
            ->orderBy('room_number')
            ->paginate(10)
            ->withQueryString();

        return response()->json([
            'success' => true,
            'message' => 'Data kamar berhasil diambil',
            'data' => $rooms
        ]);
    }
}