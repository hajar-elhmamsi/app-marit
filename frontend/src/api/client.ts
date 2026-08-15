import axios, { AxiosError } from 'axios';
import { User, Port, Terminal, Navire, VisiteMaritime, DAP, AuditLog, ApiResponse, PaginatedData, Permission, RoleInfo, UserRole } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 4000,
});

// Intercepteur pour injecter le token Sanctum Bearer
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('maritime_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const ALL_PERMISSIONS: Permission[] = [
  { id: '1', module: 'Visites Maritimes Casablanca', code: 'visites.view', label: 'Consulter les escales', description: 'Accès en lecture aux mouvements et visites des navires au port de Casablanca', roles: { admin: true, capitainerie: true, agent_maritime: true } },
  { id: '2', module: 'Visites Maritimes Casablanca', code: 'visites.create', label: 'Déclarer une escale', description: 'Déclaration préalable d\'escale (ETA/ETD) à la capitainerie de Casablanca', roles: { admin: true, capitainerie: false, agent_maritime: true } },
  { id: '3', module: 'Visites Maritimes Casablanca', code: 'visites.activate', label: 'Activer l\'accostage (ATA)', description: 'Validation VTS de l\'entrée au bassin (Delpit / Moulay Youssef / TC3)', roles: { admin: true, capitainerie: true, agent_maritime: false } },
  { id: '4', module: 'Visites Maritimes Casablanca', code: 'visites.close', label: 'Clôturer le départ (ATD)', description: 'Validation de l\'appareillage en rade et clôture de l\'escale', roles: { admin: true, capitainerie: true, agent_maritime: false } },
  { id: '5', module: 'Visites Maritimes Casablanca', code: 'visites.cancel', label: 'Annuler une escale', description: 'Annulation formelle avec motif officiel (météo, déroutement)', roles: { admin: true, capitainerie: true, agent_maritime: true } },

  { id: '6', module: 'Demandes d\'Accès (DAP ANP)', code: 'dap.create', label: 'Générer une DAP ANP', description: 'Création de la Demande d\'Accès Portuaire conforme aux exigences ANP', roles: { admin: true, capitainerie: false, agent_maritime: true } },
  { id: '7', module: 'Demandes d\'Accès (DAP ANP)', code: 'dap.send', label: 'Transmettre la DAP', description: 'Transmission officielle aux officiers de la Capitainerie de Casablanca', roles: { admin: true, capitainerie: false, agent_maritime: true } },
  { id: '8', module: 'Demandes d\'Accès (DAP ANP)', code: 'dap.validate', label: 'Valider l\'accès (Autorisation)', description: 'Autorisation formelle de franchissement de passe et quai assigné', roles: { admin: true, capitainerie: true, agent_maritime: false } },
  { id: '9', module: 'Demandes d\'Accès (DAP ANP)', code: 'dap.refuse', label: 'Refuser la DAP', description: 'Rejet motivé de la demande (tirant d\'eau, quai non libéré)', roles: { admin: true, capitainerie: true, agent_maritime: false } },

  { id: '10', module: 'Flotte & Registre Navires', code: 'navires.view', label: 'Consulter la flotte', description: 'Consultation du registre des navires et caractéristiques IMO', roles: { admin: true, capitainerie: true, agent_maritime: true } },
  { id: '11', module: 'Flotte & Registre Navires', code: 'navires.manage', label: 'Gérer les navires (IMO)', description: 'Enregistrement et modification des fiches techniques navires', roles: { admin: true, capitainerie: true, agent_maritime: true } },

  { id: '12', module: 'Infrastructures Casablanca (ANP)', code: 'ports.manage', label: 'Gérer les ports du réseau ANP', description: 'Configuration des ports maritimes marocains et UN/LOCODE', roles: { admin: true, capitainerie: true, agent_maritime: false } },
  { id: '13', module: 'Infrastructures Casablanca (ANP)', code: 'terminals.manage', label: 'Gérer les terminaux de Casablanca', description: 'Gestion des postes d\'amarrage (TC3, TC2, Roulier, Phosphates, Pétrole)', roles: { admin: true, capitainerie: true, agent_maritime: false } },

  { id: '14', module: 'Traçabilité & Journal d\'Audit', code: 'audit.view', label: 'Consulter le journal d\'audit', description: 'Historique des opérations, décisions DAP et mouvements navires', roles: { admin: true, capitainerie: true, agent_maritime: false } },

  { id: '15', module: 'Administration & RBAC ANP', code: 'rbac.manage', label: 'Gérer les accès & agents agréés', description: 'Habilitation des consignataires, officiers de capitainerie et opérateurs', roles: { admin: true, capitainerie: false, agent_maritime: false } },
];

