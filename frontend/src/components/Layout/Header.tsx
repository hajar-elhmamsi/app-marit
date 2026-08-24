import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut } from 'lucide-react';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-[#E2E8F0] flex items-center justify-end px-6 z-20">
      {/* User Profile & Logout */}
      <div className="flex items-center gap-4">
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
