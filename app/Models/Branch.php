<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Branch extends Model
{
    use SoftDeletes;

    protected $fillable = ['name', 'address', 'phone', 'email', 'latitude', 'longitude', 'status'];

    public function doctors() { return $this->hasMany(Doctor::class); }
    public function polikliniks() { return $this->hasMany(Poliklinik::class); }
    public function services() { return $this->hasMany(Service::class); }
    public function facilities() { return $this->hasMany(Facility::class); }
    public function centerOfExcellences() { return $this->hasMany(CenterOfExcellence::class); }
    public function roomTypes() { return $this->hasMany(RoomType::class); }
    public function rooms() { return $this->hasMany(Room::class); }
    public function doctorSchedules() { return $this->hasMany(DoctorSchedule::class); }
    public function appointments() { return $this->hasMany(Appointment::class); }
}