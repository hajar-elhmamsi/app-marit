<?php

namespace App\Services;

use App\Models\VisiteMaritime;
use App\Models\DAP;
use Exception;
use Illuminate\Support\Facades\DB;

class VisiteService
{
    /**
     * Génère un numéro de visite maritime unique (ex: ESC-2026-005)
     */
    public function genererNumeroVisite(): string
    {
        $annee = date('Y');
        $dernier = VisiteMaritime::whereYear('created_at', $annee)->count();
        $sequence = str_pad($dernier + 1, 3, '0', STR_PAD_LEFT);
        return "ESC-{$annee}-{$sequence}";
    }

    /**
     * Création d'une escale avec initialisation facultative du DAP en brouillon
     */
    public function creerVisite(array $data, int $agentId): VisiteMaritime
    {
        return DB::transaction(function () use ($data, $agentId) {
            $numeroVisite = $data['numero_visite'] ?? $this->genererNumeroVisite();

            $visite = VisiteMaritime::create([
                'numero_visite' => $numeroVisite,
                'navire_id' => $data['navire_id'],
                'terminal_id' => $data['terminal_id'],
                'agent_id' => $agentId,
                'date_arrivee_estimee' => $data['date_arrivee_estimee'],
                'date_depart_estimee' => $data['date_depart_estimee'],
                'statut' => 'prevue',
            ]);

            // Création automatique du DAP en statut Brouillon
            $dapService = new DAPService();
            $dapService->creerDAPBrouillon($visite->id);

            AuditService::log('CREATE', 'VisiteMaritime', $visite->id, [
                'numero_visite' => $visite->numero_visite,
                'navire_id' => $visite->navire_id,
                'terminal_id' => $visite->terminal_id,
                'statut' => 'prevue',
            ]);

            return $visite->load(['navire', 'terminal.port', 'agent', 'dap']);
        });
    }

    /**
     * Activer l'escale (navire accosté / arrivée réelle)
     */
    public function activerVisite(VisiteMaritime $visite, ?string $dateArriveeReelle = null): VisiteMaritime
    {
        if ($visite->statut !== 'prevue') {
            throw new Exception("Seule une visite au statut 'Prévue' peut être activée.");
        }

        // Vérification de la validation du DAP (Recommandé métier)
        if ($visite->dap && $visite->dap->statut !== 'accepte') {
            // Avertissement ou validation
        }

        $ancienStatut = $visite->statut;
        $visite->update([
            'statut' => 'active',
            'date_arrivee_reelle' => $dateArriveeReelle ?? now(),
        ]);

        AuditService::log('STATUS_CHANGE', 'VisiteMaritime', $visite->id, [
            'statut_precedent' => $ancienStatut,
            'nouveau_statut' => 'active',
            'date_arrivee_reelle' => $visite->date_arrivee_reelle,
        ]);

        return $visite->load(['navire', 'terminal.port', 'agent', 'dap']);
    }

    /**
     * Clôturer l'escale (navire appareillé / départ réel)
     */
    public function cloturerVisite(VisiteMaritime $visite, ?string $dateDepartReelle = null): VisiteMaritime
    {
        if ($visite->statut !== 'active') {
            throw new Exception("Seule une visite au statut 'Active' peut être clôturée.");
        }

        $ancienStatut = $visite->statut;
        $visite->update([
            'statut' => 'cloturee',
            'date_depart_reelle' => $dateDepartReelle ?? now(),
        ]);

        AuditService::log('STATUS_CHANGE', 'VisiteMaritime', $visite->id, [
            'statut_precedent' => $ancienStatut,
            'nouveau_statut' => 'cloturee',
            'date_depart_reelle' => $visite->date_depart_reelle,
        ]);

        return $visite->load(['navire', 'terminal.port', 'agent', 'dap']);
    }

    /**
     * Annuler une escale prévue
     */
    public function annulerVisite(VisiteMaritime $visite, string $motifAnnulation): VisiteMaritime
    {
        if (!in_array($visite->statut, ['prevue'])) {
            throw new Exception("Seule une visite 'Prévue' peut être annulée.");
        }

        $ancienStatut = $visite->statut;
        $visite->update([
            'statut' => 'annulee',
            'motif_annulation' => $motifAnnulation,
        ]);

        AuditService::log('CANCEL', 'VisiteMaritime', $visite->id, [
            'statut_precedent' => $ancienStatut,
            'nouveau_statut' => 'annulee',
            'motif_annulation' => $motifAnnulation,
        ]);

        return $visite->load(['navire', 'terminal.port', 'agent', 'dap']);
    }
}
