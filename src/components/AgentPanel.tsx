import React, { useEffect, useState } from 'react';
import { McpCall } from '../types';
import { Bot, Network, Code2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function AgentPanel() {
  const [history, setHistory] = useState<McpCall[]>([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch('/api/mcp');
        const data = await res.json();
        setHistory(data);
      } catch (err) {
        console.error("Failed to load mcp history");
      }
    };
    fetchHistory();
    const interval = setInterval(fetchHistory, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl flex flex-col h-full overflow-hidden shadow-xl">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/50">
        <h3 className="text-sm font-medium text-slate-300 tracking-tight flex items-center gap-2">
          <Bot className="w-4 h-4 text-indigo-400" />
          Model Context Protocol (AI Agent)
        </h3>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] text-indigo-300 font-mono tracking-wide uppercase">
          <Network className="w-3 h-3" /> Connected
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <AnimatePresence>
          {history.map((call, i) => (
            <motion.div 
              key={call.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-950 border border-slate-800 rounded-lg p-3 relative overflow-hidden"
            >
              {/* Subtle line indicator */}
              <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-indigo-500/50"></div>
              
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-mono text-indigo-300 flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5" />
                  {call.method}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {new Date(call.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>
              
              <div className="bg-slate-900 rounded p-2 text-[11px] font-mono whitespace-pre-wrap text-slate-400 border border-slate-800/60 break-all">
                {JSON.stringify(call.params, null, 2)}
              </div>
              
              <div className="mt-2 flex items-center justify-between text-[10px]">
                <span className="text-slate-500 flex items-center gap-1">
                  Actor: <span className="text-slate-300 font-medium">{call.model}</span>
                </span>
                <span className="text-emerald-400 font-medium uppercase tracking-wider">{call.status}</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
