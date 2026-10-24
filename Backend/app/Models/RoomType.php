<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RoomType extends Model
{
    protected $fillable = ['name', 'capacity', 'description', 'price_per_night', 'image_url', 'status', 'branch_id'];

    public function branch() { return $this->belongsTo(Branch::class); }
    public function rooms() { return $this->hasMany(Room::class); }
}