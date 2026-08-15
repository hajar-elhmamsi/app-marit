<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Port extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'nom',
        'pays',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function terminals()
    {
        return $this->hasMany(Terminal::class);
    }
}
