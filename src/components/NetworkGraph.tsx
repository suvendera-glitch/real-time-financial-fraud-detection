import React, { useState } from 'react';
import {
  User,
  Smartphone,
  Send,
  UserCheck,
  MapPin,
  Globe,
  AlertOctagon,
  ShieldAlert,
  Info,
} from 'lucide-react';
import { GraphData, GraphNode } from '../types/transaction';

interface NetworkGraphProps {
  graphData: GraphData;
  className?: string;
}

export const NetworkGraph: React.FC<NetworkGraphProps> = ({
  graphData,
  className = '',
}) => {
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(
    graphData.nodes.find((n) => n.highlight) || graphData.nodes[0]
  );

  // Position nodes spatially for a clean, futuristic network diagram layout
  const nodePositions: Record<string, { x: number; y: number }> = {
    ACCOUNT: { x: 140, y: 190 },
    TRANSACTION: { x: 340, y: 190 },
    DEVICE: { x: 140, y: 70 },
    BENEFICIARY: { x: 540, y: 190 },
    LOCATION: { x: 140, y: 310 },
    IP: { x: 340, y: 70 },
    MULE_CLUSTER: { x: 540, y: 310 },
  };

  const getNodeIcon = (type: GraphNode['type']) => {
    switch (type) {
      case 'account':
        return <User className="w-5 h-5 text-cyan-400" />;
      case 'device':
        return <Smartphone className="w-5 h-5 text-amber-400" />;
      case 'transaction':
        return <Send className="w-5 h-5 text-rose-400" />;
      case 'beneficiary':
        return <UserCheck className="w-5 h-5 text-purple-400" />;
      case 'location':
        return <MapPin className="w-5 h-5 text-sky-400" />;
      case 'ip':
        return <Globe className="w-5 h-5 text-indigo-400" />;
      case 'mule_account':
        return <AlertOctagon className="w-5 h-5 text-red-500 animate-pulse" />;
      default:
        return <Info className="w-5 h-5 text-slate-400" />;
    }
  };

  const getNodeBorder = (node: GraphNode) => {
    if (node.type === 'mule_account' || (node.riskScore && node.riskScore >= 90)) {
      return 'border-red-500 bg-red-950/60 shadow-[0_0_15px_rgba(239,68,68,0.4)]';
    }
    if (node.riskScore && node.riskScore >= 70) {
      return 'border-rose-500/80 bg-rose-950/50 shadow-[0_0_12px_rgba(244,63,94,0.3)]';
    }
    if (node.riskScore && node.riskScore >= 30) {
      return 'border-amber-500/80 bg-amber-950/40 shadow-[0_0_10px_rgba(245,158,11,0.2)]';
    }
    return 'border-cyan-500/50 bg-cyan-950/40 shadow-[0_0_10px_rgba(6,182,212,0.2)]';
  };

  return (
    <div
      id="jarvis-networkx-graph"
      className={`glass-panel rounded-2xl p-5 border border-cyan-500/20 relative ${className}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold font-cyber text-slate-100">
              NetworkX Graph Analysis
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
              CENTRALITY SCORE: {graphData.centrality_risk_score}
            </span>
          </div>
          <p className="text-xs font-mono text-slate-400 mt-0.5">
            Real-time entity relationship mapping & 2-hop fraud ring correlation
          </p>
        </div>

        {graphData.fraud_ring_detected && (
          <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-red-950/40 border border-red-500/40 text-red-300 text-xs font-mono">
            <ShieldAlert className="w-4 h-4 text-red-400 animate-pulse" />
            <span>Mule Cluster Connection Flagged</span>
          </div>
        )}
      </div>

      {/* SVG Canvas and Node Overlay */}
      <div className="relative w-full h-[380px] bg-[#070c18] rounded-xl border border-slate-800/80 overflow-hidden">
        {/* Ambient grid lines */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(#38bdf8 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        />

        {/* SVG Edges */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <defs>
            <linearGradient id="cyanLine" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.8" />
            </linearGradient>
            <linearGradient id="suspiciousLine" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.9" />
            </linearGradient>
          </defs>

          {graphData.edges.map((edge) => {
            const start = nodePositions[edge.source] || { x: 100, y: 100 };
            const end = nodePositions[edge.target] || { x: 300, y: 300 };

            return (
              <g key={edge.id}>
                <line
                  x1={start.x}
                  y1={start.y}
                  x2={end.x}
                  y2={end.y}
                  stroke={edge.suspicious ? 'url(#suspiciousLine)' : 'url(#cyanLine)'}
                  strokeWidth={edge.suspicious ? 2.5 : 1.5}
                  strokeDasharray={edge.suspicious ? '4 3' : undefined}
                />
                {/* Edge label */}
                <rect
                  x={(start.x + end.x) / 2 - 40}
                  y={(start.y + end.y) / 2 - 9}
                  width="80"
                  height="18"
                  rx="4"
                  fill="#060a14"
                  stroke={edge.suspicious ? '#ef4444' : '#1e293b'}
                  strokeWidth="0.8"
                />
                <text
                  x={(start.x + end.x) / 2}
                  y={(start.y + end.y) / 2 + 3}
                  textAnchor="middle"
                  fill={edge.suspicious ? '#fca5a5' : '#94a3b8'}
                  fontSize="8.5"
                  fontFamily="JetBrains Mono, monospace"
                  fontWeight="600"
                >
                  {edge.label}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Nodes Layer */}
        {graphData.nodes.map((node) => {
          const pos = nodePositions[node.id] || { x: 250, y: 200 };
          const isSelected = selectedNode?.id === node.id;

          return (
            <div
              key={node.id}
              onClick={() => setSelectedNode(node)}
              style={{
                left: `${pos.x}px`,
                top: `${pos.y}px`,
                transform: 'translate(-50%, -50%)',
              }}
              className={`absolute cursor-pointer group flex flex-col items-center z-10 transition-all duration-200 ${
                isSelected ? 'scale-110' : 'hover:scale-105'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-2xl border-2 flex items-center justify-center relative ${getNodeBorder(
                  node
                )} ${isSelected ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-[#060913]' : ''}`}
              >
                {getNodeIcon(node.type)}
                {node.riskScore !== undefined && (
                  <span
                    className={`absolute -top-2 -right-2 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full border ${
                      node.riskScore >= 70
                        ? 'bg-red-950 text-red-300 border-red-500'
                        : node.riskScore >= 30
                        ? 'bg-amber-950 text-amber-300 border-amber-500'
                        : 'bg-emerald-950 text-emerald-300 border-emerald-500'
                    }`}
                  >
                    {node.riskScore}
                  </span>
                )}
              </div>
              <span className="mt-1.5 text-[10.5px] font-mono font-medium text-slate-300 bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800 text-center whitespace-nowrap max-w-[140px] truncate shadow">
                {node.label.split(' ')[0]}
              </span>
            </div>
          );
        })}
      </div>

      {/* Selected Node Details Drawer */}
      {selectedNode && (
        <div className="mt-4 p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-slate-900 border border-slate-700">
              {getNodeIcon(selectedNode.type)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold font-cyber text-slate-100">
                  {selectedNode.label}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-300 uppercase border border-slate-700">
                  {selectedNode.type}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Node ID: {selectedNode.id}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            {selectedNode.meta &&
              Object.entries(selectedNode.meta).map(([key, val]) => (
                <div key={key} className="bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
                  <span className="text-slate-400 capitalize">{key}: </span>
                  <span className="text-slate-200 font-semibold">{String(val)}</span>
                </div>
              ))}
            {selectedNode.riskScore !== undefined && (
              <div className="bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
                <span className="text-slate-400">Risk Weight: </span>
                <span className={selectedNode.riskScore >= 70 ? 'text-red-400' : 'text-emerald-400'}>
                  {selectedNode.riskScore}/100
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
