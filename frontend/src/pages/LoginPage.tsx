import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Anchor,
  Lock,
  Mail,
  ArrowRight,
  Eye,
  EyeOff
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      showToast('Veuillez renseigner votre email et mot de passe.', 'warning');
      return;
    }

    setLoading(true);
    try {
      const ok = await login(email, password);
      if (ok) {
        showToast('Connexion réussie.', 'success', 'Session Ouverte');
        navigate(from, { replace: true });
      } else {
        showToast('Email ou mot de passe incorrect.', 'error', 'Erreur');
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Identifiants invalides.', 'error', 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-[#172B4D] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-[#0B4F8A] text-white flex items-center justify-center mx-auto shadow-sm mb-3.5">
            <Anchor size={24} className="stroke-[2.5]" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#123B63]">
            NAVIOS
          </h1>
          <p className="text-sm text-[#64748B] mt-1 font-medium">
            Port de Casablanca • Gestion des Escales
          </p>
        </div>

        {/* Clean Login Card */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-8 shadow-sm space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#475569] mb-1.5">
                Adresse email
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="nom@portcasablanca.ma"
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#CBD5E1] rounded-lg text-sm text-[#172B4D] placeholder-[#94A3B8] focus:outline-none focus:border-[#0B4F8A] focus:ring-1 focus:ring-[#0B4F8A] transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-[#475569]">
                  Mot de passe
                </label>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-white border border-[#CBD5E1] rounded-lg text-sm text-[#172B4D] placeholder-[#94A3B8] focus:outline-none focus:border-[#0B4F8A] focus:ring-1 focus:ring-[#0B4F8A] transition-colors font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#475569] transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold text-white bg-[#0B4F8A] hover:bg-[#083B68] focus:outline-none focus:ring-2 focus:ring-[#0B4F8A]/30 transition-colors shadow-sm disabled:opacity-50 mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Se connecter</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

        </div>

        {/* Minimal Institutional Footer */}
        <div className="mt-6 text-center text-xs text-[#94A3B8]">
          NAVIOS PortCall • Marsa Maroc
        </div>

      </div>
    </div>
  );
};
