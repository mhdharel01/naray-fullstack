<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class CenterOfExcellence extends Model
{
    protected $table = 'center_of_excellences';
    use SoftDeletes;
    
    protected $fillable = ['name', 'slug', 'description', 'image_url', 'status', 'branch_id'];

    public function branch() { return $this->belongsTo(Branch::class); }
}