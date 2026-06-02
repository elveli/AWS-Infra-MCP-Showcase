import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { MetricPoint } from '../types';
import { Activity } from 'lucide-react';

export function MetricChart() {
  const [metrics, setMetrics] = useState<MetricPoint[]>([]);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await fetch('/api/metrics');
        const data = await res.json();
        setMetrics(data);
      } catch (err) {}
    };
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col h-full min-h-[220px]">
       <div className="flex items-center gap-2 mb-4">
        <Activity className="w-4 h-4 text-blue-400" />
        <h3 className="text-sm font-medium text-slate-300 font-sans tracking-tight">API Traffic (Events/sec)</h3>
      </div>
      
      <div className="flex-1 w-full -ml-4 mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={metrics}>
            <defs>
              <linearGradient id="colorTraffic" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis dataKey="time" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
            <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} width={40} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', fontSize: '12px' }}
              itemStyle={{ color: '#94a3b8' }}
              labelStyle={{ color: '#cbd5e1', marginBottom: '4px' }}
            />
            <Area 
              type="monotone" 
              dataKey="apiRequests" 
              stroke="#3b82f6" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorTraffic)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
