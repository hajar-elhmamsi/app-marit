import React from 'react';
import {
  Compass,
  Ship,
  Box,
  Route,
  Anchor,
  Users,
  ShieldAlert,
  Leaf,
  Activity
} from 'lucide-react';
import { sounds } from '../utils/soundEffects';

export type TabId = 
  | 'map' 
  | 'fleet' 
  | 'cargo' 
  | 'voyage' 
  | 'ports' 
  | 'crew' 
  | 'emergency' 
  | 'cii';

interface NavigationProps {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  unreadAlarmsCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  unreadAlarmsCount
}) => {
  const navItems = [
    { id: 'map' as TabId, label: 'Live AIS Map', icon: Compass, badge: 'LIVE' },
    { id: 'fleet' as TabId, label: 'Fleet Digital Twin', icon: Ship },
    { id: 'cargo' as TabId, label: 'Stowage & Cargo', icon: Box },
    { id: 'voyage' as TabId, label: 'Voyage Planner', icon: Route },
    { id: 'ports' as TabId, label: 'Port Operations', icon: Anchor },
    { id: 'crew' as TabId, label: 'Crew & STCW', icon: Users },
    { id: 'emergency' as TabId, label: 'GMDSS / SOS', icon: ShieldAlert, alertBadge: unreadAlarmsCount },
    { id: 'cii' as TabId, label: 'Decarbonization', icon: Leaf, badge: 'ESG' }
  ];

  return (
    <nav className="glass-panel" style={{
      width: '240px',
      margin: '0.75rem 0 0.75rem 1rem',
      padding: '0.85rem 0.65rem',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      gap: '0.5rem',
      flexShrink: 0
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        <div style={{
          padding: '0.35rem 0.75rem 0.6rem 0.75rem',
          fontSize: '0.68rem',
          fontWeight: 700,
          fontFamily: 'var(--font-mono)',
          color: 'var(--text-muted)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase'
        }}>
          Bridge Control Modules
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                sounds.playButtonBeep();
                setActiveTab(item.id);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                background: isActive ? 'linear-gradient(90deg, rgba(0, 245, 212, 0.15), rgba(0, 245, 212, 0.03))' : 'transparent',
                border: isActive ? '1px solid var(--accent-cyan-glow)' : '1px solid transparent',
                color: isActive ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
                fontFamily: 'var(--font-heading)',
                fontSize: '0.88rem',
                fontWeight: isActive ? 700 : 500,
                textAlign: 'left'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Icon size={18} color={isActive ? 'var(--accent-cyan)' : 'currentColor'} />
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span style={{
                  fontSize: '0.62rem',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  padding: '2px 5px',
                  borderRadius: '4px',
                  background: 'rgba(0, 245, 212, 0.15)',
                  color: 'var(--accent-cyan)',
                  border: '1px solid var(--accent-cyan-glow)'
                }}>
                  {item.badge}
                </span>
              )}

              {item.alertBadge !== undefined && item.alertBadge > 0 && (
                <span style={{
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  padding: '1px 6px',
                  borderRadius: '999px',
                  background: '#f43f5e',
                  color: '#ffffff'
                }}>
                  {item.alertBadge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bridge Telemetry Footer Widget */}
      <div style={{
        background: 'rgba(0, 0, 0, 0.28)',
        borderRadius: 'var(--radius-md)',
        padding: '0.75rem',
        border: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.45rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            ECDIS STATUS
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', color: 'var(--accent-emerald)', fontWeight: 600 }}>
            <Activity size={12} />
            SYNCHRONIZED
          </span>
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          IMO CII Fleet Avg: <strong style={{ color: 'var(--accent-cyan)' }}>Grade A (94.2%)</strong>
        </div>
      </div>
    </nav>
  );
};
