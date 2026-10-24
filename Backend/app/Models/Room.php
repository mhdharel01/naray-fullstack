<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Room extends Model
{
    use SoftDeletes;
    
    protected $fillable = ['room_number', 'room_type_id', 'branch_id', 'floor', 'status', 'image_url'];

    public function roomType() { return $this->belongsTo(RoomType::class); }
    public function branch() { return $this->belongsTo(Branch::class); }
    public function facilities() { return $this->belongsToMany(Facility::class, 'room_facility', 'room_id', 'facility_id'); }
    public function bookings() { return $this->hasMany(RoomBooking::class); }
}