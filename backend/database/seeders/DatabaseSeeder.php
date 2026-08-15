<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Port;
use App\Models\Terminal;
use App\Models\Navire;
use App\Models\VisiteMaritime;
use App\Models\DAP;
use App\Models\AuditLog;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Utilisateurs Spécifiques Port de Casablanca (ANP & Consignataires)
        $admin = User::create([
            'name' => 'Direction Régionale ANP Casablanca',
            'email' => 'admin@portcasablanca.ma',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'is_active' => true,
        ]);

        $agent = User::create([
            'name' => 'CMA CGM Maroc (Consignation Casablanca)',
            'email' => 'agent@portcasablanca.ma',
            'password' => Hash::make('password'),
            'role' => 'agent_maritime',
            'is_active' => true,
        ]);

        $capitainerie = User::create([
            'name' => 'Capitainerie du Port de Casablanca (VTS)',
            'email' => 'capitainerie@portcasablanca.ma',
            'password' => Hash::make('password'),
            'role' => 'capitainerie',
            'is_active' => true,
        ]);

        $somaport = User::create([
            'name' => 'Somaport Opérations Quai TC2',
            'email' => 'ops@somaport.ma',
            'password' => Hash::make('password'),
            'role' => 'agent_maritime',
            'is_active' => true,
        ]);

        // 2. Ports Réseau ANP Maroc
        $portCasa = Port::create(['code' => 'MACAS', 'nom' => 'Grand Port de Casablanca (ANP)', 'pays' => 'Maroc', 'is_active' => true]);
        $portTM = Port::create(['code' => 'MAPTM', 'nom' => 'Port Tanger Med', 'pays' => 'Maroc', 'is_active' => true]);
        $portJorf = Port::create(['code' => 'MAJOR', 'nom' => 'Port de Jorf Lasfar (OCP)', 'pays' => 'Maroc', 'is_active' => true]);
        $portAgadir = Port::create(['code' => 'MAAGA', 'nom' => 'Port d\'Agadir (ANP)', 'pays' => 'Maroc', 'is_active' => true]);

        // 3. Terminaux Réels du Port de Casablanca
        $termTc3 = Terminal::create(['port_id' => $portCasa->id, 'code' => 'TERM-CASA-TC3', 'nom' => 'Terminal à Conteneurs 3 (Marsa Maroc TC3)', 'type_terminal' => 'conteneurs', 'is_active' => true]);
        $termTc2 = Terminal::create(['port_id' => $portCasa->id, 'code' => 'TERM-CASA-TC2', 'nom' => 'Terminal à Conteneurs 2 (Somaport TC2)', 'type_terminal' => 'conteneurs', 'is_active' => true]);
        $termRoro = Terminal::create(['port_id' => $portCasa->id, 'code' => 'TERM-CASA-RORO', 'nom' => 'Terminal Roulier & Véhicules (Bassin Tarik)', 'type_terminal' => 'passagers', 'is_active' => true]);
        $termPhosphates = Terminal::create(['port_id' => $portCasa->id, 'code' => 'TERM-CASA-PHOSPHATES', 'nom' => 'Terminal Phosphates & Vracs Minéraliers (OCP)', 'type_terminal' => 'vraquier', 'is_active' => true]);
        $termPetrole = Terminal::create(['port_id' => $portCasa->id, 'code' => 'TERM-CASA-PETROLE', 'nom' => 'Terminal Hydrocarbures Jetée Moulay Youssef', 'type_terminal' => 'petrolier', 'is_active' => true]);
        $termTmTc1 = Terminal::create(['port_id' => $portTM->id, 'code' => 'TERM-TC1-TM', 'nom' => 'Terminal Conteneurs 1 Tanger Med', 'type_terminal' => 'conteneurs', 'is_active' => true]);

        // 4. Navires Réalistes Casablanca
        $nav1 = Navire::create(['imo' => '9367000', 'nom' => 'CMA CGM CASABLANCA', 'pavillon' => 'France', 'type_navire' => 'porte_conteneurs', 'longueur_m' => 260.0, 'tirant_eau_m' => 13.5, 'jauge_brute' => 54000, 'is_active' => true]);
        $nav2 = Navire::create(['imo' => '9247924', 'nom' => 'GRIMALDI GRANDE CASABLANCA', 'pavillon' => 'Italie', 'type_navire' => 'roulier', 'longueur_m' => 210.0, 'tirant_eau_m' => 9.8, 'jauge_brute' => 47000, 'is_active' => true]);
        $nav3 = Navire::create(['imo' => '9812345', 'nom' => 'OCP SIDI DAWI', 'pavillon' => 'Maroc', 'type_navire' => 'vraquier', 'longueur_m' => 190.0, 'tirant_eau_m' => 12.2, 'jauge_brute' => 38000, 'is_active' => true]);
        $nav4 = Navire::create(['imo' => '9789012', 'nom' => 'MARSA FEEDER', 'pavillon' => 'Maroc', 'type_navire' => 'porte_conteneurs', 'longueur_m' => 145.0, 'tirant_eau_m' => 8.5, 'jauge_brute' => 12500, 'is_active' => true]);
        $nav5 = Navire::create(['imo' => '9512340', 'nom' => 'ATLAS PETROLEUM', 'pavillon' => 'Panama', 'type_navire' => 'petrolier', 'longueur_m' => 183.0, 'tirant_eau_m' => 11.5, 'jauge_brute' => 29500, 'is_active' => true]);

        // 5. Visites Maritimes Port de Casablanca
        $v1 = VisiteMaritime::create([
            'numero_visite' => 'ESC-CASA-2026-001',
            'navire_id' => $nav1->id,
            'terminal_id' => $termTc3->id,
            'agent_id' => $agent->id,
            'date_arrivee_estimee' => now()->subHours(6),
            'date_depart_estimee' => now()->addHours(24),
            'date_arrivee_reelle' => now()->subHours(5)->addMinutes(20),
            'statut' => 'active',
        ]);

        $v2 = VisiteMaritime::create([
            'numero_visite' => 'ESC-CASA-2026-002',
            'navire_id' => $nav2->id,
            'terminal_id' => $termRoro->id,
            'agent_id' => $agent->id,
            'date_arrivee_estimee' => now()->addHours(14),
            'date_depart_estimee' => now()->addDays(2),
            'statut' => 'prevue',
        ]);

        $v3 = VisiteMaritime::create([
            'numero_visite' => 'ESC-CASA-2026-003',
            'navire_id' => $nav3->id,
            'terminal_id' => $termPhosphates->id,
            'agent_id' => $somaport->id,
            'date_arrivee_estimee' => now()->addDays(3),
            'date_depart_estimee' => now()->addDays(5),
            'statut' => 'prevue',
        ]);

        $v4 = VisiteMaritime::create([
            'numero_visite' => 'ESC-CASA-2026-004',
            'navire_id' => $nav5->id,
            'terminal_id' => $termPetrole->id,
            'agent_id' => $agent->id,
            'date_arrivee_estimee' => now()->subDays(4),
            'date_depart_estimee' => now()->subDays(2),
            'date_arrivee_reelle' => now()->subDays(4)->addMinutes(15),
            'date_depart_reelle' => now()->subDays(2)->subMinutes(15),
            'statut' => 'cloturee',
        ]);

        // 6. Demandes d'Accès Portuaire (DAP ANP Casablanca)
        DAP::create([
            'numero_dap' => 'DAP-CASA-2026-001',
            'visite_maritime_id' => $v1->id,
            'statut' => 'accepte',
            'date_demande' => now()->subDays(2),
            'date_traitement' => now()->subDay(),
            'remarques' => 'Demande prioritaire accostage TC3 Marsa Maroc (conteneurs frigorifiques)',
        ]);

        DAP::create([
            'numero_dap' => 'DAP-CASA-2026-002',
            'visite_maritime_id' => $v2->id,
            'statut' => 'envoye',
            'date_demande' => now()->subHours(10),
            'remarques' => 'Déchargement 450 véhicules neufs au Terminal Roulier Bassin Tarik',
        ]);

        DAP::create([
            'numero_dap' => 'DAP-CASA-2026-003',
            'visite_maritime_id' => $v3->id,
            'statut' => 'brouillon',
            'date_demande' => now()->subHours(2),
            'remarques' => 'Chargement 35 000 T acide phosphorique & engrais OCP',
        ]);

        DAP::create([
            'numero_dap' => 'DAP-CASA-2026-004',
            'visite_maritime_id' => $v4->id,
            'statut' => 'accepte',
            'date_demande' => now()->subDays(6),
            'date_traitement' => now()->subDays(5),
            'remarques' => 'Dépotage gasoil raffiné Jetée Moulay Youssef',
        ]);

        // 7. Audit Logs Casablanca
        AuditLog::create([
            'user_id' => $agent->id,
            'action' => 'CREATE',
            'entite_type' => 'VisiteMaritime',
            'entite_id' => $v1->id,
            'details' => ['escale' => 'ESC-CASA-2026-001', 'navire' => 'CMA CGM CASABLANCA', 'quai' => 'TC3 Marsa Maroc'],
            'ip_address' => '196.200.145.12',
        ]);

        AuditLog::create([
            'user_id' => $capitainerie->id,
            'action' => 'STATUS_CHANGE',
            'entite_type' => 'DAP',
            'entite_id' => 1,
            'details' => ['action' => 'Validation DAP Capitainerie Casablanca', 'statut' => 'accepte'],
            'ip_address' => '196.200.145.1',
        ]);

        AuditLog::create([
            'user_id' => $capitainerie->id,
            'action' => 'STATUS_CHANGE',
            'entite_type' => 'VisiteMaritime',
            'entite_id' => $v1->id,
            'details' => ['statut' => 'active', 'ata' => now()->subHours(5)->addMinutes(20)->toDateTimeString(), 'bassin' => 'Bassin Delpit TC3'],
            'ip_address' => '196.200.145.1',
        ]);
    }
}
