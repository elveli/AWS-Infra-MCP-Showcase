import React from 'react';
import { LayoutDashboard, Database, ActivitySquare, Settings, Workflow, CloudCog } from 'lucide-react';

export function Sidebar() {
  return (
    <aside className="w-16 lg:w-64 border-r border-slate-800 bg-slate-950 flex flex-col items-center lg:items-stretch overflow-hidden transition-all duration-300 z-10 shrink-0">
      <div className="h-16 flex items-center justify-center lg:justify-start lg:px-6 border-b border-slate-800 shrink-0">
        <CloudCog className="w-7 h-7 text-emerald-500 shrink-0" />
        <span className="hidden lg:block ml-3 font-semibold text-slate-100 tracking-tight">AI Infra MCP</span>
      </div>
      
      <nav className="flex-1 py-6 flex flex-col gap-2 w-full px-2 lg:px-4">
        {[
          { icon: LayoutDashboard, label: 'Dashboard', active: true },
          { icon: Database, label: 'Resources (TF)' },
          { icon: Workflow, label: 'Automations' },
          { icon: ActivitySquare, label: 'Active Streams' },
        ].map((item, i) => (
          <button 
            key={i}
            className={`flex items-center justify-center lg:justify-start gap-3 w-full p-3 rounded-lg transition-colors group ${
              item.active ? 'bg-indigo-500/10 text-indigo-400' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
            }`}
          >
            <item.icon className="w-5 h-5 shrink-0" />
            <span className="hidden lg:block text-sm font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800 w-full mb-2">
         <button className="flex items-center justify-center lg:justify-start gap-3 w-full p-2 rounded-lg text-slate-400 hover:bg-slate-900 transition-colors group">
            <Settings className="w-5 h-5 shrink-0" />
            <span className="hidden lg:block text-sm font-medium">Settings</span>
          </button>
      </div>
    </aside>
  );
}
