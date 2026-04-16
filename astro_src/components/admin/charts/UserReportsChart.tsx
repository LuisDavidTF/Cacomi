import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useSettings } from '@context/SettingsContext';

const reportData = [
  { reason: 'Spam', count: 12 },
  { reason: 'Inappropriate', count: 5 },
  { reason: 'Copyright', count: 2 },
  { reason: 'Harassment', count: 8 },
  { reason: 'Other', count: 4 }
];

export const UserReportsChart = () => {
    const { t } = useSettings();

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-6">
                User Reports Overview
            </h3>
            
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={reportData} layout="vertical" margin={{ left: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} horizontal={false} />
                        <XAxis type="number" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis dataKey="reason" type="category" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip 
                            cursor={{ fill: 'transparent' }}
                            contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc' }}
                            itemStyle={{ color: '#f43f5e' }}
                        />
                        <Bar dataKey="count" fill="#f43f5e" radius={[0, 4, 4, 0]} barSize={20} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
