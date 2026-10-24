<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class McuPackage extends Model
{
    use SoftDeletes;
    
    protected $fillable = ['name', 'slug', 'description', 'price', 'image_url', 'status'];
}