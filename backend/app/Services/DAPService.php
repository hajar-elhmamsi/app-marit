<?php

namespace App\Services;

use App\Models\DAP;
use App\Models\VisiteMaritime;
use Exception;

class DAPService
{
    /**
     * Génère un numéro de DAP unique (ex: DAP-2026-005)
     */
    public function genererNumeroDAP(): string
    {
        $annee = date('Y');
        $dernier = DAP::whereYear('created_at', $annee)->count();
        $sequence = str_pad($dernier + 1, 3, '0', STR_PAD_LEFT);
        return "DAP-{$annee}-{$sequence}";
    }

    /**
     * Création initiale du DAP en brouillon
     */
    public function creerDAPBrouillon(int $visiteMaritimeId, ?string $remarques = null): DAP
    {
        $numeroDAP = $this->genererNumeroDAP();

        $dap = DAP::create([
            'numero_dap' => $numeroDAP,
            'visite_maritime_id' => $visiteMaritimeId,
            'statut' => 'brouillon',
            'date_demande' => now(),
            'remarques' => $remarques,
        ]);

        AuditService::log('CREATE', 'DAP', $dap->id, [
            'numero_dap' => $dap->numero_dap,
            'visite_maritime_id' => $visiteMaritimeId,
            'statut' => 'brouillon',
        ]);

        return $dap;
    }

    /**
     * Soumettre le DAP à la capitainerie (Brouillon -> Envoyé)
     */
    public function envoyerDAP(DAP $dap, ?string $remarques = null): DAP
    {
        if ($dap->statut !== 'brouillon') {
            throw new Exception("Seul un DAP au statut 'Brouillon' peut être envoyé.");
        }

        $ancienStatut = $dap->statut;
        $dap->update([
            'statut' => 'envoye',
            'remarques' => $remarques ?? $dap->remarques,
            'date_demande' => now(),
        ]);

        AuditService::log('STATUS_CHANGE', 'DAP', $dap->id, [
            'statut_precedent' => $ancienStatut,
            'nouveau_statut' => 'envoye',
        ]);

        return $dap->load('visiteMaritime.navire');
    }

    /**
     * Accepter le DAP (Envoyé -> Accepté)
     */
    public function accepterDAP(DAP $dap): DAP
    {
        if ($dap->statut !== 'envoye') {
            throw new Exception("Seul un DAP au statut 'Envoyé' peut être accepté.");
        }

        $ancienStatut = $dap->statut;
        $dap->update([
            'statut' => 'accepte',
            'date_traitement' => now(),
            'motif_refus' => null,
        ]);

        AuditService::log('STATUS_CHANGE', 'DAP', $dap->id, [
            'statut_precedent' => $ancienStatut,
            'nouveau_statut' => 'accepte',
        ]);

        return $dap->load('visiteMaritime.navire');
    }

    /**
     * Refuser le DAP (Envoyé -> Refusé avec motif)
     */
    public function refuserDAP(DAP $dap, string $motifRefus): DAP
    {
        if ($dap->statut !== 'envoye') {
            throw new Exception("Seul un DAP au statut 'Envoyé' peut être refusé.");
        }

        $ancienStatut = $dap->statut;
        $dap->update([
            'statut' => 'refuse',
            'date_traitement' => now(),
            'motif_refus' => $motifRefus,
        ]);

        AuditService::log('STATUS_CHANGE', 'DAP', $dap->id, [
            'statut_precedent' => $ancienStatut,
            'nouveau_statut' => 'refuse',
            'motif_refus' => $motifRefus,
        ]);

        return $dap->load('visiteMaritime.navire');
    }
}
