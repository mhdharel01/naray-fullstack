<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RoomType extends Model
{
    protected $fillable = [
        'name',
        'category',
        'capacity',
        'description',
        'facilities',
        'price_per_night',
        'image_url',
        'status',
        'branch_id'
    ];

    protected $casts = [
        'facilities' => 'array',
    ];

    public function branch() { return $this->belongsTo(Branch::class); }
    public function rooms() { return $this->hasMany(Room::class); }
}
