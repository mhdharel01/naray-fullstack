<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Doctor extends Model
{
    use SoftDeletes;
    
    protected $fillable = ['name', 'specialization_id', 'branch_id', 'phone', 'email', 'photo_url', 'bio', 'status'];

    public function specialization() { return $this->belongsTo(Specialization::class); }
    public function branch() { return $this->belongsTo(Branch::class); }
    public function polikliniks() { return $this->belongsToMany(Poliklinik::class, 'doctor_poliklinik', 'doctor_id', 'poliklinik_id'); }
    public function schedules() { return $this->hasMany(DoctorSchedule::class); }
    public function appointments() { return $this->hasMany(Appointment::class); }
    public function leaves() { return $this->hasMany(DoctorLeave::class)->where('status', 'active'); }

    public function isCurrentlyOnLeave($date = null): bool
    {
        $checkDate = $date ? \Carbon\Carbon::parse($date)->toDateString() : \Carbon\Carbon::today()->toDateString();
        return $this->leaves()
            ->whereDate('start_date', '<=', $checkDate)
            ->whereDate('end_date', '>=', $checkDate)
            ->exists();
    }

    public function getCurrentLeaveAttribute()
    {
        $today = \Carbon\Carbon::today()->toDateString();
        return $this->leaves()
            ->whereDate('start_date', '<=', $today)
            ->whereDate('end_date', '>=', $today)
            ->first();
    }
}