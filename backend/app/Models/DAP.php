<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DAP extends Model
{
    use HasFactory;

    protected $table = 'daps';

    protected $fillable = [
        'numero_dap',
        'visite_maritime_id',
        'statut',
        'date_demande',
        'date_traitement',
        'remarques',
        'motif_refus',
    ];

    protected $casts = [
        'date_demande' => 'datetime',
        'date_traitement' => 'datetime',
    ];

    public function visiteMaritime()
    {
        return $this->belongsTo(VisiteMaritime::class, 'visite_maritime_id');
    }
}
