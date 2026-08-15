export type UserRole = 'admin' | 'agent_maritime' | 'capitainerie';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  telephone?: string;
  service?: string;
  permissions?: string[]; // Permissions personnalisées assignées spécifiquement à cet utilisateur
  created_at?: string;
  last_login_at?: string;
}

export interface Permission {
  id: string;
  code: string;
  module: string;
  label: string;
  description: string;
  roles: {
    admin: boolean;
    capitainerie: boolean;
    agent_maritime: boolean;
  };
}

export interface RoleInfo {
  role: UserRole;
  label: string;
  description: string;
  users_count: number;
  permissions: string[];
}

export interface Port {
  id: number;
  code: string;
  nom: string;
  pays: string;
  is_active: boolean;
  terminals_count?: number;
  terminals?: Terminal[];
  created_at?: string;
  updated_at?: string;
}

export interface Terminal {
  id: number;
  port_id: number;
  code: string;
  nom: string;
  type_terminal: 'conteneurs' | 'vraquier' | 'petrolier' | 'passagers' | 'polyvalent';
  is_active: boolean;
  port?: Port;
  created_at?: string;
  updated_at?: string;
}

export interface Navire {
  id: number;
  imo: string;
  nom: string;
  pavillon: string;
  type_navire: 'porte_conteneurs' | 'petrolier' | 'vraquier' | 'gazier' | 'roulier' | 'remorqueur';
  longueur_m: number;
  tirant_eau_m: number;
  jauge_brute: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export type StatutVisite = 'prevue' | 'active' | 'cloturee' | 'annulee';

export interface VisiteMaritime {
  id: number;
  numero_visite: string;
  navire_id: number;
  terminal_id: number;
  agent_id: number;
  date_arrivee_estimee: string;
  date_depart_estimee: string;
  date_arrivee_reelle?: string | null;
  date_depart_reelle?: string | null;
  statut: StatutVisite;
  motif_annulation?: string | null;
  navire?: Navire;
  terminal?: Terminal;
  agent?: User;
  dap?: DAP | null;
  created_at?: string;
  updated_at?: string;
}

export type StatutDAP = 'brouillon' | 'envoye' | 'accepte' | 'refuse';

export interface DAP {
  id: number;
  numero_dap: string;
  visite_maritime_id: number;
  statut: StatutDAP;
  date_demande: string;
  date_traitement?: string | null;
  remarques?: string | null;
  motif_refus?: string | null;
  visite_maritime?: VisiteMaritime;
  created_at?: string;
  updated_at?: string;
}

export interface AuditLog {
  id: number;
  user_id?: number | null;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'DEACTIVATE' | 'STATUS_CHANGE' | 'CANCEL' | 'CLOSE' | 'LOGIN' | 'LOGOUT' | 'PERMISSIONS_UPDATE';
  entite_type: string;
  entite_id?: number | null;
  details?: Record<string, any> | null;
  ip_address?: string | null;
  created_at: string;
  user?: User | null;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors: Record<string, string[]> | null;
}

export interface PaginatedData<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}