export const DEFAULT_ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  admin: ALL_PERMISSIONS.map((p) => p.code),
  capitainerie: [
    'visites.view', 'visites.activate', 'visites.close', 'visites.cancel',
    'dap.validate', 'dap.refuse',
    'navires.view', 'navires.manage',
    'ports.manage', 'terminals.manage',
    'audit.view',
  ],
  agent_maritime: [
    'visites.view', 'visites.create', 'visites.cancel',
    'dap.create', 'dap.send',
    'navires.view', 'navires.manage',
  ],
};

// Mock In-Memory State Spécifique Casablanca (ANP - Port de Casablanca)
let mockUsers: User[] = [
  {
    id: 1,
    name: 'Direction Régionale ANP Casablanca',
    email: 'admin@portcasablanca.ma',
    role: 'admin',
    is_active: true,
    telephone: '+212 5 22 23 45 00',
    service: 'Agence Nationale des Ports (ANP) - Direction Système',
    permissions: DEFAULT_ROLE_PERMISSIONS.admin,
    created_at: '2026-01-01 08:00',
    last_login_at: '2026-08-15 17:15',
  },
  {
    id: 2,
    name: 'CMA CGM Maroc (Consignation)',
    email: 'agent@portcasablanca.ma',
    role: 'agent_maritime',
    is_active: true,
    telephone: '+212 5 22 47 90 00',
    service: 'Agence Maritime & Consignation Casablanca (Bd des Almohades)',
    permissions: DEFAULT_ROLE_PERMISSIONS.agent_maritime,
    created_at: '2026-01-15 10:30',
    last_login_at: '2026-08-15 16:40',
  },
  {
    id: 3,
    name: 'Capitainerie du Port de Casablanca (VTS)',
    email: 'capitainerie@portcasablanca.ma',
    role: 'capitainerie',
    is_active: true,
    telephone: '+212 5 22 31 12 00',
    service: 'Capitainerie ANP • Contrôle Mouvements Rade & Bassins',
    permissions: DEFAULT_ROLE_PERMISSIONS.capitainerie,
    created_at: '2026-02-01 09:00',
    last_login_at: '2026-08-15 17:05',
  },
  {
    id: 4,
    name: 'Somaport Opérations Quai',
    email: 'ops@somaport.ma',
    role: 'agent_maritime',
    is_active: true,
    telephone: '+212 5 22 30 50 60',
    service: 'Manutention Terminal Conteneurs TC2 Casablanca',
    permissions: DEFAULT_ROLE_PERMISSIONS.agent_maritime,
    created_at: '2026-03-10 14:15',
    last_login_at: '2026-08-14 11:20',
  },
  {
    id: 5,
    name: 'Marsa Maroc TC3 Planning',
    email: 'planning.tc3@marsamaroc.co.ma',
    role: 'agent_maritime',
    is_active: true,
    telephone: '+212 5 22 31 20 20',
    service: 'Opérateur Terminal Conteneurs 3 (TC3) Marsa Maroc',
    permissions: DEFAULT_ROLE_PERMISSIONS.agent_maritime,
    created_at: '2026-04-05 11:00',
    last_login_at: '2026-08-15 08:30',
  }
];

let mockPorts: Port[] = [
  { id: 1, code: 'MACAS', nom: 'Grand Port de Casablanca (ANP)', pays: 'Maroc', is_active: true, terminals_count: 5 },
  { id: 2, code: 'MAPTM', nom: 'Port Tanger Med', pays: 'Maroc', is_active: true, terminals_count: 2 },
  { id: 3, code: 'MAJOR', nom: 'Port de Jorf Lasfar (OCP)', pays: 'Maroc', is_active: true, terminals_count: 2 },
  { id: 4, code: 'MAAGA', nom: 'Port d\'Agadir (ANP)', pays: 'Maroc', is_active: true, terminals_count: 2 },
  { id: 5, code: 'MANDR', nom: 'Port de Nador West Med', pays: 'Maroc', is_active: true, terminals_count: 1 },
];

