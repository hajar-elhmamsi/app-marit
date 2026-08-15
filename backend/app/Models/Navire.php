<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Navire extends Model
{
    use HasFactory;

    protected $fillable = [
        'imo',
        'nom',
        'pavillon',
        'type_navire',
        'longueur_m',
        'tirant_eau_m',
        'jauge_brute',
        'is_active',
    ];

    protected $casts = [
        'longueur_m' => 'float',
        'tirant_eau_m' => 'float',
        'jauge_brute' => 'integer',
        'is_active' => 'boolean',
    ];

    public function visites()
    {
        return $this->hasMany(VisiteMaritime::class);
    }
}
