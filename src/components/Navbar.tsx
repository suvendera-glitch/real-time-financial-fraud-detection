import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Shield,
  Menu,
  X,
  User,
  LogOut,
  Bell,
  Cpu,
  Layers,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getBackendStatus } from '../services/api';

interface NavbarProps {
  onMenuToggle?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onMenuToggle }) => {
  const { user, isAdmin, loginAsDemoUser, loginAsDemoAdmin, logout } = useAuth();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const backendStatus = getBackendStatus();

  return (
    <header
      id="jarvis-global-navbar"
      className="fixed top-0 left-0 right-0 z-50 h-16 w-full border-b border-cyan-500/15 bg-[#060913]/95 backdrop-blur-xl"
    >
      <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Mobile Toggle & Brand */}
        <div className="flex items-center gap-3">
          <button
            id="mobile-sidebar-toggle-btn"
            onClick={onMenuToggle}
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-900 transition-colors"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link to="/dashboard" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.4)] border border-cyan-300/40">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-cyber text-lg font-bold tracking-wider text-slate-100 group-hover:text-cyan-400 transition-colors">
                  JARVIS
                </span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  PROTOTYPE
                </span>
              </div>
              <span className="text-[11px] font-mono text-cyan-400/80 -mt-1 block tracking-tight">
                AI Payment Guardian
              </span>
            </div>
          </Link>
        </div>

        {/* Center: System Status Pill */}
        <div className="hidden md:flex items-center gap-3">
          <div
            id="jarvis-system-status-indicator"
            className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-cyan-500/25 text-xs font-mono"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-emerald-400 font-bold tracking-wide">
              JARVIS AI ONLINE
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">XGBoost · IsoForest · NetworkX</span>
          </div>
        </div>

        {/* Right: Quick Role Switcher & User Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Engine indicator */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/60 border border-slate-800 text-[11px] font-mono text-slate-400">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>Mode: {backendStatus.mode === 'FASTAPI' ? 'FastAPI Active' : 'Autonomous AI Sandbox'}</span>
          </div>

          {/* Role quick toggle */}
          <div className="flex items-center bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-xs font-mono">
            <button
              id="switch-to-user-btn"
              onClick={loginAsDemoUser}
              className={`px-2 py-1 rounded-md transition-all ${
                !isAdmin
                  ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Switch to Demo User view"
            >
              User
            </button>
            <button
              id="switch-to-admin-btn"
              onClick={loginAsDemoAdmin}
              className={`px-2 py-1 rounded-md transition-all ${
                isAdmin
                  ? 'bg-purple-500/20 text-purple-300 font-bold border border-purple-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Switch to Demo SOC Admin view"
            >
              Admin (SOC)
            </button>
          </div>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              id="user-profile-menu-button"
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-900 border border-slate-800 transition-colors"
            >
              <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 text-xs font-bold">
                {user?.name.charAt(0) || 'U'}
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl bg-[#0b1120] border border-cyan-500/30 p-2 shadow-2xl z-50">
                <div className="px-3 py-2 border-b border-slate-800">
                  <div className="text-xs font-bold text-slate-200">{user?.name}</div>
                  <div className="text-[11px] font-mono text-cyan-400 truncate">{user?.email}</div>
                  <div className="text-[10px] font-mono text-slate-400 mt-1">
                    Role: <span className="uppercase text-slate-300">{user?.role}</span>
                  </div>
                </div>

                <div className="py-1">
                  <Link
                    to="/security"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="block px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-900 rounded-lg"
                  >
                    Security Settings
                  </Link>
                  <Link
                    to="/admin"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="block px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-900 rounded-lg"
                  >
                    Security Operations Center
                  </Link>
                </div>

                <div className="pt-1 border-t border-slate-800">
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      logout();
                    }}
                    className="w-full text-left flex items-center gap-2 px-3 py-1.5 text-xs text-red-400 hover:bg-red-950/20 rounded-lg"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
