import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowUpDown, ChevronRight, Filter } from 'lucide-react';
import { Transaction, TransactionStatus } from '../types/transaction';
import { StatusBadge } from './StatusBadge';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDate } from '../utils/formatDate';

interface TransactionTableProps {
  transactions: Transaction[];
  compact?: boolean;
  limit?: number;
  showFilters?: boolean;
}

export const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  compact = false,
  limit,
  showFilters = true,
}) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest_risk' | 'highest_amount'>('newest');

  // Filtering
  let filtered = transactions.filter((txn) => {
    const matchesSearch =
      txn.transaction_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      txn.beneficiary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      txn.beneficiary_account.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'APPROVED' && (txn.status === 'APPROVED' || txn.status === 'COMPLETED')) ||
      (statusFilter === 'VERIFICATION' && txn.status === 'VERIFICATION') ||
      (statusFilter === 'PAUSED' && txn.status === 'PAUSED') ||
      (statusFilter === 'HELD' && txn.status === 'HELD');

    return matchesSearch && matchesStatus;
  });

  // Sorting
  filtered.sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.date).getTime() - new Date(a.date).getTime();
    if (sortBy === 'oldest') return new Date(a.date).getTime() - new Date(b.date).getTime();
    if (sortBy === 'highest_risk') return b.risk_score - a.risk_score;
    if (sortBy === 'highest_amount') return b.amount - a.amount;
    return 0;
  });

  if (limit) {
    filtered = filtered.slice(0, limit);
  }

  return (
    <div className="w-full space-y-4" id="jarvis-transaction-table-container">
      {showFilters && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="transaction-search-input"
              type="text"
              placeholder="Search transaction ID or beneficiary..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition-colors font-mono"
            />
          </div>

          {/* Filters & Sorting */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Status Pills */}
            <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800 text-xs font-mono">
              {['ALL', 'APPROVED', 'VERIFICATION', 'PAUSED', 'HELD'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setStatusFilter(tab)}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    statusFilter === tab
                      ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Sort Select */}
            <div className="relative">
              <select
                id="transaction-sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="appearance-none pl-3 pr-8 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 font-mono focus:outline-none focus:border-cyan-500/50 cursor-pointer"
              >
                <option value="newest">Sort: Newest</option>
                <option value="oldest">Sort: Oldest</option>
                <option value="highest_risk">Sort: Highest Risk</option>
                <option value="highest_amount">Sort: Highest Amount</option>
              </select>
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>
      )}

      {/* Table Card */}
      <div className="rounded-xl border border-slate-800 bg-slate-950/60 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm" id="transactions-data-table">
            <thead>
              <tr className="border-b border-slate-800/80 bg-slate-900/40 text-[11px] font-mono uppercase tracking-wider text-slate-400">
                <th className="py-3.5 px-4">Transaction ID</th>
                <th className="py-3.5 px-4">Beneficiary</th>
                <th className="py-3.5 px-4 text-right">Amount</th>
                <th className="py-3.5 px-4 text-center">Risk Score</th>
                <th className="py-3.5 px-4 text-center">Risk</th>
                {!compact && <th className="py-3.5 px-4 text-center">Action</th>}
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-3 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-10 text-slate-500 font-mono text-xs">
                    No transactions found matching the selected criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((txn) => (
                  <tr
                    key={txn.transaction_id}
                    id={`txn-row-${txn.transaction_id}`}
                    onClick={() => navigate(`/transactions/${txn.transaction_id}`)}
                    className="hover:bg-slate-900/50 transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-4 font-mono font-medium text-cyan-400 text-xs">
                      {txn.transaction_id}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-200 text-xs truncate max-w-[180px]">
                        {txn.beneficiary}
                      </div>
                      <div className="text-[11px] font-mono text-slate-400 truncate max-w-[180px]">
                        {txn.beneficiary_account}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-100 text-xs">
                      {formatCurrency(txn.amount, txn.currency)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`font-cyber font-bold text-xs ${
                          txn.risk_score >= 70
                            ? 'text-red-400'
                            : txn.risk_score >= 30
                            ? 'text-yellow-400'
                            : 'text-emerald-400'
                        }`}
                      >
                        {txn.risk_score}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">/100</span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <StatusBadge type="risk" riskLevel={txn.risk_level} size="sm" />
                    </td>
                    {!compact && (
                      <td className="py-3.5 px-4 text-center">
                        <span className="text-[11px] font-mono text-slate-300 uppercase px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                          {txn.action}
                        </span>
                      </td>
                    )}
                    <td className="py-3.5 px-4 text-center">
                      <StatusBadge type="status" status={txn.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-xs font-mono text-slate-400 whitespace-nowrap">
                      {formatDate(txn.date)}
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 transition-colors" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
