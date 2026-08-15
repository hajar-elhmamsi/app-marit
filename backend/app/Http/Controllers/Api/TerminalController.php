<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\Terminal\TerminalRequest;
use App\Models\Terminal;
use App\Services\AuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TerminalController extends BaseApiController
{
    /**
     * Liste des terminaux avec filtrage par port, recherche et pagination
     */
    public function index(Request $request): JsonResponse
    {
        $query = Terminal::with('port');

        if ($request->filled('port_id')) {
            $query->where('port_id', $request->port_id);
        }

        if ($request->filled('type_terminal')) {
            $query->where('type_terminal', $request->type_terminal);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('nom', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%");
            });
        }

        if ($request->has('is_active') && $request->is_active !== null && $request->is_active !== '') {
            $query->where('is_active', filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN));
        }

        $terminals = $query->orderBy('nom', 'asc')->paginate($request->get('per_page', 15));

        return $this->sendResponse($terminals);
    }

    /**
     * Création d'un terminal
     */
    public function store(TerminalRequest $request): JsonResponse
    {
        $terminal = Terminal::create($request->validated());

        AuditService::log('CREATE', 'Terminal', $terminal->id, [
            'code' => $terminal->code,
            'nom' => $terminal->nom,
            'port_id' => $terminal->port_id,
        ]);

        return $this->sendResponse($terminal->load('port'), 'Terminal créé avec succès', 201);
    }

    /**
     * Détails d'un terminal
     */
    public function show(Terminal $terminal): JsonResponse
    {
        return $this->sendResponse($terminal->load(['port', 'visites.navire']));
    }

    /**
     * Modification d'un terminal
     */
    public function update(TerminalRequest $request, Terminal $terminal): JsonResponse
    {
        $terminal->update($request->validated());

        AuditService::log('UPDATE', 'Terminal', $terminal->id, [
            'code' => $terminal->code,
            'nom' => $terminal->nom,
        ]);

        return $this->sendResponse($terminal->load('port'), 'Terminal mis à jour avec succès');
    }

    /**
     * Désactivation / suppression
     */
    public function destroy(Terminal $terminal): JsonResponse
    {
        if ($terminal->visites()->count() > 0) {
            $terminal->update(['is_active' => false]);
            AuditService::log('DEACTIVATE', 'Terminal', $terminal->id, ['code' => $terminal->code]);
            return $this->sendResponse($terminal, 'Le terminal possède des visites maritimes associées : il a été désactivé.');
        }

        $id = $terminal->id;
        $code = $terminal->code;
        $terminal->delete();

        AuditService::log('DELETE', 'Terminal', $id, ['code' => $code]);

        return $this->sendResponse(null, 'Terminal supprimé avec succès');
    }

    /**
     * Bascule d'état actif/inactif
     */
    public function toggleActive(Terminal $terminal): JsonResponse
    {
        $terminal->update(['is_active' => !$terminal->is_active]);

        AuditService::log('STATUS_CHANGE', 'Terminal', $terminal->id, [
            'is_active' => $terminal->is_active,
        ]);

        return $this->sendResponse($terminal, 'Statut du terminal modifié avec succès');
    }
}
