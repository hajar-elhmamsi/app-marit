<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\DAP\DAPRequest;
use App\Models\DAP;
use App\Services\DAPService;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DAPController extends BaseApiController
{
    protected DAPService $dapService;

    public function __construct(DAPService $dapService)
    {
        $this->dapService = $dapService;
    }

    /**
     * Liste des DAP avec filtres par statut et recherche
     */
    public function index(Request $request): JsonResponse
    {
        $query = DAP::with(['visiteMaritime.navire', 'visiteMaritime.terminal.port']);

        if ($request->filled('statut')) {
            $query->where('statut', $request->statut);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('numero_dap', 'like', "%{$search}%")
                  ->orWhereHas('visiteMaritime.navire', function ($sub) use ($search) {
                      $sub->where('nom', 'like', "%{$search}%")->orWhere('imo', 'like', "%{$search}%");
                  });
            });
        }

        $daps = $query->orderBy('created_at', 'desc')->paginate($request->get('per_page', 15));

        return $this->sendResponse($daps);
    }

    /**
     * Création d'un DAP manuel
     */
    public function store(DAPRequest $request): JsonResponse
    {
        try {
            $dap = $this->dapService->creerDAPBrouillon(
                $request->visite_maritime_id,
                $request->remarques
            );

            return $this->sendResponse($dap->load('visiteMaritime.navire'), 'DAP créé avec succès', 201);
        } catch (Exception $e) {
            return $this->sendError($e->getMessage());
        }
    }

    /**
     * Détails d'un DAP
     */
    public function show(DAP $dap): JsonResponse
    {
        return $this->sendResponse($dap->load(['visiteMaritime.navire', 'visiteMaritime.terminal.port', 'visiteMaritime.agent']));
    }

    /**
     * Modification d'un DAP en mode brouillon
     */
    public function update(Request $request, DAP $dap): JsonResponse
    {
        if ($dap->statut !== 'brouillon') {
            return $this->sendError('Seul un DAP au statut Brouillon peut être modifié.');
        }

        $dap->update($request->only('remarques'));

        return $this->sendResponse($dap->load('visiteMaritime.navire'), 'DAP mis à jour avec succès');
    }

    /**
     * Action de workflow : Soumettre à la capitainerie (Brouillon -> Envoyé)
     */
    public function envoyer(Request $request, DAP $dap): JsonResponse
    {
        try {
            $dap = $this->dapService->envoyerDAP($dap, $request->remarques);

            return $this->sendResponse($dap, 'DAP transmis à la capitainerie');
        } catch (Exception $e) {
            return $this->sendError($e->getMessage());
        }
    }

    /**
     * Action de workflow : Accepter le DAP (Envoyé -> Accepté)
     */
    public function accepter(DAP $dap): JsonResponse
    {
        try {
            $dap = $this->dapService->accepterDAP($dap);

            return $this->sendResponse($dap, 'DAP accepté par la capitainerie');
        } catch (Exception $e) {
            return $this->sendError($e->getMessage());
        }
    }

    /**
     * Action de workflow : Refuser le DAP (Envoyé -> Refusé avec motif)
     */
    public function refuser(Request $request, DAP $dap): JsonResponse
    {
        $request->validate([
            'motif_refus' => 'required|string|min:5|max:1000',
        ], [
            'motif_refus.required' => 'Le motif de refus est obligatoire.',
        ]);

        try {
            $dap = $this->dapService->refuserDAP($dap, $request->motif_refus);

            return $this->sendResponse($dap, 'DAP refusé avec motif consigné');
        } catch (Exception $e) {
            return $this->sendError($e->getMessage());
        }
    }
}
