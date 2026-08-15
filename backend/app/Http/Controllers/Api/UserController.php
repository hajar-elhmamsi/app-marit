<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    /**
     * Liste paginée et filtrée des utilisateurs.
     */
    public function index(Request $request): JsonResponse
    {
        $query = User::query();

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")
                  ->orWhere('email', 'LIKE', "%{$search}%");
            });
        }

        if ($request->filled('role') && $request->input('role') !== 'all') {
            $query->where('role', $request->input('role'));
        }

        if ($request->has('is_active')) {
            $query->where('is_active', filter_var($request->input('is_active'), FILTER_VALIDATE_BOOLEAN));
        }

        $users = $query->orderBy('name', 'asc')->get();

        return response()->json([
            'success' => true,
            'message' => 'Liste des utilisateurs récupérée avec succès.',
            'data' => $users
        ]);
    }

    /**
     * Enregistrer un nouvel utilisateur avec rôle RBAC.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email',
            'password' => 'required|string|min:6',
            'role' => ['required', Rule::in(['admin', 'agent_maritime', 'capitainerie'])],
            'is_active' => 'boolean',
            'permissions' => 'nullable|array',
        ]);

        $validated['password'] = Hash::make($validated['password']);
        $user = User::create($validated);

        // Journal d'audit
        AuditLog::create([
            'user_id' => auth()->id(),
            'action' => 'CREATE',
            'entite_type' => 'User',
            'entite_id' => $user->id,
            'ip_address' => $request->ip(),
            'details' => [
                'nom' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ]
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Compte utilisateur créé avec succès.',
            'data' => $user
        ], 201);
    }

    /**
     * Afficher les détails d'un utilisateur.
     */
    public function show(User $user): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'Détails de l\'utilisateur récupérés.',
            'data' => $user
        ]);
    }

    /**
     * Mettre à jour un utilisateur existant.
     */
    public function update(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => ['sometimes', 'required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'password' => 'nullable|string|min:6',
            'role' => ['sometimes', 'required', Rule::in(['admin', 'agent_maritime', 'capitainerie'])],
            'is_active' => 'boolean',
            'permissions' => 'nullable|array',
        ]);

        if (!empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        $user->update($validated);

        // Journal d'audit
        AuditLog::create([
            'user_id' => auth()->id(),
            'action' => 'UPDATE',
            'entite_type' => 'User',
            'entite_id' => $user->id,
            'ip_address' => $request->ip(),
            'details' => $validated
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Compte utilisateur mis à jour avec succès.',
            'data' => $user
        ]);
    }

    /**
     * Mettre à jour les permissions granulaires d'un utilisateur spécifique.
     */
    public function updatePermissions(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'permissions' => 'required|array',
            'permissions.*' => 'string',
        ]);

        $user->update(['permissions' => $validated['permissions']]);

        AuditLog::create([
            'user_id' => auth()->id(),
            'action' => 'PERMISSIONS_UPDATE',
            'entite_type' => 'User',
            'entite_id' => $user->id,
            'ip_address' => $request->ip(),
            'details' => [
                'permissions_count' => count($validated['permissions']),
                'permissions' => $validated['permissions'],
            ]
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Permissions de l\'utilisateur mises à jour avec succès.',
            'data' => $user
        ]);
    }

    /**
     * Activer / Désactiver un compte utilisateur.
     */
    public function toggleActive(Request $request, User $user): JsonResponse
    {
        $user->update(['is_active' => !$user->is_active]);

        AuditLog::create([
            'user_id' => auth()->id(),
            'action' => 'STATUS_CHANGE',
            'entite_type' => 'User',
            'entite_id' => $user->id,
            'ip_address' => $request->ip(),
            'details' => ['is_active' => $user->is_active]
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Statut du compte modifié.',
            'data' => $user
        ]);
    }

    /**
     * Supprimer définitivement un utilisateur.
     */
    public function destroy(Request $request, User $user): JsonResponse
    {
        $id = $user->id;
        $name = $user->name;
        $user->delete();

        AuditLog::create([
            'user_id' => auth()->id(),
            'action' => 'DELETE',
            'entite_type' => 'User',
            'entite_id' => $id,
            'ip_address' => $request->ip(),
            'details' => ['nom' => $name]
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Compte utilisateur supprimé avec succès.',
            'data' => null
        ]);
    }
}
