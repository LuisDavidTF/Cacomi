import React, { useState, useEffect, useRef } from 'react';
import { useSettings } from '@context/SettingsContext';

/**
 * ServerLogViewer
 * A mock component that simulates streaming server logs from Koyeb.
 */
export const ServerLogViewer = () => {
    const { t } = useSettings();
    const [logs, setLogs] = useState<string[]>([]);
    const [isPaused, setIsPaused] = useState(false);
    const endOfLogsRef = useRef<HTMLDivElement>(null);

    const mockLogLines = [
        '[INFO] Application started successfully on port 8080',
        '[WARN] Memory usage approaching 70%',
        '[INFO] Database connection pool initialized with 10 connections',
        '[DEBUG] Triggered cleanup job for expired sessions',
        '[INFO] Incoming request to /api/v1/recipes',
        '[ERROR] Failed to fetch external recipe data (timeout)',
        '[INFO] User luisedgar authenticated successfully',
        '[INFO] Worker thread #3 finished processing background tasks'
    ];

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (!isPaused) {
            interval = setInterval(() => {
                setLogs(prev => {
                    const nextLine = `${new Date().toISOString()} ${mockLogLines[Math.floor(Math.random() * mockLogLines.length)]}`;
                    const newLogs = [...prev, nextLine];
                    if (newLogs.length > 100) newLogs.shift();
                    return newLogs;
                });
            }, 1500);
        }

        return () => clearInterval(interval);
    }, [isPaused]);

    useEffect(() => {
        if (!isPaused) {
            endOfLogsRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [logs, isPaused]);

    return (
        <div className="bg-[#0A0A0A] border border-slate-700/50 rounded-xl overflow-hidden shadow-2xl flex flex-col h-[600px]">
            {/* Header controls */}
            <div className="bg-[#171717] px-4 py-3 border-b border-slate-700/50 flex justify-between items-center">
                <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <span className="font-mono text-sm text-slate-300 ml-4">{t.admin?.serverLogs || 'Server Logs'} - proxy_koyeb/sys</span>
                </div>
                <div className="flex space-x-3">
                    <button 
                        onClick={() => setIsPaused(!isPaused)}
                        className={`text-xs px-3 py-1.5 rounded transition bg-slate-800 text-slate-300 hover:text-white ${isPaused ? 'border-amber-500/50 border' : ''}`}
                    >
                        {isPaused ? 'Resume' : 'Pause'}
                    </button>
                    <button 
                        onClick={() => setLogs([])}
                        className="text-xs px-3 py-1.5 rounded transition bg-slate-800 text-slate-300 hover:text-white"
                    >
                        Clear
                    </button>
                </div>
            </div>

            {/* Logs Area */}
            <div className="flex-1 overflow-y-auto p-4 font-mono text-xs leading-relaxed text-slate-300 scrollbar-thin scrollbar-thumb-slate-700">
                {logs.length === 0 ? (
                    <div className="text-slate-500 italic">Waiting for incoming logs...</div>
                ) : (
                    logs.map((log, index) => {
                        let colorClass = 'text-slate-300';
                        if (log.includes('[ERROR]')) colorClass = 'text-red-400 font-semibold';
                        if (log.includes('[WARN]')) colorClass = 'text-yellow-400';
                        if (log.includes('[DEBUG]')) colorClass = 'text-slate-500';

                        return (
                            <div key={index} className={`break-words ${colorClass}`}>
                                {log}
                            </div>
                        );
                    })
                )}
                <div ref={endOfLogsRef} />
            </div>
        </div>
    );
};
