<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\Navire\NavireRequest;
use App\Models\Navire;
use App\Services\AuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NavireController extends BaseApiController
{
    /**
     * Liste des navires avec recherche et filtres
     */
    public function index(Request $request): JsonResponse
    {
        $query = Navire::query();

        if ($request->filled('type_navire')) {
            $query->where('type_navire', $request->type_navire);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('nom', 'like', "%{$search}%")
                  ->orWhere('imo', 'like', "%{$search}%")
                  ->orWhere('pavillon', 'like', "%{$search}%");
            });
        }

        if ($request->has('is_active') && $request->is_active !== null && $request->is_active !== '') {
            $query->where('is_active', filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN));
        }

        $navires = $query->orderBy('nom', 'asc')->paginate($request->get('per_page', 15));

        return $this->sendResponse($navires);
    }

    /**
     * Création d'un navire
     */
    public function store(NavireRequest $request): JsonResponse
    {
        $navire = Navire::create($request->validated());

        AuditService::log('CREATE', 'Navire', $navire->id, [
            'imo' => $navire->imo,
            'nom' => $navire->nom,
        ]);

        return $this->sendResponse($navire, 'Navire créé avec succès', 201);
    }

    /**
     * Détails d'un navire
     */
    public function show(Navire $navire): JsonResponse
    {
        return $this->sendResponse($navire->load('visites.terminal.port'));
    }

    /**
     * Modification d'un navire
     */
    public function update(NavireRequest $request, Navire $navire): JsonResponse
    {
        $navire->update($request->validated());

        AuditService::log('UPDATE', 'Navire', $navire->id, [
            'imo' => $navire->imo,
            'nom' => $navire->nom,
        ]);

        return $this->sendResponse($navire, 'Navire mis à jour avec succès');
    }

    /**
     * Désactivation / suppression
     */
    public function destroy(Navire $navire): JsonResponse
    {
        if ($navire->visites()->count() > 0) {
            $navire->update(['is_active' => false]);
            AuditService::log('DEACTIVATE', 'Navire', $navire->id, ['imo' => $navire->imo]);
            return $this->sendResponse($navire, 'Le navire a des escales historiques associées : il a été désactivé.');
        }

        $id = $navire->id;
        $imo = $navire->imo;
        $navire->delete();

        AuditService::log('DELETE', 'Navire', $id, ['imo' => $imo]);

        return $this->sendResponse(null, 'Navire supprimé avec succès');
    }

    /**
     * Bascule d'état actif/inactif
     */
    public function toggleActive(Navire $navire): JsonResponse
    {
        $navire->update(['is_active' => !$navire->is_active]);

        AuditService::log('STATUS_CHANGE', 'Navire', $navire->id, [
            'is_active' => $navire->is_active,
        ]);

        return $this->sendResponse($navire, 'Statut du navire modifié avec succès');
    }
}
