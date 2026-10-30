<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HospitalInfo extends Model
{
    protected $table = 'hospital_infos';
    protected $fillable = [
        'name', 'address', 'phone', 'email', 'emergency_hotline',
        'operating_hours', 'logo_url', 'banner_image_url', 'description',
        'leadership_data', 'banner_slides'
    ];

    protected $casts = [
        'leadership_data' => 'array',
        'banner_slides' => 'array',
    ];
}