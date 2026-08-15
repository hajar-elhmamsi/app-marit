<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\Visite\VisiteRequest;
use App\Models\VisiteMaritime;
use App\Services\VisiteService;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VisiteMaritimeController extends BaseApiController
{
    protected VisiteService $visiteService;

    public function __construct(VisiteService $visiteService)
    {
        $this->visiteService = $visiteService;
    }

    /**
     * Liste des visites maritimes avec relations, filtres par statut et recherche
     */
    public function index(Request $request): JsonResponse
    {
        $query = VisiteMaritime::with(['navire', 'terminal.port', 'agent', 'dap']);

        if ($request->filled('statut')) {
            $query->where('statut', $request->statut);
        }

        if ($request->filled('navire_id')) {
            $query->where('navire_id', $request->navire_id);
        }

        if ($request->filled('terminal_id')) {
            $query->where('terminal_id', $request->terminal_id);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('numero_visite', 'like', "%{$search}%")
                  ->orWhereHas('navire', function ($sub) use ($search) {
                      $sub->where('nom', 'like', "%{$search}%")->orWhere('imo', 'like', "%{$search}%");
                  });
            });
        }

        $visites = $query->orderBy('date_arrivee_estimee', 'desc')->paginate($request->get('per_page', 15));

        return $this->sendResponse($visites);
    }

    /**
     * Création d'une escale
     */
    public function store(VisiteRequest $request): JsonResponse
    {
        try {
            $agentId = $request->user() ? $request->user()->id : 1;
            $visite = $this->visiteService->creerVisite($request->validated(), $agentId);

            return $this->sendResponse($visite, 'Escale maritime créée avec succès', 201);
        } catch (Exception $e) {
            return $this->sendError($e->getMessage());
        }
    }

    /**
     * Détails d'une escale
     */
    public function show(VisiteMaritime $visiteMaritime): JsonResponse
    {
        return $this->sendResponse($visiteMaritime->load(['navire', 'terminal.port', 'agent', 'dap']));
    }

    /**
     * Modification d'une escale (dates estimées, etc.)
     */
    public function update(VisiteRequest $request, VisiteMaritime $visiteMaritime): JsonResponse
    {
        if (in_array($visiteMaritime->statut, ['cloturee', 'annulee'])) {
            return $this->sendError('Impossible de modifier une escale déjà clôturée ou annulée.');
        }

        $visiteMaritime->update($request->validated());

        return $this->sendResponse($visiteMaritime->load(['navire', 'terminal.port', 'agent', 'dap']), 'Escale mise à jour avec succès');
    }

    /**
     * Action de workflow : Activer l'escale (Navire à quai)
     */
    public function activer(Request $request, VisiteMaritime $visiteMaritime): JsonResponse
    {
        try {
            $dateArrivee = $request->input('date_arrivee_reelle');
            $visite = $this->visiteService->activerVisite($visiteMaritime, $dateArrivee);

            return $this->sendResponse($visite, 'Escale activée avec succès (Navire à quai)');
        } catch (Exception $e) {
            return $this->sendError($e->getMessage());
        }
    }

    /**
     * Action de workflow : Clôturer l'escale (Départ du navire)
     */
    public function cloturer(Request $request, VisiteMaritime $visiteMaritime): JsonResponse
    {
        try {
            $dateDepart = $request->input('date_depart_reelle');
            $visite = $this->visiteService->cloturerVisite($visiteMaritime, $dateDepart);

            return $this->sendResponse($visite, 'Escale clôturée avec succès (Navire appareillé)');
        } catch (Exception $e) {
            return $this->sendError($e->getMessage());
        }
    }

    /**
     * Action de workflow : Annuler l'escale
     */
    public function annuler(Request $request, VisiteMaritime $visiteMaritime): JsonResponse
    {
        $request->validate([
            'motif_annulation' => 'required|string|min:5|max:1000',
        ], [
            'motif_annulation.required' => 'Le motif d\'annulation est obligatoire.',
        ]);

        try {
            $visite = $this->visiteService->annulerVisite($visiteMaritime, $request->motif_annulation);

            return $this->sendResponse($visite, 'Escale annulée avec succès');
        } catch (Exception $e) {
            return $this->sendError($e->getMessage());
        }
    }
}