let mockTerminals: Terminal[] = [
  { id: 1, port_id: 1, code: 'TERM-CASA-TC3', nom: 'Terminal à Conteneurs 3 (Marsa Maroc TC3)', type_terminal: 'conteneurs', is_active: true, port: mockPorts[0] },
  { id: 2, port_id: 1, code: 'TERM-CASA-TC2', nom: 'Terminal à Conteneurs 2 (Somaport TC2)', type_terminal: 'conteneurs', is_active: true, port: mockPorts[0] },
  { id: 3, port_id: 1, code: 'TERM-CASA-RORO', nom: 'Terminal Roulier & Véhicules (Bassin Tarik)', type_terminal: 'passagers', is_active: true, port: mockPorts[0] },
  { id: 4, port_id: 1, code: 'TERM-CASA-PHOSPHATES', nom: 'Terminal Phosphates & Vracs Minéraliers (OCP)', type_terminal: 'vraquier', is_active: true, port: mockPorts[0] },
  { id: 5, port_id: 1, code: 'TERM-CASA-PETROLE', nom: 'Terminal Hydrocarbures Jetée Moulay Youssef', type_terminal: 'petrolier', is_active: true, port: mockPorts[0] },
  { id: 6, port_id: 2, code: 'TERM-TC1-TM', nom: 'Terminal Conteneurs 1 Tanger Med', type_terminal: 'conteneurs', is_active: true, port: mockPorts[1] },
];

let mockNavires: Navire[] = [
  { id: 1, imo: '9367000', nom: 'CMA CGM CASABLANCA', pavillon: 'France', type_navire: 'porte_conteneurs', longueur_m: 260.0, tirant_eau_m: 13.5, jauge_brute: 54000, is_active: true },
  { id: 2, imo: '9247924', nom: 'GRIMALDI GRANDE CASABLANCA', pavillon: 'Italie', type_navire: 'roulier', longueur_m: 210.0, tirant_eau_m: 9.8, jauge_brute: 47000, is_active: true },
  { id: 3, imo: '9812345', nom: 'OCP SIDI DAWI', pavillon: 'Maroc', type_navire: 'vraquier', longueur_m: 190.0, tirant_eau_m: 12.2, jauge_brute: 38000, is_active: true },
  { id: 4, imo: '9789012', nom: 'MARSA FEEDER', pavillon: 'Maroc', type_navire: 'porte_conteneurs', longueur_m: 145.0, tirant_eau_m: 8.5, jauge_brute: 12500, is_active: true },
  { id: 5, imo: '9512340', nom: 'ATLAS PETROLEUM', pavillon: 'Panama', type_navire: 'petrolier', longueur_m: 183.0, tirant_eau_m: 11.5, jauge_brute: 29500, is_active: true },
  { id: 6, imo: '9654987', nom: 'TANGER-CASA EXPRESS', pavillon: 'Maroc', type_navire: 'passagers', longueur_m: 130.0, tirant_eau_m: 6.8, jauge_brute: 15000, is_active: true },
];

let mockDAPs: DAP[] = [
  { id: 1, numero_dap: 'DAP-CASA-2026-001', visite_maritime_id: 1, statut: 'accepte', date_demande: '2026-08-14 08:30', date_traitement: '2026-08-14 11:00', remarques: 'Demande prioritaire accostage TC3 Marsa Maroc (conteneurs frigorifiques)' },
  { id: 2, numero_dap: 'DAP-CASA-2026-002', visite_maritime_id: 2, statut: 'envoye', date_demande: '2026-08-15 10:00', remarques: 'Déchargement 450 véhicules neufs au Terminal Roulier Bassin Tarik' },
  { id: 3, numero_dap: 'DAP-CASA-2026-003', visite_maritime_id: 3, statut: 'brouillon', date_demande: '2026-08-15 15:30', remarques: 'Chargement 35 000 T acide phosphorique & engrais OCP' },
  { id: 4, numero_dap: 'DAP-CASA-2026-004', visite_maritime_id: 4, statut: 'accepte', date_demande: '2026-08-10 09:00', date_traitement: '2026-08-10 14:00', remarques: 'Dépotage gasoil raffiné Jetée Moulay Youssef' },
];

let mockVisites: VisiteMaritime[] = [
  {
    id: 1,
    numero_visite: 'ESC-CASA-2026-001',
    navire_id: 1,
    terminal_id: 1,
    agent_id: 2,
    date_arrivee_estimee: '2026-08-15 06:00',
    date_depart_estimee: '2026-08-16 22:00',
    date_arrivee_reelle: '2026-08-15 06:20',
    date_depart_reelle: null,
    statut: 'active',
    navire: mockNavires[0],
    terminal: mockTerminals[0],
    agent: mockUsers[1],
    dap: mockDAPs[0],
  },
  {
    id: 2,
    numero_visite: 'ESC-CASA-2026-002',
    navire_id: 2,
    terminal_id: 3,
    agent_id: 2,
    date_arrivee_estimee: '2026-08-16 14:00',
    date_depart_estimee: '2026-08-18 08:00',
    date_arrivee_reelle: null,
    date_depart_reelle: null,
    statut: 'prevue',
    navire: mockNavires[1],
    terminal: mockTerminals[2],
    agent: mockUsers[1],
    dap: mockDAPs[1],
  },
  {
    id: 3,
    numero_visite: 'ESC-CASA-2026-003',
    navire_id: 3,
    terminal_id: 4,
    agent_id: 4,
    date_arrivee_estimee: '2026-08-18 09:00',
    date_depart_estimee: '2026-08-20 18:00',
    date_arrivee_reelle: null,
    date_depart_reelle: null,
    statut: 'prevue',
    navire: mockNavires[2],
    terminal: mockTerminals[3],
    agent: mockUsers[3],
    dap: mockDAPs[2],
  },
  {
    id: 4,
    numero_visite: 'ESC-CASA-2026-004',
    navire_id: 5,
    terminal_id: 5,
    agent_id: 2,
    date_arrivee_estimee: '2026-08-11 07:00',
    date_depart_estimee: '2026-08-13 19:00',
    date_arrivee_reelle: '2026-08-11 07:15',
    date_depart_reelle: '2026-08-13 18:45',
    statut: 'cloturee',
    navire: mockNavires[4],
    terminal: mockTerminals[4],
    agent: mockUsers[1],
    dap: mockDAPs[3],
  },
];

