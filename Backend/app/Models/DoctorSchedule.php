<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class DoctorSchedule extends Model
{
    use SoftDeletes;
    
    protected $fillable = ['doctor_id', 'branch_id', 'poliklinik_id', 'day_of_week', 'start_time', 'end_time', 'status'];

    public function doctor() { return $this->belongsTo(Doctor::class); }
    public function branch() { return $this->belongsTo(Branch::class); }
    public function poliklinik() { return $this->belongsTo(Poliklinik::class); }
    public function appointments() { return $this->hasMany(Appointment::class); }
    public function leaves() { return $this->hasMany(DoctorLeave::class, 'doctor_schedule_id'); }
}