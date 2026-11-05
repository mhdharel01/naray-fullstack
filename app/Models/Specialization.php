<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Specialization extends Model
{
    use SoftDeletes;
    protected $fillable = ['name', 'slug', 'description'];
    
    public function doctors() { return $this->hasMany(Doctor::class); }
}