let mockAuditLogs: AuditLog[] = [
  { id: 1, action: 'CREATE', entite_type: 'VisiteMaritime', entite_id: 1, created_at: '2026-08-14 08:30', user: mockUsers[1], ip_address: '196.200.145.12', details: { escale: 'ESC-CASA-2026-001', navire: 'CMA CGM CASABLANCA', quai: 'TC3 Marsa Maroc' } },
  { id: 2, action: 'CREATE', entite_type: 'DAP', entite_id: 1, created_at: '2026-08-14 08:30', user: mockUsers[1], ip_address: '196.200.145.12', details: { numero_dap: 'DAP-CASA-2026-001', port: 'Port de Casablanca (MACAS)' } },
  { id: 3, action: 'STATUS_CHANGE', entite_type: 'DAP', entite_id: 1, created_at: '2026-08-14 11:00', user: mockUsers[2], ip_address: '196.200.145.1', details: { action: 'Validation DAP Capitainerie Casablanca', statut: 'accepte' } },
  { id: 4, action: 'STATUS_CHANGE', entite_type: 'VisiteMaritime', entite_id: 1, created_at: '2026-08-15 06:20', user: mockUsers[2], ip_address: '196.200.145.1', details: { statut: 'active', ata: '2026-08-15 06:20', bassin: 'Bassin Delpit TC3' } },
];

function logAudit(action: AuditLog['action'], entiteType: string, entiteId: number, details?: Record<string, any>) {
  const currentTokenUser = localStorage.getItem('maritime_user');
  let actor = mockUsers[0];
  if (currentTokenUser) {
    try {
      actor = JSON.parse(currentTokenUser);
    } catch {}
  }
  const newLog: AuditLog = {
    id: mockAuditLogs.length + 1,
    action,
    entite_type: entiteType,
    entite_id: entiteId,
    user: actor,
    ip_address: '196.200.145.' + (10 + Math.floor(Math.random() * 50)),
    created_at: new Date().toISOString().replace('T', ' ').substring(0, 16),
    details,
  };
  mockAuditLogs.unshift(newLog);
}

