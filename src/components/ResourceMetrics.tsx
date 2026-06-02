import React, { useEffect, useState } from 'react';
import { Server, Activity, ArrowUpRight, Cpu } from 'lucide-react';
import { AwsResource } from '../types';

export function ResourceMetrics() {
  const [resources, setResources] = useState<AwsResource[]>([]);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const res = await fetch('/api/resources');
        const data = await res.json();
        setResources(data);
      } catch (err) {
        console.error("Failed to load resources:", err);
      }
    };
    fetchResources();
    const interval = setInterval(fetchResources, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-slate-300 tracking-tight flex items-center gap-2">
          <Server className="w-4 h-4 text-slate-400" />
          Infrastructure State (TF)
        </h3>
        <span className="px-2 py-1 bg-slate-800 text-slate-400 text-xs rounded-md border border-slate-700">us-west-2</span>
      </div>

      <div className="space-y-3 overflow-y-auto pr-2 flex-1">
        {resources.map((res) => (
          <div key={res.id} className="flex flex-col p-3 rounded-lg border border-slate-800 bg-slate-900 shadow-sm hover:border-slate-700 transition-colors">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-amber-500" />
                <span className="font-mono text-xs text-slate-200 font-medium">{res.name}</span>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                res.status === 'available' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                res.status === 'provisioning' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 
                'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              }`}>
                {res.status}
              </span>
            </div>
            
            <div className="flex justify-between items-center text-[11px] text-slate-500">
              <span>{res.type}</span>
              <span className="flex items-center gap-1"><ArrowUpRight className="w-3 h-3"/> Active</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
