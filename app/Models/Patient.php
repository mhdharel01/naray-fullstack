<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Patient extends Model
{
    use SoftDeletes;

    protected $fillable = ['full_name', 'email', 'phone'];

    public function appointments() { return $this->hasMany(Appointment::class); }
    public function roomBookings() { return $this->hasMany(RoomBooking::class); }
}