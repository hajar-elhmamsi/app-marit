import React, { useEffect, useState } from 'react';
import { maritimeService, ALL_PERMISSIONS, DEFAULT_ROLE_PERMISSIONS } from '../api/client';
import { User, Permission, RoleInfo, UserRole } from '../types';
import { Badge } from '../components/UI/Badge';
import { Modal } from '../components/UI/Modal';
import { ConfirmDialog } from '../components/UI/ConfirmDialog';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  Plus,
  Search,
  Edit2,
  Power,
  Trash2,
  KeyRound,
  CheckCircle2,
  XCircle,
  Filter,
  RefreshCw,
  Phone,
  Briefcase,
  Users,
  Shield,
  RotateCcw,
  Check,
  X
} from 'lucide-react';

export const AuthRBACPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'matrix' | 'roles'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [rolesSummary, setRolesSummary] = useState<RoleInfo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('all');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  
  // Individual User Permissions Modal
  const [permissionTargetUser, setPermissionTargetUser] = useState<User | null>(null);
  const [customUserPerms, setCustomUserPerms] = useState<string[]>([]);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'agent_maritime' as UserRole,
    telephone: '',
    service: '',
    is_active: true,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const { showToast } = useToast();
  const { user: loggedInUser, refreshUser } = useAuth();

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersList, permsList, rolesList] = await Promise.all([
        maritimeService.getUsers(search, selectedRoleFilter),
        maritimeService.getRBACPermissions(),
        maritimeService.getRolesSummary(),
      ]);
      setUsers(usersList);
      setPermissions(permsList);
      setRolesSummary(rolesList);
    } catch (err) {
      showToast('Impossible de charger les données RBAC', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedRoleFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = 'Le nom complet est obligatoire.';
    if (!formData.email.trim()) errors.email = 'L\'adresse email est obligatoire.';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Format email invalide.';

    if (!editingUser && (!formData.password || formData.password.length < 6)) {
      errors.password = 'Le mot de passe doit comporter au moins 6 caractères.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenCreate = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'agent_maritime',
      telephone: '',
      service: '',
      is_active: true,
    });
    setFormErrors({});
    setIsCreateModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      telephone: user.telephone || '',
      service: user.service || '',
      is_active: user.is_active,
    });
    setFormErrors({});
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      if (editingUser) {
        await maritimeService.updateUser(editingUser.id, {
          name: formData.name,
          email: formData.email,
          role: formData.role,
          telephone: formData.telephone,
          service: formData.service,
          is_active: formData.is_active,
        });
        showToast(`Compte "${formData.name}" mis à jour avec succès.`, 'success', 'Utilisateur Modifié');
        setEditingUser(null);
      } else {
        await maritimeService.createUser(formData);
        showToast(`Compte "${formData.name}" créé avec le rôle ${formData.role}.`, 'success', 'Compte Créé');
        setIsCreateModalOpen(false);
      }
      loadData();
    } catch (err) {
      showToast('Erreur lors de l\'enregistrement de l\'utilisateur.', 'error');
    }
  };

  const handleToggleStatus = async (user: User) => {
    try {
      await maritimeService.toggleUserStatus(user.id);
      const newStatus = !user.is_active ? 'activé' : 'désactivé';
      showToast(`Le compte de ${user.name} a été ${newStatus}.`, 'info', 'Statut Compte');
      loadData();
    } catch (err) {
      showToast('Erreur lors du changement de statut.', 'error');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingUser) return;
    try {
      await maritimeService.deleteUser(deletingUser.id);
      showToast(`Le compte ${deletingUser.name} a été supprimé.`, 'info', 'Compte Supprimé');
      setDeletingUser(null);
      loadData();
    } catch (err) {
      showToast('Erreur lors de la suppression.', 'error');
    }
  };

  // --- Gestion Granulaire des Permissions par Utilisateur ---
  const handleOpenPermissionsModal = (user: User) => {
    setPermissionTargetUser(user);
    const userPerms = user.permissions && user.permissions.length > 0
      ? [...user.permissions]
      : [...(DEFAULT_ROLE_PERMISSIONS[user.role] || [])];
    setCustomUserPerms(userPerms);
  };

  const handleToggleSinglePermission = (permCode: string) => {
    setCustomUserPerms((prev) =>
      prev.includes(permCode) ? prev.filter((p) => p !== permCode) : [...prev, permCode]
    );
  };

  const handlePresetResetToRole = () => {
    if (!permissionTargetUser) return;
    setCustomUserPerms([...DEFAULT_ROLE_PERMISSIONS[permissionTargetUser.role]]);
    showToast(`Permissions réinitialisées selon le rôle standard (${permissionTargetUser.role}).`, 'info', 'Profil Rôle');
  };

  const handlePresetGrantAll = () => {
    setCustomUserPerms(ALL_PERMISSIONS.map((p) => p.code));
    showToast('Toutes les permissions ont été cochées pour cet utilisateur.', 'info', 'Accès Total');
  };

  const handlePresetReadOnly = () => {
    setCustomUserPerms(['visites.view', 'navires.view', 'audit.view']);
    showToast('Permissions limitées à la consultation (Lecture seule).', 'info', 'Lecture Seule');
  };

  const handleSaveUserPermissions = async () => {
    if (!permissionTargetUser) return;
    try {
      await maritimeService.updateUserPermissions(permissionTargetUser.id, customUserPerms);
      showToast(`Droits mis à jour pour ${permissionTargetUser.name} (${customUserPerms.length} permissions accordées).`, 'success', 'Permissions Enregistrées');
      
      // Si l'administrateur a modifié son propre profil, rafraîchir la session active
      if (loggedInUser?.id === permissionTargetUser.id) {
        refreshUser();
      }

      setPermissionTargetUser(null);
      loadData();
    } catch (err) {
      showToast('Erreur lors de la mise à jour des droits.', 'error');
    }
  };

  const counts = {
    all: users.length,
    admin: users.filter((u) => u.role === 'admin').length,
    capitainerie: users.filter((u) => u.role === 'capitainerie').length,
    agent: users.filter((u) => u.role === 'agent_maritime').length,
  };

  // Grouper les permissions par module pour un affichage hiérarchique clair
  const groupedPermissions = permissions.reduce<Record<string, Permission[]>>((acc, perm) => {
    if (!acc[perm.module]) acc[perm.module] = [];
    acc[perm.module].push(perm);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-[#172B4D]">Gestion des Accès & Rôles (RBAC)</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#EAF4FB] text-[#0B4F8A] border border-blue-200">
              Contrôle Granulaire
            </span>
          </div>
          <p className="text-sm text-[#64748B] mt-0.5">
            Gestion individuelle des permissions et assignation des privilèges portuaires pour chaque utilisateur
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0B4F8A] hover:bg-[#083B68] text-white font-semibold text-sm rounded-lg shadow-sm transition-colors self-start sm:self-auto"
        >
          <Plus size={18} />
          <span>Nouvel utilisateur</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-[#E2E8F0] space-x-4">
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'users'
              ? 'border-[#0B4F8A] text-[#0B4F8A]'
              : 'border-transparent text-[#64748B] hover:text-[#172B4D]'
          }`}
        >
          <Users size={16} />
          <span>Utilisateurs & Droits par Compte ({counts.all})</span>
        </button>

        <button
          onClick={() => setActiveTab('matrix')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'matrix'
              ? 'border-[#0B4F8A] text-[#0B4F8A]'
              : 'border-transparent text-[#64748B] hover:text-[#172B4D]'
          }`}
        >
          <ShieldCheck size={16} />
          <span>Matrice Globale des Droits</span>
        </button>

        <button
          onClick={() => setActiveTab('roles')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'roles'
              ? 'border-[#0B4F8A] text-[#0B4F8A]'
              : 'border-transparent text-[#64748B] hover:text-[#172B4D]'
          }`}
        >
          <KeyRound size={16} />
          <span>Définition des Rôles (3)</span>
        </button>
      </div>

      {/* TAB 1 : UTILISATEURS & COMPTES */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* Quick Role Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-sm">
              <div className="text-xs font-semibold text-[#64748B]">Total Comptes</div>
              <div className="text-2xl font-bold text-[#123B63] mt-1">{counts.all}</div>
            </div>

            <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-sm">
              <div className="text-xs font-semibold text-[#0B4F8A]">Administrateurs</div>
              <div className="text-2xl font-bold text-[#0B4F8A] mt-1">{counts.admin}</div>
            </div>

            <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-sm">
              <div className="text-xs font-semibold text-[#0369A1]">Capitainerie</div>
              <div className="text-2xl font-bold text-[#0369A1] mt-1">{counts.capitainerie}</div>
            </div>

            <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-sm">
              <div className="text-xs font-semibold text-[#475569]">Agents Maritimes</div>
              <div className="text-2xl font-bold text-[#172B4D] mt-1">{counts.agent}</div>
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher par nom, email, service..."
                className="w-full pl-10 pr-4 py-2 bg-white border border-[#CBD5E1] rounded-lg text-sm text-[#172B4D] placeholder-[#94A3B8] focus:outline-none focus:border-[#0B4F8A] focus:ring-1 focus:ring-[#0B4F8A]"
              />
            </form>

            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
              <div className="flex items-center gap-2 bg-[#F8FAFC] px-3 py-1.5 rounded-lg border border-[#E2E8F0] text-xs">
                <Filter size={14} className="text-[#0B4F8A]" />
                <span className="text-[#64748B] font-medium">Rôle :</span>
                <select
                  value={selectedRoleFilter}
                  onChange={(e) => setSelectedRoleFilter(e.target.value)}
                  className="bg-transparent text-[#172B4D] font-semibold focus:outline-none cursor-pointer"
                >
                  <option value="all">Tous les rôles</option>
                  <option value="admin">Administrateurs</option>
                  <option value="capitainerie">Capitainerie</option>
                  <option value="agent_maritime">Agents Maritimes</option>
                </select>
              </div>

              <button
                onClick={loadData}
                className="p-2 rounded-lg bg-white border border-[#CBD5E1] text-[#64748B] hover:text-[#0B4F8A] hover:border-[#0B4F8A] transition-colors"
                title="Rafraîchir"
              >
                <RefreshCw size={16} />
              </button>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-[#172B4D]">
                <thead className="bg-[#F8FAFC] text-xs font-semibold text-[#64748B] uppercase tracking-wider border-b border-[#E2E8F0]">
                  <tr>
                    <th className="px-5 py-3.5">Utilisateur</th>
                    <th className="px-5 py-3.5">Rôle Principal</th>
                    <th className="px-5 py-3.5">Droits Accordés</th>
                    <th className="px-5 py-3.5">Service & Contact</th>
                    <th className="px-5 py-3.5">Statut</th>
                    <th className="px-5 py-3.5 text-right">Gestion des Accès</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9] font-medium">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-[#64748B]">
                        Chargement des utilisateurs...
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-[#94A3B8]">
                        Aucun utilisateur trouvé.
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => {
                      const userPermCount = user.permissions?.length || DEFAULT_ROLE_PERMISSIONS[user.role]?.length || 0;
                      return (
                        <tr key={user.id} className="hover:bg-[#F8FAFC] transition-colors">
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-[#EAF4FB] text-[#0B4F8A] font-bold flex items-center justify-center text-xs flex-shrink-0 border border-blue-200">
                                {user.name.charAt(0)}
                              </div>
                              <div>
                                <div className="font-bold text-[#172B4D]">{user.name}</div>
                                <div className="text-xs text-[#64748B] font-mono">{user.email}</div>
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-3.5">
                            <Badge type="role" status={user.role} />
                          </td>

                          <td className="px-5 py-3.5 text-xs">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#F8FAFC] text-[#0B4F8A] border border-blue-100 font-semibold">
                              <Shield size={13} className="text-[#0B4F8A]" />
                              <span>{userPermCount} / {ALL_PERMISSIONS.length} privilèges</span>
                            </span>
                          </td>

                          <td className="px-5 py-3.5 text-xs text-[#475569]">
                            <div>{user.service || 'Non renseigné'}</div>
                            <div className="text-[#94A3B8] font-mono text-[11px] mt-0.5">{user.telephone || '—'}</div>
                          </td>

                          <td className="px-5 py-3.5">
                            <Badge type="active" status={user.is_active} />
                          </td>

                          <td className="px-5 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {/* Bouton Clé: Gérer les permissions individuelles */}
                              <button
                                onClick={() => handleOpenPermissionsModal(user)}
                                className="px-2.5 py-1 text-xs font-semibold rounded-md bg-[#EAF4FB] text-[#0B4F8A] hover:bg-blue-100 border border-blue-200 flex items-center gap-1.5 transition-colors shadow-sm"
                                title="Gérer les droits et permissions de cet utilisateur"
                              >
                                <KeyRound size={13} />
                                <span>Gérer Droits</span>
                              </button>

                              <button
                                onClick={() => handleOpenEdit(user)}
                                className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0B4F8A] hover:bg-[#EAF4FB] transition-colors"
                                title="Modifier les informations"
                              >
                                <Edit2 size={16} />
                              </button>

                              <button
                                onClick={() => handleToggleStatus(user)}
                                className={`p-1.5 rounded-lg transition-colors ${
                                  user.is_active
                                    ? 'text-[#64748B] hover:text-[#DC2626] hover:bg-[#FEE2E2]'
                                    : 'text-[#64748B] hover:text-[#16A34A] hover:bg-[#DCFCE7]'
                                }`}
                                title={user.is_active ? 'Désactiver le compte' : 'Activer le compte'}
                              >
                                <Power size={16} />
                              </button>

                              {user.id !== 1 && (
                                <button
                                  onClick={() => setDeletingUser(user)}
                                  className="p-1.5 rounded-lg text-[#64748B] hover:text-[#DC2626] hover:bg-[#FEE2E2] transition-colors"
                                  title="Supprimer définitivement"
                                >
                                  <Trash2 size={16} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2 : MATRICE DES DROITS & PRIVILÈGES */}
      {activeTab === 'matrix' && (
        <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-[#E2E8F0]">
            <h2 className="text-base font-bold text-[#172B4D]">Matrice des Permissions RBAC</h2>
            <p className="text-xs text-[#64748B] mt-0.5">
              Habilitations opérationnelles par rôle selon les spécifications portuaires
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-[#172B4D]">
              <thead className="bg-[#F8FAFC] text-xs font-semibold text-[#64748B] uppercase tracking-wider border-b border-[#E2E8F0]">
                <tr>
                  <th className="px-5 py-3.5">Module Métier</th>
                  <th className="px-5 py-3.5">Action & Permission</th>
                  <th className="px-5 py-3.5">Description</th>
                  <th className="px-5 py-3.5 text-center">Administrateur</th>
                  <th className="px-5 py-3.5 text-center">Capitainerie</th>
                  <th className="px-5 py-3.5 text-center">Agent Maritime</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9] font-medium">
                {permissions.map((perm) => (
                  <tr key={perm.id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="px-5 py-3.5 font-bold text-[#0B4F8A]">
                      {perm.module}
                    </td>

                    <td className="px-5 py-3.5">
                      <div className="font-bold text-[#172B4D]">{perm.label}</div>
                      <div className="text-xs font-mono text-[#94A3B8]">{perm.code}</div>
                    </td>

                    <td className="px-5 py-3.5 text-xs text-[#64748B]">
                      {perm.description}
                    </td>

                    {/* Admin */}
                    <td className="px-5 py-3.5 text-center">
                      {perm.roles.admin ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#DCFCE7] text-[#15803D]">
                          <CheckCircle2 size={16} />
                        </span>
                      ) : (
                        <span className="text-[#CBD5E1] font-bold">—</span>
                      )}
                    </td>

                    {/* Capitainerie */}
                    <td className="px-5 py-3.5 text-center">
                      {perm.roles.capitainerie ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#DCFCE7] text-[#15803D]">
                          <CheckCircle2 size={16} />
                        </span>
                      ) : (
                        <span className="text-[#CBD5E1] font-bold">—</span>
                      )}
                    </td>

                    {/* Agent Maritime */}
                    <td className="px-5 py-3.5 text-center">
                      {perm.roles.agent_maritime ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#DCFCE7] text-[#15803D]">
                          <CheckCircle2 size={16} />
                        </span>
                      ) : (
                        <span className="text-[#CBD5E1] font-bold">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3 : DÉFINITION DES RÔLES */}
      {activeTab === 'roles' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {rolesSummary.map((roleInfo) => (
            <div key={roleInfo.role} className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Badge type="role" status={roleInfo.role} />
                  <span className="text-xs font-semibold text-[#64748B]">
                    {roleInfo.users_count} compte(s)
                  </span>
                </div>

                <h3 className="text-base font-bold text-[#123B63]">{roleInfo.label}</h3>
                <p className="text-xs text-[#64748B] mt-2 leading-relaxed">
                  {roleInfo.description}
                </p>
              </div>

              <div className="pt-4 border-t border-[#F1F5F9]">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8] mb-2">
                  Privilèges Métier Clés
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {roleInfo.permissions.map((p) => (
                    <span key={p} className="px-2 py-0.5 rounded bg-[#F8FAFC] text-[11px] font-mono text-[#0B4F8A] border border-[#E2E8F0]">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL : GESTION INDIVIDUELLE DES PERMISSIONS D'UN UTILISATEUR */}
      {permissionTargetUser && (
        <Modal
          isOpen={true}
          onClose={() => setPermissionTargetUser(null)}
          title={`Gestion des Droits & Accès : ${permissionTargetUser.name}`}
          maxWidth="2xl"
        >
          <div className="space-y-5">
            {/* User Target Card & Quick Actions */}
            <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#172B4D] text-sm">{permissionTargetUser.name}</span>
                  <Badge type="role" status={permissionTargetUser.role} />
                </div>
                <div className="text-xs text-[#64748B] font-mono mt-0.5">{permissionTargetUser.email}</div>
              </div>

              {/* Presets rapides */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handlePresetResetToRole}
                  className="px-2.5 py-1 text-xs font-semibold rounded-md bg-white border border-[#CBD5E1] text-[#475569] hover:bg-[#F1F5F9] flex items-center gap-1 transition-colors"
                  title="Réinitialiser aux droits standard du rôle"
                >
                  <RotateCcw size={12} />
                  <span>Défaut Rôle</span>
                </button>
                <button
                  type="button"
                  onClick={handlePresetGrantAll}
                  className="px-2.5 py-1 text-xs font-semibold rounded-md bg-[#DCFCE7] text-[#15803D] hover:bg-green-200 border border-green-200 flex items-center gap-1 transition-colors"
                >
                  <Check size={12} />
                  <span>Tout autoriser</span>
                </button>
                <button
                  type="button"
                  onClick={handlePresetReadOnly}
                  className="px-2.5 py-1 text-xs font-semibold rounded-md bg-white border border-[#CBD5E1] text-[#64748B] hover:bg-[#F1F5F9] transition-colors"
                >
                  Lecture seule
                </button>
              </div>
            </div>

            {/* Total permissions counter */}
            <div className="flex items-center justify-between text-xs font-semibold px-1">
              <span className="text-[#64748B]">
                Cochez ou décochez les permissions autorisées pour cet utilisateur :
              </span>
              <span className="text-[#0B4F8A]">
                {customUserPerms.length} / {ALL_PERMISSIONS.length} permissions accordées
              </span>
            </div>

            {/* Grouped Permissions Checklist */}
            <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
              {Object.entries(groupedPermissions).map(([moduleName, perms]) => (
                <div key={moduleName} className="border border-[#E2E8F0] rounded-xl overflow-hidden bg-white">
                  <div className="bg-[#F8FAFC] px-4 py-2.5 border-b border-[#E2E8F0] font-bold text-xs text-[#123B63] flex items-center justify-between">
                    <span>{moduleName}</span>
                    <span className="text-[11px] font-normal text-[#64748B]">
                      {perms.filter((p) => customUserPerms.includes(p.code)).length} / {perms.length} actifs
                    </span>
                  </div>

                  <div className="p-3 divide-y divide-[#F1F5F9]">
                    {perms.map((perm) => {
                      const isChecked = customUserPerms.includes(perm.code);
                      return (
                        <label
                          key={perm.id}
                          className="flex items-start gap-3 py-2.5 px-2 hover:bg-[#F8FAFC] rounded-lg cursor-pointer transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleSinglePermission(perm.code)}
                            className="mt-0.5 w-4 h-4 rounded border-[#CBD5E1] text-[#0B4F8A] focus:ring-[#0B4F8A] cursor-pointer"
                          />
                          <div className="flex-1 min-w-0 text-xs">
                            <div className="flex items-center gap-2">
                              <span className={`font-semibold ${isChecked ? 'text-[#172B4D]' : 'text-[#64748B]'}`}>
                                {perm.label}
                              </span>
                              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#F1F5F9] text-[#64748B]">
                                {perm.code}
                              </span>
                            </div>
                            <p className="text-[#64748B] mt-0.5">{perm.description}</p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setPermissionTargetUser(null)}
                className="px-4 py-2 text-sm font-semibold rounded-lg bg-white border border-[#CBD5E1] text-[#475569] hover:bg-[#F8FAFC]"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleSaveUserPermissions}
                className="px-5 py-2 text-sm font-semibold rounded-lg bg-[#0B4F8A] hover:bg-[#083B68] text-white shadow-sm transition-colors"
              >
                Enregistrer les permissions
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal Création / Modification Utilisateur */}
      <Modal
        isOpen={isCreateModalOpen || !!editingUser}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingUser(null);
        }}
        title={editingUser ? `Modifier l'utilisateur : ${editingUser.name}` : 'Créer un nouveau compte utilisateur'}
      >
        <form onSubmit={handleSaveUser} className="space-y-4">
          <div>
            <label className="form-label">Nom complet & Prénom *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Marc Dupont"
              className="form-input"
            />
            {formErrors.name && <p className="mt-1 text-xs text-[#DC2626]">{formErrors.name}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Adresse Email Professionnelle *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Ex: mdupont@portcall.test"
                className="form-input"
              />
              {formErrors.email && <p className="mt-1 text-xs text-[#DC2626]">{formErrors.email}</p>}
            </div>

            <div>
              <label className="form-label">Rôle RBAC *</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                className="form-input"
              >
                <option value="agent_maritime">Agent Maritime (Consignataire)</option>
                <option value="capitainerie">Officier de Capitainerie</option>
                <option value="admin">Administrateur Général</option>
              </select>
            </div>
          </div>

          {!editingUser && (
            <div>
              <label className="form-label">Mot de passe provisoire *</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Au moins 6 caractères"
                className="form-input"
              />
              {formErrors.password && <p className="mt-1 text-xs text-[#DC2626]">{formErrors.password}</p>}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Service / Département</label>
              <input
                type="text"
                value={formData.service}
                onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                placeholder="Ex: Agence Maritime, VTS..."
                className="form-input"
              />
            </div>

            <div>
              <label className="form-label">Numéro de Téléphone</label>
              <input
                type="text"
                value={formData.telephone}
                onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                placeholder="Ex: +33 4 91 00 00 00"
                className="form-input"
              />
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#E2E8F0] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setIsCreateModalOpen(false);
                setEditingUser(null);
              }}
              className="px-4 py-2 text-sm font-semibold rounded-lg bg-white border border-[#CBD5E1] text-[#475569] hover:bg-[#F8FAFC]"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-semibold rounded-lg bg-[#0B4F8A] hover:bg-[#083B68] text-white shadow-sm"
            >
              {editingUser ? 'Mettre à jour' : 'Créer le compte'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirmation Dialog Suppression */}
      <ConfirmDialog
        isOpen={!!deletingUser}
        onClose={() => setDeletingUser(null)}
        onConfirm={handleConfirmDelete}
        title="Supprimer l'utilisateur"
        message={`Êtes-vous certain de vouloir supprimer définitivement le compte de ${deletingUser?.name} (${deletingUser?.email}) ? Cette action est irréversible.`}
        confirmLabel="Supprimer définitivement"
        isDestructive={true}
      />
    </div>
  );
};
