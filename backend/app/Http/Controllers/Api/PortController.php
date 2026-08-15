<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\Port\PortRequest;
use App\Models\Port;
use App\Services\AuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PortController extends BaseApiController
{
    /**
     * Liste des ports avec recherche, filtrage et pagination
     */
    public function index(Request $request): JsonResponse
    {
        $query = Port::withCount('terminals');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('nom', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%")
                  ->orWhere('pays', 'like', "%{$search}%");
            });
        }

        if ($request->has('is_active') && $request->is_active !== null && $request->is_active !== '') {
            $query->where('is_active', filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN));
        }

        $ports = $query->orderBy('nom', 'asc')->paginate($request->get('per_page', 15));

        return $this->sendResponse($ports);
    }

    /**
     * Création d'un port
     */
    public function store(PortRequest $request): JsonResponse
    {
        $port = Port::create($request->validated());

        AuditService::log('CREATE', 'Port', $port->id, [
            'code' => $port->code,
            'nom' => $port->nom,
        ]);

        return $this->sendResponse($port, 'Port créé avec succès', 201);
    }

    /**
     * Détails d'un port
     */
    public function show(Port $port): JsonResponse
    {
        return $this->sendResponse($port->load('terminals'));
    }

    /**
     * Modification d'un port
     */
    public function update(PortRequest $request, Port $port): JsonResponse
    {
        $port->update($request->validated());

        AuditService::log('UPDATE', 'Port', $port->id, [
            'code' => $port->code,
            'nom' => $port->nom,
        ]);

        return $this->sendResponse($port, 'Port mis à jour avec succès');
    }

    /**
     * Désactivation logique / suppression
     */
    public function destroy(Port $port): JsonResponse
    {
        if ($port->terminals()->count() > 0) {
            // Désactivation logique si des relations existent
            $port->update(['is_active' => false]);
            AuditService::log('DEACTIVATE', 'Port', $port->id, ['code' => $port->code]);
            return $this->sendResponse($port, 'Le port possède des terminaux rattachés : il a été désactivé au lieu d\'être supprimé.');
        }

        $portId = $port->id;
        $portCode = $port->code;
        $port->delete();

        AuditService::log('DELETE', 'Port', $portId, ['code' => $portCode]);

        return $this->sendResponse(null, 'Port supprimé avec succès');
    }

    /**
     * Bascule d'état actif/inactif
     */
    public function toggleActive(Port $port): JsonResponse
    {
        $port->update(['is_active' => !$port->is_active]);

        AuditService::log('STATUS_CHANGE', 'Port', $port->id, [
            'is_active' => $port->is_active,
        ]);

        return $this->sendResponse($port, 'Statut du port modifié avec succès');
    }
}
