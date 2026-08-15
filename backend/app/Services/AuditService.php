<?php

namespace App\Services;

use App\Models\AuditLog;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;

class AuditService
{
    /**
     * Enregistrer une trace d'audit dans la base de données
     */
    public static function log(string $action, string $entiteType, ?int $entiteId = null, ?array $details = null): AuditLog
    {
        return AuditLog::create([
            'user_id' => Auth::id() ?? 1,
            'action' => $action,
            'entite_type' => $entiteType,
            'entite_id' => $entiteId,
            'details' => $details,
            'ip_address' => Request::ip() ?? '127.0.0.1',
            'created_at' => now(),
        ]);
    }
}
