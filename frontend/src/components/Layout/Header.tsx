import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, Anchor } from 'lucide-react';

export const Header: React.FC = () => {
  const { user, logout, switchDemoUser } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-[#E2E8F0] flex items-center justify-between px-6 z-20">
      {/* Left: Operational status Casablanca */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#DCFCE7] text-[#15803D] text-xs font-semibold border border-green-200">
          <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
          <span>Port de Casablanca (MACAS) • Opérationnel</span>
        </div>
      </div>

      {/* Right: Demo Role Switcher & User Profile */}
      <div className="flex items-center gap-4">
        {/* Role Quick Switcher for Demo testing */}
        <div className="flex items-center gap-1 bg-[#F1F5F9] p-1 rounded-lg border border-[#E2E8F0]">
          <span className="text-[11px] text-[#64748B] font-medium px-2 hidden lg:inline">
            Profil Démo Casablanca :
          </span>
          <button
            onClick={() => switchDemoUser('admin')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
              user?.role === 'admin'
                ? 'bg-[#0B4F8A] text-white shadow-sm'
                : 'text-[#475569] hover:text-[#0B4F8A] hover:bg-white'
            }`}
            title="Direction Régionale ANP Casablanca"
          >
            Direction ANP
          </button>
          <button
            onClick={() => switchDemoUser('capitainerie')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
              user?.role === 'capitainerie'
                ? 'bg-[#0B4F8A] text-white shadow-sm'
                : 'text-[#475569] hover:text-[#0B4F8A] hover:bg-white'
            }`}
            title="Capitainerie du Port de Casablanca (VTS)"
          >
            Capitainerie (VTS)
          </button>
          <button
            onClick={() => switchDemoUser('agent_maritime')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
              user?.role === 'agent_maritime'
                ? 'bg-[#0B4F8A] text-white shadow-sm'
                : 'text-[#475569] hover:text-[#0B4F8A] hover:bg-white'
            }`}
            title="CMA CGM Maroc / Consignataire"
          >
            Consignataire
          </button>
        </div>

        {/* User Card */}
        <div className="flex items-center gap-3 pl-3 border-l border-[#E2E8F0]">
          <div className="w-9 h-9 rounded-full bg-[#EAF4FB] text-[#0B4F8A] border border-blue-200 flex items-center justify-center font-bold text-sm">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="text-left hidden md:block max-w-[170px]">
            <div className="text-xs font-bold text-[#172B4D] leading-tight truncate" title={user?.name}>{user?.name}</div>
            <div className="text-[11px] text-[#64748B] capitalize truncate">
              {user?.role === 'admin'
                ? 'Direction ANP'
                : user?.role === 'capitainerie'
                ? 'Capitainerie VTS'
                : 'Consignataire Agréé'}
            </div>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          className="p-2 rounded-lg text-[#64748B] hover:text-[#DC2626] hover:bg-[#FEE2E2] transition-colors"
          title="Déconnexion"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
};
