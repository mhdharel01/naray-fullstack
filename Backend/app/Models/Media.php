<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Media extends Model
{
    use SoftDeletes;
    
    protected $fillable = ['type', 'url', 'title', 'description', 'category_id', 'uploaded_by', 'status'];

    public function admin() { return $this->belongsTo(Admin::class, 'uploaded_by'); }
    public function category() { return $this->belongsTo(MediaCategory::class, 'category_id'); }
}