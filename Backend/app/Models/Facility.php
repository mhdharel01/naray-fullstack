<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Facility extends Model
{
    use SoftDeletes;
    
    protected $fillable = ['name', 'type', 'description', 'image_url', 'status', 'branch_id'];

    public function branch() { return $this->belongsTo(Branch::class); }
    public function rooms() { return $this->belongsToMany(Room::class, 'room_facility', 'facility_id', 'room_id'); }
}