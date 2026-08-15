<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Terminal extends Model
{
    use HasFactory;

    protected $fillable = [
        'port_id',
        'code',
        'nom',
        'type_terminal',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function port()
    {
        return $this->belongsTo(Port::class);
    }

    public function visites()
    {
        return $this->hasMany(VisiteMaritime::class);
    }
}
