<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class DoctorLeave extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'doctor_id',
        'doctor_schedule_id',
        'start_date',
        'end_date',
        'reason',
        'notes',
        'status',
    ];

    protected $casts = [
        'start_date' => 'date:Y-m-d',
        'end_date' => 'date:Y-m-d',
    ];

    public function doctor()
    {
        return $this->belongsTo(Doctor::class);
    }

    public function schedule()
    {
        return $this->belongsTo(DoctorSchedule::class, 'doctor_schedule_id');
    }
}
