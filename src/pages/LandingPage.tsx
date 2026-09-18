import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Send,
  Cpu,
  AlertTriangle,
  Lock,
  ArrowRight,
  Terminal,
  Activity,
  CheckCircle2,
  Share2,
  Database,
  GitBranch,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { loginAsDemoUser, loginAsDemoAdmin } = useAuth();

  const handleLaunchDemo = () => {
    loginAsDemoUser();
    navigate('/dashboard');
  };

  const handleLaunchAdmin = () => {
    loginAsDemoAdmin();
    navigate('/admin');
  };

  return (
    <div className="relative min-h-[90vh] flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-10 left-1/3 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Hero Header */}
      <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10 pt-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold tracking-wider uppercase shadow-[0_0_20px_rgba(6,182,212,0.2)]">
          <Shield className="w-4 h-4 text-cyan-400" />
          <span>Next-Generation Financial Cybersecurity Prototype</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-cyber font-bold tracking-wide text-slate-100 leading-tight">
          PROJECT <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500">JARVIS</span>
        </h1>

        <p className="text-lg sm:text-xl font-cyber text-cyan-300 tracking-wider uppercase">
          AI Payment Guardian
        </p>

        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-sans leading-relaxed">
          Autonomous pre-flight fraud interception engine. Analyzes transaction behavior, contextual risk signals, and network relationships before settlement occurs.
        </p>

        {/* 4 Core Pillars */}
        <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-mono pt-2">
          {['DETECT', 'UNDERSTAND', 'INTERCEPT', 'RESPOND'].map((step, idx) => (
            <div
              key={step}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-200"
            >
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span className="font-bold">{step}</span>
              {idx < 3 && <span className="text-slate-600">→</span>}
            </div>
          ))}
        </div>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
          <button
            id="landing-launch-demo-btn"
            onClick={handleLaunchDemo}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-cyber font-bold tracking-wider text-sm transition-all shadow-[0_0_30px_rgba(6,182,212,0.4)] flex items-center justify-center gap-3 cursor-pointer"
          >
            <span>LAUNCH USER DEMO</span>
            <ArrowRight className="w-4 h-4 text-slate-950" />
          </button>

          <button
            id="landing-launch-admin-btn"
            onClick={handleLaunchAdmin}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-purple-500/40 text-purple-300 font-mono text-sm font-bold transition-all shadow-[0_0_20px_rgba(168,85,247,0.2)] flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <Terminal className="w-4 h-4 text-purple-400" />
            <span>OPEN SOC CENTER (ADMIN)</span>
          </button>
        </div>
      </div>

      {/* 3 Core Architecture Highlights */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 my-12 relative z-10">
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-2">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="text-base font-cyber font-bold text-slate-100">Multi-Model Inference</h3>
          <p className="text-xs text-slate-400 font-mono leading-relaxed">
            Blends XGBoost classification with Isolation Forest anomaly detection to score risk with microsecond latency.
          </p>
        </div>

        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-2">
          <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <GitBranch className="w-5 h-5" />
          </div>
          <h3 className="text-base font-cyber font-bold text-slate-100">NetworkX Graph Analysis</h3>
          <p className="text-xs text-slate-400 font-mono leading-relaxed">
            Evaluates 2-hop entity relationships and mule clusters across accounts, devices, and beneficiaries in real time.
          </p>
        </div>

        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Shield className="w-5 h-5" />
          </div>
          <h3 className="text-base font-cyber font-bold text-slate-100">Adaptive Recheck 2FA</h3>
          <p className="text-xs text-slate-400 font-mono leading-relaxed">
            Interception pauses suspicious funds; step-up verification dynamically re-evaluates and clears authorized user payments.
          </p>
        </div>
      </div>

      {/* Footer Prototype Notice */}
      <div className="max-w-4xl mx-auto text-center text-xs font-mono text-slate-500 border-t border-slate-900 pt-6">
        <div>
          JARVIS AI Payment Guardian · FinTech Cybersecurity Hackathon Edition · Synthetic Telemetry Engine
        </div>
        <div className="mt-1 text-slate-600">
          No real financial funds transferred. Built with React 18, TypeScript, Tailwind CSS & Recharts.
        </div>
      </div>
    </div>
  );
};
