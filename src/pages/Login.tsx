import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, Mail, ArrowRight, UserCheck, Terminal, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { loginAsDemoUser, loginAsDemoAdmin } = useAuth();
  const [email, setEmail] = useState('john.doe@enterprise.io');
  const [password, setPassword] = useState('••••••••••••');
  const [loading, setLoading] = useState(false);

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      loginAsDemoUser();
      navigate('/dashboard');
    }, 400);
  };

  const handleDemoUser = () => {
    loginAsDemoUser();
    navigate('/dashboard');
  };

  const handleDemoAdmin = () => {
    loginAsDemoAdmin();
    navigate('/admin');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background ambient neon glow circles */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full glass-panel-glow rounded-2xl p-8 border border-cyan-500/30 relative z-10 shadow-2xl">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mx-auto mb-4 shadow-[0_0_25px_rgba(6,182,212,0.4)] border border-cyan-300/40">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-cyber tracking-wider text-slate-100">
            PROJECT JARVIS
          </h1>
          <p className="text-xs font-mono text-cyan-400 mt-1 uppercase tracking-widest">
            AI Payment Guardian
          </p>
          <div className="mt-2 text-[11px] font-mono text-slate-400">
            Detect · Understand · Intercept · Respond
          </div>
        </div>

        {/* Prototype notice banner */}
        <div className="mb-6 p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-slate-200">Hackathon Prototype: </span>
            Uses synthetic financial data. For instant access, use the demo buttons below or click Sign In.
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSignIn} className="space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
              Work Email / Account
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="login-email-input"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/50 font-mono transition-colors"
                placeholder="name@company.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="login-password-input"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/50 font-mono transition-colors"
                placeholder="••••••••••••"
              />
            </div>
          </div>

          <button
            id="login-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-cyber font-bold tracking-wider text-sm transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] flex items-center justify-center gap-2 mt-6 cursor-pointer"
          >
            {loading ? 'AUTHENTICATING...' : 'SIGN IN'}
            <ArrowRight className="w-4 h-4 text-slate-950" />
          </button>
        </form>

        {/* Demo Roles Quick Launchers */}
        <div className="mt-8 pt-6 border-t border-slate-800/80">
          <div className="text-[10px] font-mono text-center uppercase tracking-widest text-slate-500 mb-3">
            Quick Prototype Access
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              id="demo-user-login-btn"
              onClick={handleDemoUser}
              className="py-2.5 px-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-xs font-mono text-cyan-300 flex items-center justify-center gap-2 transition-all hover:border-cyan-500/40"
            >
              <UserCheck className="w-4 h-4 text-cyan-400" />
              <span>Demo User</span>
            </button>
            <button
              id="demo-admin-login-btn"
              onClick={handleDemoAdmin}
              className="py-2.5 px-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-xs font-mono text-purple-300 flex items-center justify-center gap-2 transition-all hover:border-purple-500/40"
            >
              <Terminal className="w-4 h-4 text-purple-400" />
              <span>Demo Admin (SOC)</span>
            </button>
          </div>
        </div>

        {/* Security watermark footer */}
        <div className="mt-6 text-center text-[11px] font-mono text-slate-500">
          ● Protected by JARVIS Continuous Heuristic ML
        </div>
      </div>
    </div>
  );
};
