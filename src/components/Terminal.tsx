import React, { useEffect, useState, useRef } from 'react';
import { Terminal as TerminalIcon, ShieldAlert, CheckCircle, Zap } from 'lucide-react';
import { DeploymentLog } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

export function Terminal() {
  const [logs, setLogs] = useState<DeploymentLog[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const evtSource = new EventSource('/api/stream');
    
    evtSource.onmessage = (event) => {
      try {
        const logData: DeploymentLog = JSON.parse(event.data);
        setLogs((prev) => [...prev, logData].slice(-50)); // keep last 50 logs
      } catch (e) {
        console.error("Error parsing stream data:", e);
      }
    };

    return () => {
      evtSource.close();
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-800 bg-slate-900/50">
        <TerminalIcon className="w-4 h-4 text-slate-400" />
        <h3 className="text-sm font-medium text-slate-300 font-mono tracking-tight">Active Deployment Stream</h3>
        <div className="ml-auto flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-xs text-slate-500 font-mono">Live</span>
        </div>
      </div>
      
      <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto space-y-2 font-mono text-[13px]">
        <AnimatePresence initial={false}>
          {logs.map((log) => (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              key={log.id}
              className={`flex gap-3 leading-relaxed ${log.mcpContext ? 'bg-indigo-900/10 p-1.5 -mx-1.5 rounded border border-indigo-500/20' : ''}`}
            >
              <span className="text-slate-500 shrink-0">
                {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
              
              <span className="shrink-0 flex items-center gap-1.5 w-24">
                {log.level === 'info' && <span className="text-blue-400">INFO</span>}
                {log.level === 'warn' && <span className="text-amber-400 font-bold">WARN</span>}
                {log.level === 'error' && <span className="text-rose-400 font-bold">ERR </span>}
                {log.level === 'success' && <span className="text-emerald-400">SYNC</span>}
              </span>

              <span className={`shrink-0 ${log.mcpContext ? 'text-indigo-400' : 'text-slate-400'}`}>[{log.service}]</span>
              
              <span className={`break-words ${
                log.level === 'warn' ? 'text-amber-300/90' :
                log.level === 'error' ? 'text-rose-300/90' :
                log.level === 'success' ? 'text-emerald-300/90' :
                log.mcpContext ? 'text-indigo-200' :
                'text-slate-300'
              }`}>
                {log.message}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
        {logs.length === 0 && (
          <div className="text-slate-500 animate-pulse">Waiting for telemetry stream...</div>
        )}
      </div>
    </div>
  );
}
