<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\PortController;
use App\Http\Controllers\Api\TerminalController;
use App\Http\Controllers\Api\NavireController;
use App\Http\Controllers\Api\VisiteMaritimeController;
use App\Http\Controllers\Api\DAPController;
use App\Http\Controllers\Api\AuditLogController;

/*
|--------------------------------------------------------------------------
| API Routes - Navios PortCall Management
|--------------------------------------------------------------------------
*/

// Routes Publiques
Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
});

Route::get('/health', function () {
    return response()->json([
        'success' => true,
        'message' => 'API REST Laravel en ligne',
        'data' => [
            'service' => 'Navios PortCall API',
            'version' => '1.0.0',
            'framework' => 'Laravel 11 (PHP 8.2)',
            'database' => 'MySQL',
        ]
    ]);
});

// Routes Protégées (Sanctum Auth)
Route::middleware('auth:sanctum')->group(function () {
    // Auth & Profil
    Route::prefix('auth')->group(function () {
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout']);
    });

    // Tableau de bord
    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);

    // Gestion des Utilisateurs & Permissions Granulaires RBAC
    Route::apiResource('users', UserController::class);
    Route::patch('users/{user}/toggle-active', [UserController::class, 'toggleActive']);
    Route::post('users/{user}/permissions', [UserController::class, 'updatePermissions']);

    // Ports
    Route::apiResource('ports', PortController::class);
    Route::patch('ports/{port}/toggle-active', [PortController::class, 'toggleActive']);

    // Terminaux
    Route::apiResource('terminals', TerminalController::class);
    Route::patch('terminals/{terminal}/toggle-active', [TerminalController::class, 'toggleActive']);

    // Navires
    Route::apiResource('navires', NavireController::class);
    Route::patch('navires/{navire}/toggle-active', [NavireController::class, 'toggleActive']);

    // Visites Maritimes (Escales)
    Route::apiResource('visites', VisiteMaritimeController::class);
    Route::post('visites/{visite_maritime}/activer', [VisiteMaritimeController::class, 'activer']);
    Route::post('visites/{visite_maritime}/cloturer', [VisiteMaritimeController::class, 'cloturer']);
    Route::post('visites/{visite_maritime}/annuler', [VisiteMaritimeController::class, 'annuler']);

    // DAP (Demandes d'Accès Portuaire)
    Route::apiResource('daps', DAPController::class);
    Route::post('daps/{dap}/envoyer', [DAPController::class, 'envoyer']);
    Route::post('daps/{dap}/accepter', [DAPController::class, 'accepter']);
    Route::post('daps/{dap}/refuser', [DAPController::class, 'refuser']);

    // Traçabilité & Audit Logs
    Route::get('audit-logs', [AuditLogController::class, 'index']);
});
