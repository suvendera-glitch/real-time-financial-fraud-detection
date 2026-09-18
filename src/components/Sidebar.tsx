import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Send,
  Cpu,
  History,
  ShieldCheck,
  Terminal,
  Settings,
  LogOut,
  User,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/pay', label: 'Pay Securely', icon: Send },
    { to: '/analysis', label: 'AI Analysis', icon: Cpu },
    { to: '/transactions', label: 'Transactions', icon: History },
    { to: '/security', label: 'Security Center', icon: ShieldCheck },
    { to: '/admin', label: 'Admin Center', icon: Terminal, adminOnly: true },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
        />
      )}

      <aside
        id="jarvis-sidebar-navigation"
        className={`fixed top-16 bottom-0 left-0 w-64 bg-[#070b16] border-r border-cyan-500/15 p-4 flex flex-col justify-between z-40 transition-transform duration-300 md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Navigation links */}
        <div className="space-y-6">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500 px-3 mb-2">
              Guardian Navigation
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => {
                if (item.adminOnly && !isAdmin) {
                  // If not admin, still show with lock badge or allow preview
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={onClose}
                      className={({ isActive }) =>
                        `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                          isActive
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                        }`
                      }
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="w-4 h-4 text-purple-400" />
                        <span>{item.label}</span>
                      </div>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                        SOC
                      </span>
                    </NavLink>
                  );
                }

                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                        isActive
                          ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.15)] font-bold'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                      }`
                    }
                  >
                    <item.icon className="w-4 h-4 text-cyan-400" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* Quick Demo Scenario Callout */}
          <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 text-xs">
            <div className="flex items-center justify-between text-[11px] font-mono text-cyan-400 font-bold mb-1.5">
              <span>Demo Scenario</span>
              <span className="text-[9px] bg-cyan-950 text-cyan-300 px-1 rounded border border-cyan-800">
                ₹75K ATTACK
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-normal mb-2.5">
              Experience the complete <strong className="text-slate-200">Pause → Prove → Recheck</strong> payment interception flow.
            </p>
            <button
              onClick={() => {
                navigate('/pay?scenario=high_risk');
                if (onClose) onClose();
              }}
              className="w-full py-1.5 px-2.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-[11px] font-mono font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Send className="w-3 h-3" />
              Launch ₹75k Test
            </button>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-4 border-t border-slate-800/80 space-y-3">
          {/* User badge */}
          <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg bg-slate-900/40 border border-slate-800">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 text-xs font-bold font-mono">
              {user?.name.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-slate-200 truncate">
                {user?.name || 'Demo User'}
              </div>
              <div className="text-[10px] font-mono text-slate-500 truncate">
                {user?.account_id || 'ACC-2026-10482'}
              </div>
            </div>
          </div>

          {/* System status widget */}
          <div className="px-2 py-1 text-[11px] font-mono flex items-center justify-between text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>JARVIS ONLINE</span>
            </span>
            <span className="text-[10px] text-slate-500">v2.4-ML</span>
          </div>

          {/* Settings & Logout */}
          <div className="flex items-center justify-between pt-1">
            <NavLink
              to="/security"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded-lg text-xs flex items-center gap-1.5 transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </NavLink>
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="p-2 text-red-400 hover:text-red-300 hover:bg-red-950/20 rounded-lg text-xs flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Exit</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
