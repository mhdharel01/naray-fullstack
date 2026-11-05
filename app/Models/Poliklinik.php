<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Poliklinik extends Model
{
    use SoftDeletes;
    
    protected $fillable = ['name', 'description', 'branch_id', 'image_url', 'status'];

    public function branch() { return $this->belongsTo(Branch::class); }
    public function doctors() { return $this->belongsToMany(Doctor::class, 'doctor_poliklinik', 'poliklinik_id', 'doctor_id'); }
    public function schedules() { return $this->hasMany(DoctorSchedule::class); }
    public function appointments() { return $this->hasMany(Appointment::class); }
}