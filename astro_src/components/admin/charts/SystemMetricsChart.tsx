import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useSettings } from '@context/SettingsContext';



export const SystemMetricsChart = () => {
    const { t } = useSettings();

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm mb-6">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-6">
                {t.admin?.metrics || 'System Metrics'}
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="h-64">
                    <h4 className="text-sm font-medium text-slate-500 mb-4">{t.admin?.cpuUsage || 'CPU Usage'} (%)</h4>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={[]}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} vertical={false} />
                            <XAxis dataKey="time" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc' }}
                                itemStyle={{ color: '#818cf8' }}
                            />
                            <Line type="monotone" dataKey="cpu" stroke="#818cf8" strokeWidth={3} dot={{ r: 4, fill: '#818cf8' }} activeDot={{ r: 6 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div className="h-64">
                    <h4 className="text-sm font-medium text-slate-500 mb-4">{t.admin?.ramUsage || 'RAM Usage'} (%)</h4>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={[]}>
                            <defs>
                                <linearGradient id="colorRam" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} vertical={false} />
                            <XAxis dataKey="time" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc' }}
                                itemStyle={{ color: '#10b981' }}
                            />
                            <Area type="monotone" dataKey="ram" stroke="#10b981" fillOpacity={1} fill="url(#colorRam)" strokeWidth={3} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};
