<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\Auth\LoginRequest;
use App\Models\User;
use App\Services\AuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends BaseApiController
{
    /**
     * Authentification utilisateur et génération du token Sanctum
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return $this->sendError('Identifiants de connexion incorrects.', null, 401);
        }

        if (!$user->is_active) {
            return $this->sendError('Ce compte utilisateur a été désactivé par l\'administrateur.', null, 403);
        }

        // Création du token Sanctum
        $token = $user->createToken('maritime_api_token')->plainTextToken;

        AuditService::log('LOGIN', 'User', $user->id, [
            'email' => $user->email,
            'role' => $user->role,
        ]);

        return $this->sendResponse([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'is_active' => $user->is_active,
            ],
            'token' => $token,
        ], 'Connexion réussie');
    }

    /**
     * Profil de l'utilisateur actuellement authentifié
     */
    public function me(Request $request): JsonResponse
    {
        return $this->sendResponse($request->user());
    }

    /**
     * Déconnexion et révocation des tokens Sanctum
     */
    public function logout(Request $request): JsonResponse
    {
        $user = $request->user();
        if ($user) {
            $user->currentAccessToken()->delete();

            AuditService::log('LOGOUT', 'User', $user->id, [
                'email' => $user->email,
            ]);
        }

        return $this->sendResponse(null, 'Déconnexion réussie');
    }
}
