<?php

namespace App\Http\Controllers\Api;

use App\Models\Navire;
use App\Models\Port;
use App\Models\Terminal;
use App\Models\VisiteMaritime;
use App\Models\DAP;
use Illuminate\Http\JsonResponse;

class DashboardController extends BaseApiController
{
    /**
     * Statistiques globales du tableau de bord
     */
    public function stats(): JsonResponse
    {
        $totalEscales = VisiteMaritime::count();
        $escalesActives = VisiteMaritime::where('statut', 'active')->count();
        $escalesPrevues = VisiteMaritime::where('statut', 'prevue')->count();
        $escalesCloturees = VisiteMaritime::where('statut', 'cloturee')->count();
        $escalesAnnulees = VisiteMaritime::where('statut', 'annulee')->count();

        $dapEnAttente = DAP::where('statut', 'envoye')->count();
        $dapBrouillon = DAP::where('statut', 'brouillon')->count();
        $dapAcceptes = DAP::where('statut', 'accepte')->count();
        $dapRefuses = DAP::where('statut', 'refuse')->count();

        $totalNavires = Navire::where('is_active', true)->count();
        $totalPorts = Port::where('is_active', true)->count();
        $totalTerminaux = Terminal::where('is_active', true)->count();

        // Prochaines escales prévues
        $prochainesEscales = VisiteMaritime::with(['navire', 'terminal.port', 'dap'])
            ->whereIn('statut', ['prevue', 'active'])
            ->orderBy('date_arrivee_estimee', 'asc')
            ->limit(5)
            ->get();

        // Répartition par type de navire
        $naviresParType = Navire::selectRaw('type_navire, count(*) as total')
            ->groupBy('type_navire')
            ->get();

        return $this->sendResponse([
            'kpis' => [
                'total_escales' => $totalEscales,
                'escales_actives' => $escalesActives,
                'escales_prevues' => $escalesPrevues,
                'escales_cloturees' => $escalesCloturees,
                'escales_annulees' => $escalesAnnulees,
                'dap_en_attente' => $dapEnAttente,
                'dap_acceptes' => $dapAcceptes,
                'dap_refuses' => $dapRefuses,
                'total_navires' => $totalNavires,
                'total_ports' => $totalPorts,
                'total_terminaux' => $totalTerminaux,
            ],
            'prochaines_escales' => $prochainesEscales,
            'repartition_navires' => $naviresParType,
        ]);
    }
}
