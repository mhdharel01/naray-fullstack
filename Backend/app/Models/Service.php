<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Service extends Model
{
    use SoftDeletes;
    
    protected $fillable = ['name', 'slug', 'description', 'image_url', 'status', 'branch_id'];

    public function branch() { return $this->belongsTo(Branch::class); }
}