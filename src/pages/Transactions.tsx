import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { History, Shield, Filter, ArrowUpRight, Send, RefreshCw } from 'lucide-react';
import { getTransactions } from '../services/api';
import { Transaction } from '../types/transaction';
import { TransactionTable } from '../components/TransactionTable';

export const Transactions: React.FC = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const data = await getTransactions();
      setTransactions(data);
    } catch {
      // Service handles fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto" id="jarvis-transactions-page">
      {/* Header Banner */}
      <div className="glass-panel rounded-2xl p-6 border border-cyan-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold font-cyber tracking-wide text-slate-100">
              Transaction History
            </h1>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              AUDITED BY JARVIS
            </span>
          </div>
          <p className="text-sm font-mono text-cyan-400 mt-1">
            Complete cryptographic audit trail of all evaluated and intercepted payments.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchTransactions}
            disabled={loading}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-400 transition-colors"
            title="Refresh transactions"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
          <button
            onClick={() => navigate('/pay')}
            className="py-2.5 px-4 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/50 font-mono text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>New Payment</span>
          </button>
        </div>
      </div>

      {/* Stats summary bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-panel rounded-xl p-4 border border-slate-800">
          <span className="text-[11px] font-mono text-slate-400 uppercase">Total Audited</span>
          <div className="text-xl font-cyber font-bold text-slate-100 mt-1">
            {transactions.length}
          </div>
        </div>
        <div className="glass-panel rounded-xl p-4 border border-emerald-500/20">
          <span className="text-[11px] font-mono text-emerald-400 uppercase">Approved Payments</span>
          <div className="text-xl font-cyber font-bold text-emerald-400 mt-1">
            {transactions.filter((t) => t.status === 'APPROVED' || t.status === 'COMPLETED').length}
          </div>
        </div>
        <div className="glass-panel rounded-xl p-4 border border-amber-500/20">
          <span className="text-[11px] font-mono text-amber-400 uppercase">Verified 2FA</span>
          <div className="text-xl font-cyber font-bold text-amber-400 mt-1">
            {transactions.filter((t) => t.status === 'VERIFICATION').length}
          </div>
        </div>
        <div className="glass-panel rounded-xl p-4 border border-red-500/20">
          <span className="text-[11px] font-mono text-red-400 uppercase">Paused / Held</span>
          <div className="text-xl font-cyber font-bold text-red-400 mt-1">
            {transactions.filter((t) => t.status === 'PAUSED' || t.status === 'HELD').length}
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="glass-panel rounded-2xl p-6 border border-cyan-500/20">
        <TransactionTable transactions={transactions} showFilters={true} />
      </div>
    </div>
  );
};
