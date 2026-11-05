<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class RoomBooking extends Model
{
    use SoftDeletes;
    
    protected $fillable = ['room_id', 'patient_id', 'check_in', 'check_out', 'status', 'notes'];
    protected $casts = [
        'check_in' => 'date',
        'check_out' => 'date',
    ];

    public function room() { return $this->belongsTo(Room::class); }
    public function patient() { return $this->belongsTo(Patient::class); }
}