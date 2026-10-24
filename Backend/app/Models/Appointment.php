<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Appointment extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'patient_id',
        'doctor_id',
        'poliklinik_id',
        'branch_id',
        'doctor_schedule_id',
        'scheduled_date',
        'scheduled_time',
        'status',
        'notes',
    ];

    protected $casts = [
        'scheduled_date' => 'date',
    ];

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function doctor()
    {
        return $this->belongsTo(Doctor::class);
    }

    public function poliklinik()
    {
        return $this->belongsTo(Poliklinik::class);
    }

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    public function schedule()
    {
        return $this->belongsTo(
            DoctorSchedule::class,
            'doctor_schedule_id'
        );
    }
}