export const maritimeService = {
  // Auth
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    try {
      const res = await api.post<ApiResponse<{ user: User; token: string }>>('/auth/login', { email, password });
      if (res.data?.data) return res.data.data;
    } catch {}

    const found = mockUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
    const user = found || mockUsers[0];
    return {
      user: {
        ...user,
        permissions: user.permissions || DEFAULT_ROLE_PERMISSIONS[user.role],
      },
      token: 'mock_token_' + user.role,
    };
  },

  // Stats Dashboard Spécifique Casablanca
  async getDashboardStats() {
    try {
      const res = await api.get<ApiResponse<any>>('/dashboard/stats');
      if (res.data?.data) return res.data.data;
    } catch {}

    const escalesActives = mockVisites.filter((v) => v.statut === 'active').length;
    const escalesPrevues = mockVisites.filter((v) => v.statut === 'prevue').length;
    const escalesCloturees = mockVisites.filter((v) => v.statut === 'cloturee').length;
    const dapEnAttente = mockDAPs.filter((d) => d.statut === 'envoye').length;

    return {
      kpis: {
        escales_actives: escalesActives,
        escales_prevues: escalesPrevues,
        escales_cloturees: escalesCloturees,
        dap_en_attente: dapEnAttente,
        total_navires: mockNavires.length,
        total_ports: mockPorts.length,
        total_terminaux: mockTerminals.length,
      },
      prochaines_escales: mockVisites.map((v) => ({
        ...v,
        navire: mockNavires.find((n) => n.id === v.navire_id),
        terminal: mockTerminals.find((t) => t.id === v.terminal_id),
        dap: mockDAPs.find((d) => d.visite_maritime_id === v.id),
      })),
      repartition_navires: [
        { type_navire: 'porte_conteneurs', total: 2 },
        { type_navire: 'roulier', total: 1 },
        { type_navire: 'vraquier', total: 1 },
        { type_navire: 'petrolier', total: 1 },
        { type_navire: 'passagers', total: 1 },
      ],
    };
  },

  // Utilisateurs & Permissions RBAC individuelles
  async getUsers(search = '', role = ''): Promise<User[]> {
    try {
      const res = await api.get<ApiResponse<User[]>>('/users', { params: { search, role } });
      if (res.data?.data) return res.data.data;
    } catch {}

    return mockUsers.map((u) => ({
      ...u,
      permissions: u.permissions || DEFAULT_ROLE_PERMISSIONS[u.role],
    })).filter((u) => {
      const matchSearch = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()) || (u.service && u.service.toLowerCase().includes(search.toLowerCase()));
      const matchRole = !role || role === 'all' || u.role === role;
      return matchSearch && matchRole;
    });
  },

  async createUser(data: Partial<User> & { password?: string }): Promise<User> {
    try {
      const res = await api.post<ApiResponse<User>>('/users', data);
      if (res.data?.data) return res.data.data;
    } catch {}

    const role = data.role || 'agent_maritime';
    const newUser: User = {
      id: mockUsers.length + 1,
      name: data.name || 'Nouvel Utilisateur Port Casablanca',
      email: data.email || `user${mockUsers.length + 1}@portcasablanca.ma`,
      role: role,
      is_active: data.is_active ?? true,
      telephone: data.telephone || '+212 5 22 00 00 00',
      service: data.service || 'Consignation Portuaire Casablanca',
      permissions: data.permissions || DEFAULT_ROLE_PERMISSIONS[role],
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 16),
      last_login_at: 'Jamais',
    };
    mockUsers.unshift(newUser);
    logAudit('CREATE', 'User', newUser.id, { nom: newUser.name, email: newUser.email, role: newUser.role });
    return newUser;
  },

  async updateUser(id: number, data: Partial<User>): Promise<User> {
    try {
      const res = await api.put<ApiResponse<User>>(`/users/${id}`, data);
      if (res.data?.data) return res.data.data;
    } catch {}

    const index = mockUsers.findIndex((u) => u.id === id);
    if (index !== -1) {
      mockUsers[index] = { ...mockUsers[index], ...data };
      logAudit('UPDATE', 'User', id, { modifications: data });
      return mockUsers[index];
    }
    throw new Error('Utilisateur non trouvé');
  },

  async updateUserPermissions(id: number, permissions: string[]): Promise<User> {
    try {
      const res = await api.post<ApiResponse<User>>(`/users/${id}/permissions`, { permissions });
      if (res.data?.data) return res.data.data;
    } catch {}

    const user = mockUsers.find((u) => u.id === id);
    if (!user) throw new Error('Utilisateur non trouvé');
    user.permissions = permissions;
    logAudit('PERMISSIONS_UPDATE', 'User', id, { permissions_count: permissions.length, permissions });
    return user;
  },

  async toggleUserStatus(id: number): Promise<User> {
    const user = mockUsers.find((u) => u.id === id);
    if (!user) throw new Error('Utilisateur introuvable');
    user.is_active = !user.is_active;
    logAudit('STATUS_CHANGE', 'User', id, { nouveau_statut: user.is_active ? 'actif' : 'inactif' });
    return user;
  },

  async deleteUser(id: number): Promise<void> {
    mockUsers = mockUsers.filter((u) => u.id !== id);
    logAudit('DELETE', 'User', id, { motif: 'Suppression définitive compte' });
  },

  async getRBACPermissions(): Promise<Permission[]> {
    return ALL_PERMISSIONS;
  },

  async getRolesSummary(): Promise<RoleInfo[]> {
    return [
      {
        role: 'admin',
        label: 'Direction Régionale ANP Casablanca',
        description: 'Administration globale du système portuaire, supervision du réseau des ports marocains, audit des escales et paramétrage des accès.',
        users_count: mockUsers.filter((u) => u.role === 'admin').length,
        permissions: DEFAULT_ROLE_PERMISSIONS.admin,
      },
      {
        role: 'capitainerie',
        label: 'Capitainerie du Port de Casablanca (VTS)',
        description: 'Gestion de la rade et des bassins (Delpit / Tarik / Moulay Youssef), instruction et validation des DAP, affectation des postes à quai et enregistrement ATA/ATD.',
        users_count: mockUsers.filter((u) => u.role === 'capitainerie').length,
        permissions: DEFAULT_ROLE_PERMISSIONS.capitainerie,
      },
      {
        role: 'agent_maritime',
        label: 'Agent Maritime & Consignataire Agréé ANP',
        description: 'Représentation des armateurs (CMA CGM, Grimaldi, OCP), déclaration préalable des escales et transmission des demandes d\'accès portuaire (DAP).',
        users_count: mockUsers.filter((u) => u.role === 'agent_maritime').length,
        permissions: DEFAULT_ROLE_PERMISSIONS.agent_maritime,
      },
    ];
  },

  // Ports
  async getPorts(search = '', is_active?: boolean): Promise<Port[]> {
    try {
      const res = await api.get<ApiResponse<PaginatedData<Port>>>('/ports', { params: { search, is_active } });
      if (res.data?.data?.data) return res.data.data.data;
    } catch {}

    return mockPorts.filter((p) => {
      const sMatch = !search || p.code.toLowerCase().includes(search.toLowerCase()) || p.nom.toLowerCase().includes(search.toLowerCase());
      const aMatch = is_active === undefined || p.is_active === is_active;
      return sMatch && aMatch;
    });
  },

  async createPort(data: Partial<Port>): Promise<Port> {
    try {
      const res = await api.post<ApiResponse<Port>>('/ports', data);
      if (res.data?.data) return res.data.data;
    } catch {}

    const newPort: Port = {
      id: mockPorts.length + 1,
      code: data.code || 'UNKNW',
      nom: data.nom || 'Nouveau Port Marocain',
      pays: data.pays || 'Maroc',
      is_active: data.is_active ?? true,
      terminals_count: 0,
    };
    mockPorts.unshift(newPort);
    logAudit('CREATE', 'Port', newPort.id, { code: newPort.code, nom: newPort.nom });
    return newPort;
  },

  async updatePort(id: number, data: Partial<Port>): Promise<Port> {
    try {
      const res = await api.put<ApiResponse<Port>>(`/ports/${id}`, data);
      if (res.data?.data) return res.data.data;
    } catch {}

    const p = mockPorts.find((port) => port.id === id);
    if (p) {
      Object.assign(p, data);
      logAudit('UPDATE', 'Port', id, data);
      return p;
    }
    throw new Error('Port introuvable');
  },

  async togglePortActive(id: number): Promise<Port> {
    const p = mockPorts.find((port) => port.id === id);
    if (!p) throw new Error('Port introuvable');
    p.is_active = !p.is_active;
    logAudit('STATUS_CHANGE', 'Port', id, { is_active: p.is_active });
    return p;
  },

  // Terminaux
  async getTerminals(port_id?: number, search = ''): Promise<Terminal[]> {
    try {
      const res = await api.get<ApiResponse<PaginatedData<Terminal>>>('/terminals', { params: { port_id, search } });
      if (res.data?.data?.data) return res.data.data.data;
    } catch {}

    return mockTerminals.map((t) => ({
      ...t,
      port: mockPorts.find((p) => p.id === t.port_id),
    })).filter((t) => {
      const pMatch = !port_id || t.port_id === port_id;
      const sMatch = !search || t.nom.toLowerCase().includes(search.toLowerCase()) || t.code.toLowerCase().includes(search.toLowerCase());
      return pMatch && sMatch;
    });
  },

  async createTerminal(data: Partial<Terminal>): Promise<Terminal> {
    try {
      const res = await api.post<ApiResponse<Terminal>>('/terminals', data);
      if (res.data?.data) return res.data.data;
    } catch {}

    const newTerm: Terminal = {
      id: mockTerminals.length + 1,
      port_id: data.port_id || 1,
      code: data.code || 'TERM-CASA-NEW',
      nom: data.nom || 'Nouveau Poste d\'Accostage Casablanca',
      type_terminal: data.type_terminal || 'conteneurs',
      is_active: data.is_active ?? true,
      port: mockPorts.find((p) => p.id === (data.port_id || 1)),
    };
    mockTerminals.unshift(newTerm);
    logAudit('CREATE', 'Terminal', newTerm.id, { code: newTerm.code, nom: newTerm.nom });
    return newTerm;
  },

  // Navires
  async getNavires(search = '', type_navire = ''): Promise<Navire[]> {
    try {
      const res = await api.get<ApiResponse<PaginatedData<Navire>>>('/navires', { params: { search, type_navire } });
      if (res.data?.data?.data) return res.data.data.data;
    } catch {}

    return mockNavires.filter((n) => {
      const sMatch = !search || n.nom.toLowerCase().includes(search.toLowerCase()) || n.imo.includes(search);
      const tMatch = !type_navire || n.type_navire === type_navire;
      return sMatch && tMatch;
    });
  },

  async createNavire(data: Partial<Navire>): Promise<Navire> {
    try {
      const res = await api.post<ApiResponse<Navire>>('/navires', data);
      if (res.data?.data) return res.data.data;
    } catch {}

    const newNav: Navire = {
      id: mockNavires.length + 1,
      imo: data.imo || '0000000',
      nom: data.nom || 'NOUVEAU NAVIRE CASABLANCA',
      pavillon: data.pavillon || 'Maroc',
      type_navire: data.type_navire || 'porte_conteneurs',
      longueur_m: data.longueur_m || 200,
      tirant_eau_m: data.tirant_eau_m || 10,
      jauge_brute: data.jauge_brute || 50000,
      is_active: data.is_active ?? true,
    };
    mockNavires.unshift(newNav);
    logAudit('CREATE', 'Navire', newNav.id, { imo: newNav.imo, nom: newNav.nom });
    return newNav;
  },

  // Visites Maritimes
  async getVisites(statut = '', search = ''): Promise<VisiteMaritime[]> {
    try {
      const res = await api.get<ApiResponse<PaginatedData<VisiteMaritime>>>('/visites', { params: { statut, search } });
      if (res.data?.data?.data) return res.data.data.data;
    } catch {}

    return mockVisites.map((v) => ({
      ...v,
      navire: mockNavires.find((n) => n.id === v.navire_id),
      terminal: {
        ...mockTerminals.find((t) => t.id === v.terminal_id)!,
        port: mockPorts.find((p) => p.id === mockTerminals.find((t) => t.id === v.terminal_id)?.port_id),
      },
      agent: mockUsers.find((u) => u.id === v.agent_id),
      dap: mockDAPs.find((d) => d.visite_maritime_id === v.id),
    })).filter((v) => {
      const stMatch = !statut || v.statut === statut;
      const srMatch = !search || v.numero_visite.toLowerCase().includes(search.toLowerCase()) || v.navire?.nom.toLowerCase().includes(search.toLowerCase());
      return stMatch && srMatch;
    });
  },

  async createVisite(data: Partial<VisiteMaritime>): Promise<VisiteMaritime> {
    try {
      const res = await api.post<ApiResponse<VisiteMaritime>>('/visites', data);
      if (res.data?.data) return res.data.data;
    } catch {}

    const newId = mockVisites.length + 1;
    const numEscale = `ESC-CASA-2026-${String(newId).padStart(3, '0')}`;
    const numDap = `DAP-CASA-2026-${String(newId).padStart(3, '0')}`;

    const newDap: DAP = {
      id: mockDAPs.length + 1,
      numero_dap: numDap,
      visite_maritime_id: newId,
      statut: 'brouillon',
      date_demande: new Date().toISOString().replace('T', ' ').substring(0, 16),
      remarques: 'Demande DAP ANP générée automatiquement',
    };
    mockDAPs.unshift(newDap);

    const newVisite: VisiteMaritime = {
      id: newId,
      numero_visite: numEscale,
      navire_id: data.navire_id || 1,
      terminal_id: data.terminal_id || 1,
      agent_id: 2,
      date_arrivee_estimee: data.date_arrivee_estimee || '2026-08-20 08:00',
      date_depart_estimee: data.date_depart_estimee || '2026-08-22 18:00',
      statut: 'prevue',
      navire: mockNavires.find((n) => n.id === data.navire_id) || mockNavires[0],
      terminal: mockTerminals.find((t) => t.id === data.terminal_id) || mockTerminals[0],
      agent: mockUsers[1],
      dap: newDap,
    };
    mockVisites.unshift(newVisite);
    logAudit('CREATE', 'VisiteMaritime', newId, { numero: numEscale, navire: newVisite.navire?.nom, port: 'Port de Casablanca (MACAS)' });
    return newVisite;
  },

  async activerVisite(id: number, dateArriveeReelle: string): Promise<VisiteMaritime> {
    try {
      const res = await api.post<ApiResponse<VisiteMaritime>>(`/visites/${id}/activer`, { date_arrivee_reelle: dateArriveeReelle });
      if (res.data?.data) return res.data.data;
    } catch {}

    const visite = mockVisites.find((v) => v.id === id)!;
    visite.statut = 'active';
    visite.date_arrivee_reelle = dateArriveeReelle;
    logAudit('STATUS_CHANGE', 'VisiteMaritime', id, { statut_precedent: 'prevue', nouveau_statut: 'active', ata: dateArriveeReelle, port: 'Port de Casablanca' });
    return visite;
  },

  async cloturerVisite(id: number, dateDepartReelle: string): Promise<VisiteMaritime> {
    try {
      const res = await api.post<ApiResponse<VisiteMaritime>>(`/visites/${id}/cloturer`, { date_depart_reelle: dateDepartReelle });
      if (res.data?.data) return res.data.data;
    } catch {}

    const visite = mockVisites.find((v) => v.id === id)!;
    visite.statut = 'cloturee';
    visite.date_depart_reelle = dateDepartReelle;
    logAudit('STATUS_CHANGE', 'VisiteMaritime', id, { statut_precedent: 'active', nouveau_statut: 'cloturee', atd: dateDepartReelle, port: 'Port de Casablanca' });
    return visite;
  },

  async annulerVisite(id: number, motifAnnulation: string): Promise<VisiteMaritime> {
    try {
      const res = await api.post<ApiResponse<VisiteMaritime>>(`/visites/${id}/annuler`, { motif_annulation: motifAnnulation });
      if (res.data?.data) return res.data.data;
    } catch {}

    const visite = mockVisites.find((v) => v.id === id)!;
    visite.statut = 'annulee';
    visite.motif_annulation = motifAnnulation;
    logAudit('CANCEL', 'VisiteMaritime', id, { statut_precedent: 'prevue', nouveau_statut: 'annulee', motif_annulation: motifAnnulation });
    return visite;
  },

  // DAP
  async getDAPs(statut = '', search = ''): Promise<DAP[]> {
    try {
      const res = await api.get<ApiResponse<PaginatedData<DAP>>>('/daps', { params: { statut, search } });
      if (res.data?.data?.data) return res.data.data.data;
    } catch {}

    return mockDAPs.map((d) => {
      const v = mockVisites.find((vis) => vis.id === d.visite_maritime_id);
      return { ...d, visite_maritime: v };
    }).filter((d) => {
      const stMatch = !statut || d.statut === statut;
      const srMatch = !search || d.numero_dap.toLowerCase().includes(search.toLowerCase()) || d.visite_maritime?.navire?.nom.toLowerCase().includes(search.toLowerCase());
      return stMatch && srMatch;
    });
  },

  async envoyerDAP(id: number, remarques?: string): Promise<DAP> {
    try {
      const res = await api.post<ApiResponse<DAP>>(`/daps/${id}/envoyer`, { remarques });
      if (res.data?.data) return res.data.data;
    } catch {}

    const dap = mockDAPs.find((d) => d.id === id)!;
    dap.statut = 'envoye';
    if (remarques) dap.remarques = remarques;
    logAudit('STATUS_CHANGE', 'DAP', id, { statut_precedent: 'brouillon', nouveau_statut: 'envoye', port: 'Port de Casablanca' });
    return dap;
  },

  async accepterDAP(id: number): Promise<DAP> {
    try {
      const res = await api.post<ApiResponse<DAP>>(`/daps/${id}/accepter`);
      if (res.data?.data) return res.data.data;
    } catch {}

    const dap = mockDAPs.find((d) => d.id === id)!;
    dap.statut = 'accepte';
    dap.date_traitement = new Date().toISOString().replace('T', ' ').substring(0, 16);
    dap.motif_refus = null;
    logAudit('STATUS_CHANGE', 'DAP', id, { statut_precedent: 'envoye', nouveau_statut: 'accepte', decision: 'Autorisation d\'accostage validée par Capitainerie Casablanca' });
    return dap;
  },

  async refuserDAP(id: number, motifRefus: string): Promise<DAP> {
    try {
      const res = await api.post<ApiResponse<DAP>>(`/daps/${id}/refuser`, { motif_refus: motifRefus });
      if (res.data?.data) return res.data.data;
    } catch {}

    const dap = mockDAPs.find((d) => d.id === id)!;
    dap.statut = 'refuse';
    dap.date_traitement = new Date().toISOString().replace('T', ' ').substring(0, 16);
    dap.motif_refus = motifRefus;
    logAudit('STATUS_CHANGE', 'DAP', id, { statut_precedent: 'envoye', nouveau_statut: 'refuse', motif_refus: motifRefus });
    return dap;
  },

  // Audit
  async getAuditLogs(action = '', entiteType = ''): Promise<AuditLog[]> {
    try {
      const res = await api.get<ApiResponse<PaginatedData<AuditLog>>>('/audit-logs', { params: { action, entite_type: entiteType } });
      if (res.data?.data?.data) return res.data.data.data;
    } catch {}

    return mockAuditLogs.filter((l) => {
      const aMatch = !action || l.action === action;
      const eMatch = !entiteType || l.entite_type === entiteType;
      return aMatch && eMatch;
    });
  }
};
