<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VisiteMaritime extends Model
{
    use HasFactory;

    protected $table = 'visites_maritimes';

    protected $fillable = [
        'numero_visite',
        'navire_id',
        'terminal_id',
        'agent_id',
        'date_arrivee_estimee',
        'date_depart_estimee',
        'date_arrivee_reelle',
        'date_depart_reelle',
        'statut',
        'motif_annulation',
    ];

    protected $casts = [
        'date_arrivee_estimee' => 'datetime',
        'date_depart_estimee' => 'datetime',
        'date_arrivee_reelle' => 'datetime',
        'date_depart_reelle' => 'datetime',
    ];

    public function navire()
    {
        return $this->belongsTo(Navire::class);
    }

    public function terminal()
    {
        return $this->belongsTo(Terminal::class);
    }

    public function agent()
    {
        return $this->belongsTo(User::class, 'agent_id');
    }

    public function dap()
    {
        return $this->hasOne(DAP::class, 'visite_maritime_id');
    }
}
