import React from 'react';
import { Sidebar } from './components/Sidebar';
import { Terminal } from './components/Terminal';
import { ResourceMetrics } from './components/ResourceMetrics';
import { AgentPanel } from './components/AgentPanel';
import { MetricChart } from './components/MetricChart';
import { BoxSelect } from 'lucide-react';

export default function App() {
  return (
    <div className="flex h-screen w-full bg-slate-950 text-slate-200 overflow-hidden font-sans">
      <Sidebar />
      
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">
        {/* Top Header */}
        <header className="h-16 border-b border-slate-800 flex items-center px-6 justify-between bg-slate-950/80 backdrop-blur-md shrink-0">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-white flex items-center gap-2">
              <BoxSelect className="w-5 h-5 text-indigo-400"/>
              Serverless Control Plane
            </h1>
            <p className="text-xs text-slate-400">AWS Region: us-west-2 // Managed by MCP Agent</p>
          </div>
          
          <div className="flex gap-4">
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Total Services</span>
              <span className="text-sm font-mono text-slate-200 font-medium">4 Active</span>
            </div>
            <div className="flex flex-col items-end border-l border-slate-800 pl-4">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Drift Status</span>
              <span className="text-sm font-mono text-emerald-400 font-medium tracking-tight">0% Drift</span>
            </div>
            <div className="flex flex-col items-end border-l border-slate-800 pl-4">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Last Apply</span>
              <span className="text-sm font-mono text-slate-200 font-medium">Just now</span>
            </div>
          </div>
        </header>

        {/* Dashboard Grid layout */}
        <div className="flex-1 p-6 overflow-y-auto overflow-x-hidden min-h-0 bg-slate-950">
          <div className="max-w-[1600px] mx-auto w-full h-full flex flex-col gap-6">
            
            {/* Top row: Metrics and Resources */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 shrink-0 h-72">
              <div className="lg:col-span-2">
                <MetricChart />
              </div>
              <div className="lg:col-span-1">
                <ResourceMetrics />
              </div>
            </div>
            
            {/* Bottom Row: AI MCP Agent Panel and Real-time Terminal */}
            <div className="flex-1 min-h-[300px] grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 border border-indigo-500/10 rounded-xl relative">
                {/* Visual glow behind agent panel */}
                <div className="absolute inset-0 bg-indigo-500/5 blur-3xl pointer-events-none rounded-xl"></div>
                <AgentPanel />
              </div>
              
              <div className="lg:col-span-2">
                <Terminal />
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}

